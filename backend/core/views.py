from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta, date
import uuid

from .models import (
    User, Technician, Aircraft, AircraftComponent,
    Maintenance, WorkOrder, WorkOrderTask,
    SparePart, InventoryTransaction, MaintenanceRecord
)
from .serializers import (
    UserSerializer, TechnicianSerializer,
    AircraftListSerializer, AircraftDetailSerializer,
    AircraftComponentSerializer, MaintenanceSerializer,
    WorkOrderSerializer, WorkOrderTaskSerializer,
    SparePartSerializer, InventoryTransactionSerializer,
    MaintenanceRecordSerializer
)
from .permissions import IsManagerOrAdmin, CanUpdateWorkOrder


# Custom JWT Login to return user details along with tokens
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class AircraftViewSet(viewsets.ModelViewSet):
    queryset = Aircraft.objects.all().prefetch_related('components')
    permission_classes = [IsManagerOrAdmin]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return AircraftDetailSerializer
        return AircraftListSerializer

    @action(detail=True, methods=['get'])
    def components(self, request, pk=None):
        aircraft = self.get_object()
        serializer = AircraftComponentSerializer(aircraft.components.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def maintenance_history(self, request, pk=None):
        aircraft = self.get_object()
        records = aircraft.maintenance_records.all().order_by('-completed_date')
        serializer = MaintenanceRecordSerializer(records, many=True)
        return Response(serializer.data)


class AircraftComponentViewSet(viewsets.ModelViewSet):
    queryset = AircraftComponent.objects.all().select_related('aircraft', 'assigned_technician')
    serializer_class = AircraftComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        aircraft_id = self.request.query_params.get('aircraft')
        component_type = self.request.query_params.get('type')
        if aircraft_id:
            qs = qs.filter(aircraft_id=aircraft_id)
        if component_type:
            qs = qs.filter(component_type=component_type)
        return qs


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().select_related('aircraft', 'assigned_technician')
    serializer_class = MaintenanceSerializer
    permission_classes = [IsManagerOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        aircraft_id = self.request.query_params.get('aircraft')
        if status_param:
            qs = qs.filter(status=status_param)
        if priority:
            qs = qs.filter(priority=priority)
        if aircraft_id:
            qs = qs.filter(aircraft_id=aircraft_id)
        return qs


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.all().select_related(
        'aircraft', 'component', 'assigned_technician', 'maintenance'
    ).prefetch_related('tasks', 'part_usages__spare_part')
    serializer_class = WorkOrderSerializer
    permission_classes = [CanUpdateWorkOrder]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        aircraft_id = self.request.query_params.get('aircraft')
        tech_id = self.request.query_params.get('technician')

        if status_param:
            qs = qs.filter(status=status_param)
        if priority:
            qs = qs.filter(priority=priority)
        if aircraft_id:
            qs = qs.filter(aircraft_id=aircraft_id)
        if tech_id:
            qs = qs.filter(assigned_technician_id=tech_id)
        return qs

    def perform_create(self, serializer):
        # Auto-generate work order number if not provided
        if not serializer.validated_data.get('work_order_number'):
            count = WorkOrder.objects.count() + 1
            wo_number = f"WO-{timezone.now().year}-{count:04d}"
            serializer.save(work_order_number=wo_number)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def add_task(self, request, pk=None):
        work_order = self.get_object()
        description = request.data.get('description', '').strip()
        if not description:
            return Response({'error': 'Task description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        task = WorkOrderTask.objects.create(work_order=work_order, description=description)
        return Response(WorkOrderTaskSerializer(task).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_task(self, request, pk=None):
        task_id = request.data.get('task_id')
        try:
            task = WorkOrderTask.objects.get(id=task_id, work_order_id=pk)
            task.is_completed = not task.is_completed
            task.save()
            return Response(WorkOrderTaskSerializer(task).data)
        except WorkOrderTask.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def use_part(self, request, pk=None):
        work_order = self.get_object()
        part_id = request.data.get('part_id')
        quantity = int(request.data.get('quantity', 1))
        notes = request.data.get('notes', f'Used in Work Order {work_order.work_order_number}')

        try:
            part = SparePart.objects.get(id=part_id)
            if part.quantity_in_stock < quantity:
                return Response(
                    {'error': f'Insufficient stock. Available: {part.quantity_in_stock}, Requested: {quantity}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            transaction = InventoryTransaction.objects.create(
                spare_part=part,
                work_order=work_order,
                transaction_type=InventoryTransaction.TransactionType.OUT,
                quantity=quantity,
                notes=notes
            )
            return Response(InventoryTransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
        except SparePart.DoesNotExist:
            return Response({'error': 'Spare part not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        work_order = self.get_object()
        work_order.status = WorkOrder.Status.COMPLETED
        work_order.completed_at = timezone.now()
        work_order.save()

        # Also create a MaintenanceRecord automatically for audit tracking
        record_number = f"MR-{timezone.now().year}-{MaintenanceRecord.objects.count() + 1:04d}"
        MaintenanceRecord.objects.create(
            record_number=record_number,
            aircraft=work_order.aircraft,
            work_order=work_order,
            maintenance_type=work_order.maintenance.get_maintenance_type_display() if work_order.maintenance else "Component Maintenance",
            completed_date=timezone.now().date(),
            technician=work_order.assigned_technician,
            findings=work_order.description,
            actions_taken=work_order.notes or "Work order completed according to MRO procedure.",
            flight_hours_at_maintenance=work_order.aircraft.flight_hours
        )

        # If linked to a component, update its status to OPERATIONAL
        if work_order.component:
            work_order.component.status = AircraftComponent.Status.OPERATIONAL
            work_order.component.condition_score = min(100, work_order.component.condition_score + 25)
            work_order.component.last_inspection = timezone.now().date()
            work_order.component.save()

        return Response(WorkOrderSerializer(work_order).data)


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all().prefetch_related('work_orders')
    serializer_class = TechnicianSerializer
    permission_classes = [permissions.IsAuthenticated]


class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        low_stock = self.request.query_params.get('low_stock')

        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(part_number__icontains=search) | Q(supplier__icontains=search))
        if low_stock in ['true', '1']:
            qs = [p for p in qs if p.is_low_stock]
            return qs
        return qs

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        part = self.get_object()
        delta = int(request.data.get('delta', 0))
        action_type = request.data.get('type', 'ADJUSTMENT')
        notes = request.data.get('notes', 'Manual Stock Adjustment')

        new_qty = max(0, part.quantity_in_stock + delta)
        part.quantity_in_stock = new_qty
        part.save()

        InventoryTransaction.objects.create(
            spare_part=part,
            transaction_type=action_type,
            quantity=abs(delta),
            notes=notes
        )

        return Response(SparePartSerializer(part).data)


class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryTransaction.objects.all().select_related('spare_part', 'work_order').order_by('-created_at')
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all().select_related('aircraft', 'technician').order_by('-completed_date')
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    total_aircraft = Aircraft.objects.count()
    under_maintenance = Aircraft.objects.filter(status__in=['UNDER_MAINTENANCE', 'AOG']).count()
    operational_aircraft = Aircraft.objects.filter(status='OPERATIONAL').count()
    maintenance_due = Aircraft.objects.filter(status='MAINTENANCE_DUE').count()

    today = date.today()
    upcoming_maintenance = Maintenance.objects.filter(
        due_date__gte=today,
        status__in=['SCHEDULED', 'IN_PROGRESS']
    ).count()

    open_work_orders = WorkOrder.objects.exclude(status__in=['COMPLETED', 'CANCELLED']).count()
    available_technicians = Technician.objects.filter(status='AVAILABLE').count()
    total_technicians = Technician.objects.count()

    all_parts = SparePart.objects.all()
    low_stock_parts = sum(1 for p in all_parts if p.is_low_stock)

    # Recent work orders
    recent_work_orders = WorkOrder.objects.select_related('aircraft', 'assigned_technician').order_by('-created_at')[:6]
    recent_wo_data = WorkOrderSerializer(recent_work_orders, many=True).data

    # Upcoming schedules
    upcoming_schedules = Maintenance.objects.select_related('aircraft', 'assigned_technician').filter(
        status__in=['SCHEDULED', 'IN_PROGRESS', 'OVERDUE']
    ).order_by('due_date')[:5]
    upcoming_sched_data = MaintenanceSerializer(upcoming_schedules, many=True).data

    # Aircraft status list
    aircraft_summary = AircraftListSerializer(Aircraft.objects.all(), many=True).data

    # Low stock alert items
    low_stock_alerts = [
        SparePartSerializer(p).data for p in all_parts if p.is_low_stock
    ][:6]

    # Maintenance activity chart data (last 6 months / recent weeks)
    monthly_activity = [
        {'month': 'Apr', 'inspections': 28, 'repairs': 14, 'overhauls': 3},
        {'month': 'May', 'inspections': 35, 'repairs': 19, 'overhauls': 4},
        {'month': 'Jun', 'inspections': 42, 'repairs': 16, 'overhauls': 2},
        {'month': 'Jul', 'inspections': 39, 'repairs': 22, 'overhauls': 5},
        {'month': 'Aug', 'inspections': 45, 'repairs': 18, 'overhauls': 3},
        {'month': 'Sep', 'inspections': 50, 'repairs': 24, 'overhauls': 6},
    ]

    return Response({
        'metrics': {
            'total_aircraft': total_aircraft,
            'under_maintenance': under_maintenance,
            'operational_aircraft': operational_aircraft,
            'maintenance_due': maintenance_due,
            'upcoming_maintenance': upcoming_maintenance,
            'open_work_orders': open_work_orders,
            'available_technicians': available_technicians,
            'total_technicians': total_technicians,
            'low_stock_parts': low_stock_parts,
        },
        'recent_work_orders': recent_wo_data,
        'upcoming_schedules': upcoming_sched_data,
        'aircraft_summary': aircraft_summary,
        'low_stock_alerts': low_stock_alerts,
        'activity_chart': monthly_activity
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def reports_data(request):
    # Maintenance History Summary
    records = MaintenanceRecord.objects.select_related('aircraft', 'technician').order_by('-completed_date')[:20]
    records_data = MaintenanceRecordSerializer(records, many=True).data

    # Work Order Completion metrics
    wo_total = WorkOrder.objects.count()
    wo_completed = WorkOrder.objects.filter(status='COMPLETED').count()
    wo_in_progress = WorkOrder.objects.filter(status='IN_PROGRESS').count()
    wo_waiting_parts = WorkOrder.objects.filter(status='WAITING_FOR_PARTS').count()
    wo_open = WorkOrder.objects.filter(status='OPEN').count()

    completion_rate = round((wo_completed / wo_total * 100), 1) if wo_total > 0 else 0

    # Spare Part Usage Breakdown
    part_transactions = InventoryTransaction.objects.filter(transaction_type='OUT').select_related('spare_part')[:15]
    part_usage_data = InventoryTransactionSerializer(part_transactions, many=True).data

    # Technician Workload
    technicians = Technician.objects.annotate(
        active_orders=Count('work_orders', filter=~Q(work_orders__status__in=['COMPLETED', 'CANCELLED']))
    )
    tech_workload = [
        {
            'id': t.id,
            'name': t.full_name,
            'employee_id': t.employee_id,
            'specialization': t.get_specialization_display(),
            'active_orders': t.active_orders,
            'status': t.status
        }
        for t in technicians
    ]

    # Aircraft Downtime Estimate (simulated realistic MRO telemetry)
    aircraft_downtime = [
        {'registration': a.registration_number, 'model': a.model, 'downtime_hours': 42 if a.status != 'OPERATIONAL' else 4, 'status': a.status}
        for a in Aircraft.objects.all()
    ]

    return Response({
        'maintenance_history': records_data,
        'work_order_metrics': {
            'total': wo_total,
            'completed': wo_completed,
            'in_progress': wo_in_progress,
            'waiting_parts': wo_waiting_parts,
            'open': wo_open,
            'completion_rate_percentage': completion_rate
        },
        'spare_parts_usage': part_usage_data,
        'technician_workload': tech_workload,
        'aircraft_downtime': aircraft_downtime
    })
