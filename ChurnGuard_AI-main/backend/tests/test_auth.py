def test_register_and_login(client):
    # 1. Register
    reg_payload = {
        "full_name": "Test Engineer",
        "email": "engineer@churnguard.ai",
        "password": "SecurePassword123!",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "engineer@churnguard.ai"

    # 2. Duplicate registration rejected
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"]

    # 3. Login with valid credentials
    login_payload = {
        "email": "engineer@churnguard.ai",
        "password": "SecurePassword123!",
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token

    # 4. Login with invalid password
    bad_login = {
        "email": "engineer@churnguard.ai",
        "password": "WrongPassword!",
    }
    res_bad = client.post("/api/v1/auth/login", json=bad_login)
    assert res_bad.status_code == 401

    # 5. Access /me with token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["full_name"] == "Test Engineer"

    # 6. Change password
    chg_payload = {
        "current_password": "SecurePassword123!",
        "new_password": "BrandNewPassword2026!",
    }
    res_chg = client.post("/api/v1/auth/change-password", json=chg_payload, headers=headers)
    assert res_chg.status_code == 200

    # 7. Login with old password fails
    res_old = client.post("/api/v1/auth/login", json=login_payload)
    assert res_old.status_code == 401

    # 8. Login with new password succeeds
    login_payload["password"] = "BrandNewPassword2026!"
    res_new = client.post("/api/v1/auth/login", json=login_payload)
    assert res_new.status_code == 200
