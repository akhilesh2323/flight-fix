from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MANAGER = 'MANAGER', 'Maintenance Manager'
        TECHNICIAN = 'TECHNICIAN', 'Technician'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MANAGER,
        help_text='User authorization role'
    )
    phone = models.CharField(max_length=30, blank=True, default='')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Technician(models.Model):
    class Specialization(models.TextChoices):
        AVIONICS = 'AVIONICS', 'Avionics & Electrical'
        POWERPLANT = 'POWERPLANT', 'Powerplant & Turbofans'
        AIRFRAME = 'AIRFRAME', 'Airframe & Structures'
        HYDRAULICS = 'HYDRAULICS', 'Hydraulics & Landing Gear'
        GENERAL = 'GENERAL', 'General Systems & Inspections'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        ON_DUTY = 'ON_DUTY', 'On Duty'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='technician_profile'
    )
    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    certification = models.CharField(max_length=150, help_text='e.g., FAA A&P / EASA Part-66 B1/B2')
    specialization = models.CharField(
        max_length=30,
        choices=Specialization.choices,
        default=Specialization.GENERAL
    )
    phone = models.CharField(max_length=30, blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.employee_id}) - {self.get_specialization_display()}"


class Aircraft(models.Model):
    class Status(models.TextChoices):
        OPERATIONAL = 'OPERATIONAL', 'Operational'
        MAINTENANCE_DUE = 'MAINTENANCE_DUE', 'Maintenance Due'
        UNDER_MAINTENANCE = 'UNDER_MAINTENANCE', 'Under Maintenance'
        AOG = 'AOG', 'Aircraft on Ground (AOG)'

    registration_number = models.CharField(max_length=20, unique=True, db_index=True)
    model = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100)
    flight_hours = models.DecimalField(max_digits=10, decimal_places=1, default=0.0)
    flight_cycles = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.OPERATIONAL,
        db_index=True
    )
    last_maintenance = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['registration_number']
        verbose_name_plural = 'Aircraft'

    def __str__(self):
        return f"{self.registration_number} - {self.model} ({self.get_status_display()})"


class AircraftComponent(models.Model):
    class ComponentType(models.TextChoices):
        ENGINE = 'engine', 'Engine'
        LANDING_GEAR = 'landing_gear', 'Landing Gear'
        WINGS = 'wings', 'Wings'
        FUSELAGE = 'fuselage', 'Fuselage'
        COCKPIT = 'cockpit', 'Cockpit'
        TAIL = 'tail', 'Tail'
        BRAKES = 'brakes', 'Brakes'

    class Status(models.TextChoices):
        OPERATIONAL = 'OPERATIONAL', 'Operational'
        MAINTENANCE_DUE = 'MAINTENANCE_DUE', 'Maintenance Due'
        UNDER_MAINTENANCE = 'UNDER_MAINTENANCE', 'Under Maintenance'
        WARNING = 'WARNING', 'Warning'

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='components')
    name = models.CharField(max_length=150)
    component_type = models.CharField(
        max_length=30,
        choices=ComponentType.choices,
        db_index=True
    )
    component_id = models.CharField(max_length=50)
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.OPERATIONAL,
        db_index=True
    )
    condition_score = models.PositiveIntegerField(default=100, help_text='Condition rating between 0 and 100%')
    last_inspection = models.DateField(null=True, blank=True)
    next_inspection = models.DateField(null=True, blank=True)
    assigned_technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_components'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('aircraft', 'component_id')
        ordering = ['component_type', 'name']

    def __str__(self):
        return f"{self.aircraft.registration_number} - {self.name} ({self.component_id})"


class Maintenance(models.Model):
    class MaintenanceType(models.TextChoices):
        A_CHECK = 'A_CHECK', 'A-Check (Routine)'
        B_CHECK = 'B_CHECK', 'B-Check'
        C_CHECK = 'C_CHECK', 'C-Check (Extensive)'
        D_CHECK = 'D_CHECK', 'D-Check (Heavy Overhaul)'
        LINE_MAINTENANCE = 'LINE_MAINTENANCE', 'Line Maintenance'
        UNSCHEDULED = 'UNSCHEDULED', 'Unscheduled Repair'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'AOG / Critical'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        OVERDUE = 'OVERDUE', 'Overdue'
        CANCELLED = 'CANCELLED', 'Cancelled'

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='maintenance_schedules')
    maintenance_type = models.CharField(
        max_length=30,
        choices=MaintenanceType.choices,
        default=MaintenanceType.A_CHECK
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True
    )
    scheduled_date = models.DateField()
    due_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    assigned_technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scheduled_maintenances'
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-due_date', '-created_at']

    def __str__(self):
        return f"{self.get_maintenance_type_display()} - {self.aircraft.registration_number} ({self.get_status_display()})"


class WorkOrder(models.Model):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'AOG / Critical'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        ASSIGNED = 'ASSIGNED', 'Assigned'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        WAITING_FOR_PARTS = 'WAITING_FOR_PARTS', 'Waiting for Parts'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    work_order_number = models.CharField(max_length=50, unique=True, db_index=True)
    maintenance = models.ForeignKey(
        Maintenance,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work_orders'
    )
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='work_orders')
    component = models.ForeignKey(
        AircraftComponent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work_orders'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True
    )
    assigned_technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work_orders'
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.work_order_number} - {self.title} ({self.get_status_display()})"


class WorkOrderTask(models.Model):
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='tasks')
    description = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.is_completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{'X' if self.is_completed else ' '}] {self.description}"


class SparePart(models.Model):
    class Category(models.TextChoices):
        AVIONICS = 'AVIONICS', 'Avionics & Sensors'
        POWERPLANT = 'POWERPLANT', 'Powerplant & Engines'
        AIRFRAME = 'AIRFRAME', 'Airframe & Aerostructures'
        LANDING_GEAR = 'LANDING_GEAR', 'Landing Gear & Brakes'
        CONSUMABLES = 'CONSUMABLES', 'Fluids, Seals & Consumables'
        HARDWARE = 'HARDWARE', 'Aviation Fasteners & Hardware'

    part_number = models.CharField(max_length=80, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.HARDWARE
    )
    quantity_in_stock = models.IntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=5)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supplier = models.CharField(max_length=150)
    location = models.CharField(max_length=150, help_text='Hangar/Bay/Shelf locator')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.minimum_stock

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.part_number} - {self.name} (Qty: {self.quantity_in_stock})"


class InventoryTransaction(models.Model):
    class TransactionType(models.TextChoices):
        IN = 'IN', 'Restock / Received'
        OUT = 'OUT', 'Work Order Usage'
        ADJUSTMENT = 'ADJUSTMENT', 'Inventory Adjustment'

    spare_part = models.ForeignKey(SparePart, on_delete=models.CASCADE, related_name='transactions')
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='part_usages'
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        default=TransactionType.OUT
    )
    quantity = models.PositiveIntegerField()
    notes = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Update spare part quantity automatically
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            part = self.spare_part
            if self.transaction_type == self.TransactionType.OUT:
                part.quantity_in_stock = max(0, part.quantity_in_stock - self.quantity)
            elif self.transaction_type == self.TransactionType.IN:
                part.quantity_in_stock += self.quantity
            elif self.transaction_type == self.TransactionType.ADJUSTMENT:
                part.quantity_in_stock = self.quantity
            part.save()

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.spare_part.name} ({self.quantity} units)"


class MaintenanceRecord(models.Model):
    record_number = models.CharField(max_length=50, unique=True, db_index=True)
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='maintenance_records')
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_history'
    )
    maintenance_type = models.CharField(max_length=100)
    completed_date = models.DateField()
    technician = models.ForeignKey(
        Technician,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintenance_records'
    )
    findings = models.TextField()
    actions_taken = models.TextField()
    flight_hours_at_maintenance = models.DecimalField(max_digits=10, decimal_places=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_date', '-created_at']

    def __str__(self):
        return f"{self.record_number} - {self.aircraft.registration_number} ({self.completed_date})"
