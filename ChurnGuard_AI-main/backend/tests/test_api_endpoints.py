import io

def test_protected_routes_require_auth(client):
    res = client.get("/api/v1/customers")
    assert res.status_code == 401

    res = client.get("/api/v1/datasets")
    assert res.status_code == 401

    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 401

def test_customer_crud_and_predictions(client):
    # Register & Login
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "API User", "email": "api@churnguard.ai", "password": "Password123!"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "api@churnguard.ai", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Customer
    cust_data = {
        "customer_identifier": "CUST-9999",
        "tenure": 24.0,
        "monthly_charges": 65.5,
        "contract_type": 1,
        "support_calls": 2,
    }
    create_res = client.post("/api/v1/customers", json=cust_data, headers=headers)
    assert create_res.status_code == 201
    cust_id = create_res.json()["id"]

    # 2. List Customers
    list_res = client.get("/api/v1/customers", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 3. Single Prediction
    pred_data = {
        "customer_id": cust_id,
        "tenure": 24.0,
        "monthly_charges": 65.5,
        "contract_type": 1,
        "support_calls": 2,
    }
    pred_res = client.post("/api/v1/predictions/single", json=pred_data, headers=headers)
    assert pred_res.status_code == 200
    p_json = pred_res.json()
    assert "churn_probability" in p_json
    assert p_json["risk_category"] in ("Low Risk", "Medium Risk", "High Risk")
    assert "feature_importance" in p_json

    # 4. Check Analytics Overview
    analytics_res = client.get("/api/v1/analytics/overview", headers=headers)
    assert analytics_res.status_code == 200
    a_json = analytics_res.json()
    assert a_json["total_customers"] >= 1
    assert a_json["total_predictions"] >= 1

    # 5. Check Monitoring Drift
    drift_res = client.get("/api/v1/monitoring/drift", headers=headers)
    assert drift_res.status_code == 200
    assert "drift_detected" in drift_res.json()

    # 6. Upload CSV Dataset
    csv_content = b"customerID,tenure,MonthlyCharges,Contract,SupportCalls,Churn\nCUST-1,12,70.5,Month-to-month,1,No\nCUST-2,2,95.0,Month-to-month,4,Yes\nCUST-3,48,35.0,Two year,0,No\n"
    files = {"file": ("test_upload.csv", io.BytesIO(csv_content), "text/csv")}
    upload_res = client.post("/api/v1/datasets/upload", files=files, headers=headers)
    assert upload_res.status_code == 201
    assert upload_res.json()["row_count"] == 3

    # 7. Health endpoints
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"
