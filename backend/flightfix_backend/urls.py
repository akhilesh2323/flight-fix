from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "system": "FlightFix - Aircraft Maintenance & MRO Management API Gateway",
        "status": "ONLINE",
        "version": "1.0.0",
        "telemetry": "Active",
        "endpoints": {
            "admin_portal": "/admin/",
            "auth_login": "/api/auth/login/",
            "dashboard_stats": "/api/dashboard/stats/",
            "aircraft_fleet": "/api/aircraft/",
            "maintenance_schedules": "/api/maintenance/",
            "work_orders": "/api/work-orders/",
            "technicians": "/api/technicians/",
            "spare_parts": "/api/spare-parts/",
            "reports": "/api/reports/data/"
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
