from rest_framework import serializers
from .models import (
    User, Technician, Aircraft, AircraftComponent,
    Maintenance, WorkOrder, WorkOrderTask,
    SparePart, InventoryTransaction, MaintenanceRecord
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        read_only_fields = ['id']


class TechnicianSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    open_work_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Technician
        fields = [
            'id', 'user', 'employee_id', 'first_name', 'last_name',
            'full_name', 'certification', 'specialization', 'phone',
            'status', 'created_at', 'open_work_orders_count'
        ]

    def get_open_work_orders_count(self, obj):
        return obj.work_orders.exclude(status__in=['COMPLETED', 'CANCELLED']).count()


class WorkOrderTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkOrderTask
        fields = ['id', 'work_order', 'description', 'is_completed', 'completed_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'completed_at']


class AircraftComponentSerializer(serializers.ModelSerializer):
    assigned_technician_name = serializers.ReadOnlyField(source='assigned_technician.full_name')
    aircraft_registration = serializers.ReadOnlyField(source='aircraft.registration_number')
    related_work_orders = serializers.SerializerMethodField()

    class Meta:
        model = AircraftComponent
        fields = [
            'id', 'aircraft', 'aircraft_registration', 'name',
            'component_type', 'component_id', 'status', 'condition_score',
            'last_inspection', 'next_inspection', 'assigned_technician',
            'assigned_technician_name', 'related_work_orders', 'created_at', 'updated_at'
        ]

    def get_related_work_orders(self, obj):
        wos = obj.work_orders.exclude(status='CANCELLED').order_by('-created_at')[:5]
        return [
            {
                'id': wo.id,
                'work_order_number': wo.work_order_number,
                'title': wo.title,
                'status': wo.status,
                'priority': wo.priority,
                'created_at': wo.created_at
            }
            for wo in wos
        ]


class AircraftListSerializer(serializers.ModelSerializer):
    open_work_orders_count = serializers.SerializerMethodField()
    components_status_summary = serializers.SerializerMethodField()

    class Meta:
        model = Aircraft
        fields = [
            'id', 'registration_number', 'model', 'manufacturer',
            'serial_number', 'flight_hours', 'flight_cycles', 'status',
            'last_maintenance', 'next_maintenance', 'created_at', 'updated_at',
            'open_work_orders_count', 'components_status_summary'
        ]

    def get_open_work_orders_count(self, obj):
        return obj.work_orders.exclude(status__in=['COMPLETED', 'CANCELLED']).count()

    def get_components_status_summary(self, obj):
        comps = obj.components.all()
        return {
            'total': comps.count(),
            'operational': comps.filter(status='OPERATIONAL').count(),
            'maintenance_due': comps.filter(status='MAINTENANCE_DUE').count(),
            'under_maintenance': comps.filter(status='UNDER_MAINTENANCE').count(),
            'warning': comps.filter(status='WARNING').count(),
        }


class AircraftDetailSerializer(serializers.ModelSerializer):
    components = AircraftComponentSerializer(many=True, read_only=True)
    open_work_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Aircraft
        fields = [
            'id', 'registration_number', 'model', 'manufacturer',
            'serial_number', 'flight_hours', 'flight_cycles', 'status',
            'last_maintenance', 'next_maintenance', 'created_at', 'updated_at',
            'components', 'open_work_orders_count'
        ]

    def get_open_work_orders_count(self, obj):
        return obj.work_orders.exclude(status__in=['COMPLETED', 'CANCELLED']).count()


class MaintenanceSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.ReadOnlyField(source='aircraft.registration_number')
    aircraft_model = serializers.ReadOnlyField(source='aircraft.model')
    assigned_technician_name = serializers.ReadOnlyField(source='assigned_technician.full_name')

    class Meta:
        model = Maintenance
        fields = [
            'id', 'aircraft', 'aircraft_registration', 'aircraft_model',
            'maintenance_type', 'priority', 'status', 'scheduled_date',
            'due_date', 'completed_date', 'assigned_technician',
            'assigned_technician_name', 'description', 'created_at', 'updated_at'
        ]


class InventoryTransactionSerializer(serializers.ModelSerializer):
    part_name = serializers.ReadOnlyField(source='spare_part.name')
    part_number = serializers.ReadOnlyField(source='spare_part.part_number')
    work_order_number = serializers.ReadOnlyField(source='work_order.work_order_number')

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'spare_part', 'part_name', 'part_number',
            'work_order', 'work_order_number', 'transaction_type',
            'quantity', 'notes', 'created_at'
        ]


class WorkOrderSerializer(serializers.ModelSerializer):
    tasks = WorkOrderTaskSerializer(many=True, read_only=True)
    part_usages = InventoryTransactionSerializer(many=True, read_only=True)
    aircraft_registration = serializers.ReadOnlyField(source='aircraft.registration_number')
    aircraft_model = serializers.ReadOnlyField(source='aircraft.model')
    component_name = serializers.ReadOnlyField(source='component.name')
    assigned_technician_name = serializers.ReadOnlyField(source='assigned_technician.full_name')

    class Meta:
        model = WorkOrder
        fields = [
            'id', 'work_order_number', 'maintenance', 'aircraft',
            'aircraft_registration', 'aircraft_model', 'component',
            'component_name', 'title', 'description', 'priority',
            'status', 'assigned_technician', 'assigned_technician_name',
            'notes', 'created_at', 'updated_at', 'completed_at',
            'tasks', 'part_usages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SparePartSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = SparePart
        fields = [
            'id', 'part_number', 'name', 'category', 'quantity_in_stock',
            'minimum_stock', 'unit_cost', 'supplier', 'location',
            'created_at', 'is_low_stock'
        ]


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.ReadOnlyField(source='aircraft.registration_number')
    technician_name = serializers.ReadOnlyField(source='technician.full_name')

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'record_number', 'aircraft', 'aircraft_registration',
            'work_order', 'maintenance_type', 'completed_date',
            'technician', 'technician_name', 'findings', 'actions_taken',
            'flight_hours_at_maintenance', 'created_at'
        ]
