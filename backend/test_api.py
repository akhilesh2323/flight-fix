import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flightfix_backend.settings')
django.setup()

from rest_framework.test import APIClient
from core.models import User, Aircraft, WorkOrder, SparePart

def test_flightfix():
    client = APIClient()

    # 1. Test Login
    login_res = client.post('/api/auth/login/', {'username': 'admin', 'password': 'admin123'}, format='json')
    assert login_res.status_code == 200, f"Login failed: {login_res.data}"
    token = login_res.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    print("[OK] JWT Authentication Successful! Token acquired.")

    # 2. Test Current User
    user_res = client.get('/api/auth/me/')
    assert user_res.status_code == 200, f"Auth me failed: {user_res.data}"
    print(f"[OK] Authenticated Operator: {user_res.data['username']} ({user_res.data['role']})")

    # 3. Test Dashboard Stats
    dash_res = client.get('/api/dashboard/stats/')
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.data}"
    metrics = dash_res.data['metrics']
    print(f"[OK] Dashboard Stats API: {metrics['total_aircraft']} Aircraft, {metrics['open_work_orders']} Open WOs, {metrics['low_stock_parts']} Low Stock Alerts")

    # 4. Test Aircraft List & 3D Components
    aircraft_res = client.get('/api/aircraft/')
    assert aircraft_res.status_code == 200, f"Aircraft list failed: {aircraft_res.data}"
    print(f"[OK] Aircraft API: {len(aircraft_res.data)} aircraft registered")

    first_aircraft_id = aircraft_res.data[0]['id']
    comp_res = client.get(f'/api/aircraft/{first_aircraft_id}/components/')
    assert comp_res.status_code == 200, f"Components failed: {comp_res.data}"
    print(f"[OK] Aircraft 3D Components API: {len(comp_res.data)} components installed on {aircraft_res.data[0]['registration_number']}")

    # 5. Test Work Orders
    wo_res = client.get('/api/work-orders/')
    assert wo_res.status_code == 200, f"Work orders failed: {wo_res.data}"
    print(f"[OK] Work Orders API: {len(wo_res.data)} work orders on roster")

    # 6. Test Spare Parts
    part_res = client.get('/api/spare-parts/')
    assert part_res.status_code == 200, f"Spare parts failed: {part_res.data}"
    print(f"[OK] Spare Parts Inventory API: {len(part_res.data)} part numbers tracked")

    # 7. Test Reports API
    rep_res = client.get('/api/reports/data/')
    assert rep_res.status_code == 200, f"Reports failed: {rep_res.data}"
    print(f"[OK] Regulatory & MRO Reports API: Completion rate {rep_res.data['work_order_metrics']['completion_rate_percentage']}%")

    print("\nALL FLIGHTFIX BACKEND APIS FUNCTIONING WITH 100% SUCCESS!")

if __name__ == '__main__':
    test_flightfix()
