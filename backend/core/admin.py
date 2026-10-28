from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Technician, Aircraft, AircraftComponent,
    Maintenance, WorkOrder, WorkOrderTask,
    SparePart, InventoryTransaction, MaintenanceRecord
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Aviation Profile', {'fields': ('role', 'phone')}),
    )
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser']


@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'full_name', 'specialization', 'certification', 'status', 'phone']
    list_filter = ['specialization', 'status']
    search_fields = ['first_name', 'last_name', 'employee_id']


class AircraftComponentInline(admin.TabularInline):
    model = AircraftComponent
    extra = 0


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'model', 'manufacturer', 'status', 'flight_hours', 'flight_cycles', 'next_maintenance']
    list_filter = ['status', 'manufacturer']
    search_fields = ['registration_number', 'model', 'serial_number']
    inlines = [AircraftComponentInline]


@admin.register(AircraftComponent)
class AircraftComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'component_id', 'aircraft', 'component_type', 'status', 'condition_score', 'assigned_technician']
    list_filter = ['component_type', 'status']
    search_fields = ['name', 'component_id', 'aircraft__registration_number']


class WorkOrderTaskInline(admin.TabularInline):
    model = WorkOrderTask
    extra = 1


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = ['work_order_number', 'title', 'aircraft', 'priority', 'status', 'assigned_technician', 'created_at']
    list_filter = ['status', 'priority']
    search_fields = ['work_order_number', 'title', 'aircraft__registration_number']
    inlines = [WorkOrderTaskInline]


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ['maintenance_type', 'aircraft', 'priority', 'status', 'due_date', 'assigned_technician']
    list_filter = ['maintenance_type', 'status', 'priority']
    search_fields = ['aircraft__registration_number', 'description']


@admin.register(SparePart)
class SparePartAdmin(admin.ModelAdmin):
    list_display = ['part_number', 'name', 'category', 'quantity_in_stock', 'minimum_stock', 'is_low_stock', 'location']
    list_filter = ['category']
    search_fields = ['part_number', 'name', 'supplier']


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['spare_part', 'transaction_type', 'quantity', 'work_order', 'created_at']
    list_filter = ['transaction_type']


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ['record_number', 'aircraft', 'maintenance_type', 'completed_date', 'technician']
    search_fields = ['record_number', 'aircraft__registration_number']
