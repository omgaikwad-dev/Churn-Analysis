import json
import io
import os
import sys
import uuid
import httpx
from fastapi.testclient import TestClient
from app.main import app

def test_full_journey(client=None):
    if client is None:
        client = TestClient(app)
    print("========================================")
    print("CHURNGUARD AI - FULL WORKFLOW TEST")
    print("========================================")
    
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. System Health Check:", res.json())

    import uuid
    run_id = uuid.uuid4().hex[:6]
    user_email = f"test.journey.{run_id}@churnguard.ai"
    reg_payload = {
        "full_name": "Dr. Eleanor Vance",
        "email": user_email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    if res.status_code == 400 and "already registered" in res.text:
        print("[INFO] User already registered, proceeding to login.")
    else:
        assert res.status_code == 201, f"Registration failed: {res.text}"
        print("[PASS] 2. User Registration successful for:", reg_payload["email"])

    # 3. Login
    login_payload = {
        "email": user_email,
        "password": "SecurePassword123!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    if res.status_code != 200:
        # maybe password was changed in previous run, try with updated password
        login_payload["password"] = "NewSecurePassword456!"
        res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    auth_data = res.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] 3. Login successful. Received JWT token.")

    # 4. Verify /me
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200, f"Get current user failed: {res.text}"
    user_profile = res.json()
    assert user_profile["email"] == user_email
    print(f"[PASS] 4. Verified current user profile: {user_profile['full_name']} ({user_profile['email']})")

    # 5. Single Customer Prediction
    single_customer = {
        "customer_identifier": "CUST-E2E-779",
        "tenure": 14.0,
        "monthly_charges": 89.5,
        "contract_type": 0,
        "support_calls": 3
    }
    res = client.post("/api/v1/predictions/single", headers=headers, json=single_customer)
    assert res.status_code == 200, f"Single prediction failed: {res.text}"
    pred_result = res.json()
    print(f"[PASS] 5. Single Prediction Generated:")
    print(f"       Churn Probability: {pred_result['churn_probability'] * 100:.1f}%")
    print(f"       Risk Category: {pred_result['risk_category']}")
    print(f"       Predicted Class: {pred_result['predicted_class']}")
    print(f"       Model Version: {pred_result['model_version']}")
    print(f"       Feature Importance: {pred_result['feature_importance']}")

    # 6. Customer Record CRUD
    cust_payload = {
        "customer_identifier": "CUST-E2E-779",
        "tenure": 14.0,
        "monthly_charges": 89.5,
        "contract_type": 0,
        "support_calls": 3,
        "total_charges": 1253.0,
        "internet_service": "Fiber optic",
        "payment_method": "Electronic check"
    }
    res = client.post("/api/v1/customers", headers=headers, json=cust_payload)
    assert res.status_code == 201, f"Customer creation failed: {res.text}"
    created_cust = res.json()
    cust_id = created_cust["id"]
    print(f"[PASS] 6. Created customer record with ID: {cust_id} (External: {created_cust['customer_identifier']})")

    # Fetch customer list
    res = client.get("/api/v1/customers", headers=headers)
    assert res.status_code == 200
    customers = res.json()
    print(f"[PASS]    Retrieved {customers['total']} customers for current user.")

    # 7. Dataset Upload & Validation
    csv_sample = (
        "customerID,tenure,MonthlyCharges,Contract,TotalCharges,Churn,SupportCalls\n"
        "CUST-001,1,29.85,Month-to-month,29.85,No,1\n"
        "CUST-002,34,56.95,One year,1889.5,No,0\n"
        "CUST-003,2,53.85,Month-to-month,108.15,Yes,4\n"
        "CUST-004,45,42.3,One year,1840.75,No,1\n"
        "CUST-005,2,70.7,Month-to-month,151.65,Yes,5\n"
    )
    files = {"file": ("test_batch_customers.csv", csv_sample.encode("utf-8"), "text/csv")}
    res = client.post("/api/v1/datasets/upload", headers=headers, files=files)
    assert res.status_code == 201, f"Dataset upload failed: {res.text}"
    dataset_info = res.json()
    dataset_id = dataset_info["id"]
    print(f"[PASS] 7. Dataset Uploaded (ID: {dataset_id}): {dataset_info['display_name']}, {dataset_info['row_count']} rows, status: {dataset_info['validation_status']}")

    # 8. Batch Predictions using uploaded dataset
    batch_payload = {"dataset_id": dataset_id}
    res = client.post("/api/v1/predictions/batch", headers=headers, json=batch_payload)
    assert res.status_code == 200, f"Batch prediction failed: {res.text}"
    batch_res = res.json()
    print(f"[PASS] 8. Batch Predictions processed ({batch_res['total_processed']} rows):")
    print(f"       High Risk: {batch_res['high_risk_count']}, Med: {batch_res['medium_risk_count']}, Low: {batch_res['low_risk_count']}")
    for item in batch_res["items"][:3]:
        print(f"       Sample {item['customer_identifier']} -> Risk: {item['risk_category']}, Prob: {item['churn_probability']*100:.1f}%")

    # 9. Analytics Overview
    res = client.get("/api/v1/analytics/overview", headers=headers)
    assert res.status_code == 200, f"Analytics overview failed: {res.text}"
    analytics = res.json()
    print(f"[PASS] 9. Analytics Overview retrieved:")
    print(f"       Total Predictions: {analytics['total_predictions']}")
    print(f"       Avg Churn Probability: {analytics['avg_churn_probability'] * 100:.1f}%")
    print(f"       High Risk: {analytics['risk_distribution']['high_risk']}, Medium Risk: {analytics['risk_distribution']['medium_risk']}, Low Risk: {analytics['risk_distribution']['low_risk']}")

    # 10. Monitoring Drift Detection
    res = client.get("/api/v1/monitoring/drift", headers=headers)
    assert res.status_code == 200, f"Drift status failed: {res.text}"
    drift_data = res.json()
    print(f"[PASS] 10. Drift Monitoring Report:")
    print(f"        Status: {drift_data['status']}")
    print(f"        Drift Detected: {drift_data['drift_detected']}")
    print(f"        Message: {drift_data['message']}")

    # 11. Export Predictions CSV
    res = client.get("/api/v1/exports/predictions", headers=headers)
    assert res.status_code == 200, f"Export predictions failed: {res.text}"
    csv_content = res.text
    lines = csv_content.strip().split("\n")
    print(f"[PASS] 11. Prediction Export CSV retrieved: {len(lines)} lines (including header).")

    # 12. Model Retraining with Verified Pipeline (Train Random Forest)
    train_payload = {
        "model_type": "Random Forest",
        "description": "Enterprise RF verification test"
    }
    res = client.post("/api/v1/models/train", headers=headers, json=train_payload)
    assert res.status_code == 201, f"Model training failed: {res.text}"
    new_model = res.json()
    print(f"[PASS] 12. Trained New Model:")
    print(f"        Model Type: {new_model['model_type']}")
    print(f"        Version: v{new_model['model_version']}")
    eval_m = new_model.get("evaluation_metrics", {})
    print(f"        Accuracy: {eval_m.get('accuracy')}")
    print(f"        ROC-AUC: {eval_m.get('roc_auc')}")
    print(f"        F1 Score: {eval_m.get('f1_score')}")

    # 13. Password Change
    pwd_payload = {
        "current_password": login_payload["password"],
        "new_password": "NewSecurePassword456!",
        "confirm_new_password": "NewSecurePassword456!"
    }
    res = client.post("/api/v1/auth/change-password", headers=headers, json=pwd_payload)
    assert res.status_code == 200, f"Password change failed: {res.text}"
    print(f"[PASS] 13. Password successfully updated.")

    # 14. Verify login with new password
    new_login = {
        "email": user_email,
        "password": "NewSecurePassword456!"
    }
    res = client.post("/api/v1/auth/login", json=new_login)
    assert res.status_code == 200, f"Login with new password failed: {res.text}"
    print(f"[PASS] 14. Verified login with newly updated credentials.")

    print("\n========================================")
    print("ALL 14 END-TO-END WORKFLOW CHECKS PASSED!")
    print("========================================")

if __name__ == "__main__":
    test_full_journey()
