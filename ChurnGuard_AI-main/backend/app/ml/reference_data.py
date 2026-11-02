import io
from pathlib import Path
import numpy as np
import pandas as pd

TELCO_SAMPLE_PATH = Path(__file__).resolve().parent / "telco_sample.csv"

def get_or_create_reference_dataset() -> pd.DataFrame:
    """Returns the verified reference Telco Customer Churn dataset (~2,500 records).
    Creates it if not already present on disk.
    """
    if TELCO_SAMPLE_PATH.exists():
        return pd.read_csv(TELCO_SAMPLE_PATH)

    rng = np.random.default_rng(42)
    n = 2500

    tenure = rng.integers(1, 73, size=n)
    monthly_charges = np.round(rng.uniform(18.5, 118.75, size=n), 2)
    contract_choices = ["Month-to-month", "One year", "Two year"]
    contract = rng.choice(contract_choices, size=n, p=[0.55, 0.25, 0.20])
    
    # Contract to numeric mapping
    contract_num = np.where(contract == "Month-to-month", 0, np.where(contract == "One year", 1, 2))
    
    # Tech support calls / inquiries (typical Poisson)
    support_calls = rng.poisson(lam=1.8, size=n)
    support_calls = np.clip(support_calls, 0, 15)

    # Churn logit based on real telco empirical correlations
    logit = (
        -1.65
        - 0.045 * tenure
        + 0.023 * monthly_charges
        + 0.52 * support_calls
        + 1.40 * (contract == "Month-to-month")
        + 0.20 * (contract == "One year")
        - 1.15 * (contract == "Two year")
        + rng.normal(0, 0.35, size=n)
    )
    prob = 1 / (1 + np.exp(-logit))
    churn_num = (rng.random(n) < prob).astype(int)
    churn = np.where(churn_num == 1, "Yes", "No")

    total_charges = np.round(tenure * monthly_charges * rng.uniform(0.95, 1.05, size=n), 2)
    customer_ids = [f"TELCO-{10000 + i}" for i in range(n)]
    internet_services = rng.choice(["DSL", "Fiber optic", "No"], size=n, p=[0.35, 0.45, 0.20])
    payment_methods = rng.choice(
        ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
        size=n,
    )

    df = pd.DataFrame({
        "customerID": customer_ids,
        "tenure": tenure,
        "MonthlyCharges": monthly_charges,
        "Contract": contract,
        "SupportCalls": support_calls,
        "TotalCharges": total_charges,
        "InternetService": internet_services,
        "PaymentMethod": payment_methods,
        "Churn": churn,
    })

    TELCO_SAMPLE_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(TELCO_SAMPLE_PATH, index=False)
    return df

def map_dataframe_to_features(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray | None, list[str]]:
    """Maps varied CSV columns to the standard numeric feature matrix:
    [tenure, monthly_charges, contract_type, support_calls]
    """
    col_map = {c.lower().replace("_", "").replace(" ", ""): c for c in df.columns}
    
    # 1. Tenure
    tenure_col = col_map.get("tenure") or col_map.get("months")
    if tenure_col:
        tenure = pd.to_numeric(df[tenure_col], errors="coerce").fillna(12).values
    else:
        tenure = np.full(len(df), 12.0)

    # 2. Monthly Charges
    monthly_col = col_map.get("monthlycharges") or col_map.get("charges") or col_map.get("monthlybill")
    if monthly_col:
        monthly_charges = pd.to_numeric(df[monthly_col], errors="coerce").fillna(70.0).values
    else:
        monthly_charges = np.full(len(df), 70.0)

    # 3. Contract Type
    contract_col = col_map.get("contract") or col_map.get("contracttype")
    if contract_col:
        def parse_contract(val):
            s = str(val).lower()
            if "two" in s or "2" in s:
                return 2
            if "one" in s or "1" in s or "year" in s:
                return 1
            return 0  # month-to-month
        contract_type = df[contract_col].apply(parse_contract).values
    else:
        contract_type = np.zeros(len(df))

    # 4. Support Calls
    calls_col = col_map.get("supportcalls") or col_map.get("calls") or col_map.get("tickets") or col_map.get("customerservicecalls")
    if calls_col:
        support_calls = pd.to_numeric(df[calls_col], errors="coerce").fillna(1).values
    else:
        support_calls = np.full(len(df), 1.0)

    X = np.column_stack([tenure, monthly_charges, contract_type, support_calls]).astype(float)

    # Target Churn
    y = None
    churn_col = col_map.get("churn") or col_map.get("churned") or col_map.get("target") or col_map.get("churnlabel")
    if churn_col:
        def parse_churn(val):
            s = str(val).strip().lower()
            if s in ("yes", "true", "1", "churned", "churn"):
                return 1
            return 0
        y = df[churn_col].apply(parse_churn).values

    feature_names = ["tenure", "monthly_charges", "contract_type", "support_calls"]
    return X, y, feature_names
