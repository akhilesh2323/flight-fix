from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView, current_user,
    AircraftViewSet, AircraftComponentViewSet,
    MaintenanceViewSet, WorkOrderViewSet,
    TechnicianViewSet, SparePartViewSet,
    InventoryTransactionViewSet, MaintenanceRecordViewSet,
    dashboard_stats, reports_data
)

router = DefaultRouter()
router.register(r'aircraft', AircraftViewSet, basename='aircraft')
router.register(r'components', AircraftComponentViewSet, basename='component')
router.register(r'maintenance', MaintenanceViewSet, basename='maintenance')
router.register(r'work-orders', WorkOrderViewSet, basename='work-order')
router.register(r'technicians', TechnicianViewSet, basename='technician')
router.register(r'spare-parts', SparePartViewSet, basename='spare-part')
router.register(r'inventory-transactions', InventoryTransactionViewSet, basename='inventory-transaction')
router.register(r'maintenance-records', MaintenanceRecordViewSet, basename='maintenance-record')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user, name='current_user'),

    # Analytics and Dashboard endpoints
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    path('reports/data/', reports_data, name='reports_data'),

    # Router endpoints
    path('', include(router.urls)),
]
