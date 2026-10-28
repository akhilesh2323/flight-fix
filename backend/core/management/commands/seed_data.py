from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from core.models import (
    User, Technician, Aircraft, AircraftComponent,
    Maintenance, WorkOrder, WorkOrderTask,
    SparePart, InventoryTransaction, MaintenanceRecord
)


class Command(BaseCommand):
    help = 'Seeds realistic aviation MRO demo data into the FlightFix database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning FlightFix database seeding...'))

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@flightfix.aero',
                'first_name': 'Chief',
                'last_name': 'Inspector',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        manager_user, _ = User.objects.get_or_create(
            username='manager',
            defaults={
                'email': 'manager@flightfix.aero',
                'first_name': 'Robert',
                'last_name': 'Hayes',
                'role': User.Role.MANAGER,
                'is_staff': True
            }
        )
        manager_user.set_password('manager123')
        manager_user.save()

        tech1_user, _ = User.objects.get_or_create(
            username='tech1',
            defaults={
                'email': 'm.vance@flightfix.aero',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': User.Role.TECHNICIAN
            }
        )
        tech1_user.set_password('tech123')
        tech1_user.save()

        tech2_user, _ = User.objects.get_or_create(
            username='tech2',
            defaults={
                'email': 'e.rostova@flightfix.aero',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': User.Role.TECHNICIAN
            }
        )
        tech2_user.set_password('tech123')
        tech2_user.save()

        self.stdout.write(self.style.SUCCESS('Users created (admin, manager, tech1, tech2)'))

        # 2. Create Technicians
        tech_data = [
            {
                'user': tech1_user,
                'employee_id': 'TECH-1042',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'certification': 'FAA A&P / EASA Part-66 B2 Avionics',
                'specialization': Technician.Specialization.AVIONICS,
                'phone': '+1 (555) 382-9011',
                'status': Technician.Status.ON_DUTY
            },
            {
                'user': tech2_user,
                'employee_id': 'TECH-2089',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'certification': 'FAA A&P / EASA Part-66 B1.1 Powerplant',
                'specialization': Technician.Specialization.POWERPLANT,
                'phone': '+1 (555) 741-6623',
                'status': Technician.Status.ON_DUTY
            },
            {
                'user': None,
                'employee_id': 'TECH-3011',
                'first_name': 'David',
                'last_name': 'Chen',
                'certification': 'FAA A&P Airframe & Landing Gear Systems',
                'specialization': Technician.Specialization.HYDRAULICS,
                'phone': '+1 (555) 902-4415',
                'status': Technician.Status.AVAILABLE
            },
            {
                'user': None,
                'employee_id': 'TECH-4055',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'certification': 'EASA Part-66 B1 Heavy Structures & Composites',
                'specialization': Technician.Specialization.AIRFRAME,
                'phone': '+1 (555) 629-1184',
                'status': Technician.Status.AVAILABLE
            }
        ]

        technicians = {}
        for td in tech_data:
            t, _ = Technician.objects.update_or_create(
                employee_id=td['employee_id'],
                defaults=td
            )
            technicians[td['employee_id']] = t

        self.stdout.write(self.style.SUCCESS(f'{len(technicians)} Technicians created'))

        # 3. Create Spare Parts
        spare_parts_data = [
            {
                'part_number': 'CFM-56-OIL-FLTR',
                'name': 'Turbofan Lubrication Cartridge Filter Kit',
                'category': SparePart.Category.POWERPLANT,
                'quantity_in_stock': 24,
                'minimum_stock': 10,
                'unit_cost': 480.00,
                'supplier': 'Safran Aero Parts & Systems',
                'location': 'Hangar Alpha, Rack 12, Bin 4'
            },
            {
                'part_number': 'B737-BRK-CARB-08',
                'name': 'Carbon Multi-Disc Brake Heat Pack',
                'category': SparePart.Category.LANDING_GEAR,
                'quantity_in_stock': 4,
                'minimum_stock': 6,  # Low stock trigger!
                'unit_cost': 12500.00,
                'supplier': 'Collins Aerospace MRO Division',
                'location': 'Hangar Bravo, Bay 2, Heavy Shelving'
            },
            {
                'part_number': 'AV-PITOT-HEAT-32',
                'name': 'SmartProbe Heated Pitot-Static Sensor',
                'category': SparePart.Category.AVIONICS,
                'quantity_in_stock': 8,
                'minimum_stock': 4,
                'unit_cost': 3800.00,
                'supplier': 'Honeywell Aerospace',
                'location': 'Avionics Cleanroom, Safe #3'
            },
            {
                'part_number': 'HYD-ACT-RUD-09',
                'name': 'Rudder Power Control Hydraulic Actuator',
                'category': SparePart.Category.AIRFRAME,
                'quantity_in_stock': 2,
                'minimum_stock': 3,  # Low stock trigger!
                'unit_cost': 18900.00,
                'supplier': 'Parker Aerospace Flight Control',
                'location': 'Hangar Alpha, Secure Vault 01'
            },
            {
                'part_number': 'OIL-TURB-560-QT',
                'name': 'AeroShell Turbine Synthetic Oil 560 (Quart)',
                'category': SparePart.Category.CONSUMABLES,
                'quantity_in_stock': 85,
                'minimum_stock': 30,
                'unit_cost': 32.50,
                'supplier': 'Shell Aviation Global Distribution',
                'location': 'Chemical & Flammables Locker C'
            },
            {
                'part_number': 'FAST-TIT-NAS6704',
                'name': 'High-Shear Titanium Wing Spar Fastener Pack (50pcs)',
                'category': SparePart.Category.HARDWARE,
                'quantity_in_stock': 3,
                'minimum_stock': 5,  # Low stock trigger!
                'unit_cost': 620.00,
                'supplier': 'Alcoa Fastening Systems',
                'location': 'Hardware Drawer 14-D'
            },
            {
                'part_number': 'LG-TIRE-49X19',
                'name': 'Main Landing Gear Radial Tubeless Tire 49x19.0-20',
                'category': SparePart.Category.LANDING_GEAR,
                'quantity_in_stock': 12,
                'minimum_stock': 6,
                'unit_cost': 2450.00,
                'supplier': 'Michelin Aviation Tires',
                'location': 'Tire Warehouse, Bay 1'
            },
            {
                'part_number': 'AV-DU875-LCD',
                'name': 'Primary Flight Display (PFD) 8x10 AMLCD Unit',
                'category': SparePart.Category.AVIONICS,
                'quantity_in_stock': 3,
                'minimum_stock': 2,
                'unit_cost': 31000.00,
                'supplier': 'Rockwell Collins Avionics',
                'location': 'Avionics Cleanroom, Rack A'
            }
        ]

        spare_parts = {}
        for sp in spare_parts_data:
            part, _ = SparePart.objects.update_or_create(
                part_number=sp['part_number'],
                defaults=sp
            )
            spare_parts[sp['part_number']] = part

        self.stdout.write(self.style.SUCCESS(f'{len(spare_parts)} Spare Parts created'))

        # 4. Create Aircraft Fleet
        today = date.today()
        aircraft_data = [
            {
                'registration_number': 'N737AA',
                'model': 'Boeing 737-800',
                'manufacturer': 'Boeing Commercial Airplanes',
                'serial_number': 'MSN-39214',
                'flight_hours': 14250.5,
                'flight_cycles': 8420,
                'status': Aircraft.Status.OPERATIONAL,
                'last_maintenance': today - timedelta(days=45),
                'next_maintenance': today + timedelta(days=15),
            },
            {
                'registration_number': 'F-WZNR',
                'model': 'Airbus A320neo',
                'manufacturer': 'Airbus S.A.S.',
                'serial_number': 'MSN-8842',
                'flight_hours': 8920.0,
                'flight_cycles': 5140,
                'status': Aircraft.Status.UNDER_MAINTENANCE,
                'last_maintenance': today - timedelta(days=3),
                'next_maintenance': today + timedelta(days=2),
            },
            {
                'registration_number': 'G-ZBKM',
                'model': 'Boeing 787-9 Dreamliner',
                'manufacturer': 'Boeing Commercial Airplanes',
                'serial_number': 'MSN-38612',
                'flight_hours': 19800.2,
                'flight_cycles': 3850,
                'status': Aircraft.Status.MAINTENANCE_DUE,
                'last_maintenance': today - timedelta(days=120),
                'next_maintenance': today + timedelta(days=3),
            },
            {
                'registration_number': 'VT-IFX',
                'model': 'Airbus A321LR',
                'manufacturer': 'Airbus S.A.S.',
                'serial_number': 'MSN-10115',
                'flight_hours': 4300.0,
                'flight_cycles': 2110,
                'status': Aircraft.Status.OPERATIONAL,
                'last_maintenance': today - timedelta(days=22),
                'next_maintenance': today + timedelta(days=68),
            },
            {
                'registration_number': 'JA082A',
                'model': 'Embraer E190-E2',
                'manufacturer': 'Embraer',
                'serial_number': 'MSN-1900041',
                'flight_hours': 6120.4,
                'flight_cycles': 4900,
                'status': Aircraft.Status.OPERATIONAL,
                'last_maintenance': today - timedelta(days=80),
                'next_maintenance': today + timedelta(days=40),
            }
        ]

        aircraft_map = {}
        for ad in aircraft_data:
            ac, _ = Aircraft.objects.update_or_create(
                registration_number=ad['registration_number'],
                defaults=ad
            )
            aircraft_map[ad['registration_number']] = ac

        self.stdout.write(self.style.SUCCESS(f'{len(aircraft_map)} Aircraft created'))

        # 5. Create Components for all Aircraft (Fuselage, Engine, Wings, Landing Gear, Cockpit, Tail, Brakes)
        component_templates = [
            {
                'type': AircraftComponent.ComponentType.ENGINE,
                'name_fn': lambda model: f'High-Bypass Turbofan Engine (CFM/Trent)',
                'id_code': 'ENG-01',
            },
            {
                'type': AircraftComponent.ComponentType.LANDING_GEAR,
                'name_fn': lambda model: 'Main & Nose Landing Gear System',
                'id_code': 'LG-01',
            },
            {
                'type': AircraftComponent.ComponentType.WINGS,
                'name_fn': lambda model: 'Supercritical Wing Assembly & Control Surfaces',
                'id_code': 'WNG-01',
            },
            {
                'type': AircraftComponent.ComponentType.FUSELAGE,
                'name_fn': lambda model: 'Semi-Monocoque Pressurized Fuselage',
                'id_code': 'FUS-01',
            },
            {
                'type': AircraftComponent.ComponentType.COCKPIT,
                'name_fn': lambda model: 'Integrated Modular Avionics (IMA) & Cockpit Deck',
                'id_code': 'CKP-01',
            },
            {
                'type': AircraftComponent.ComponentType.TAIL,
                'name_fn': lambda model: 'Empennage Vertical & Horizontal Stabilizers',
                'id_code': 'EMP-01',
            },
            {
                'type': AircraftComponent.ComponentType.BRAKES,
                'name_fn': lambda model: 'Electro-Hydraulic Carbon Brake Units',
                'id_code': 'BRK-01',
            }
        ]

        created_components = []
        for reg, plane in aircraft_map.items():
            for idx, tmpl in enumerate(component_templates):
                comp_id = f"{tmpl['id_code']}-{reg}"

                # Assign realistic component condition & status based on plane status
                if plane.status == Aircraft.Status.UNDER_MAINTENANCE and tmpl['type'] in [AircraftComponent.ComponentType.ENGINE, AircraftComponent.ComponentType.BRAKES]:
                    comp_status = AircraftComponent.Status.UNDER_MAINTENANCE
                    score = 64
                elif plane.status == Aircraft.Status.MAINTENANCE_DUE and tmpl['type'] in [AircraftComponent.ComponentType.LANDING_GEAR, AircraftComponent.ComponentType.TAIL]:
                    comp_status = AircraftComponent.Status.MAINTENANCE_DUE
                    score = 72
                elif idx == 4 and reg == 'VT-IFX':
                    comp_status = AircraftComponent.Status.WARNING
                    score = 81
                else:
                    comp_status = AircraftComponent.Status.OPERATIONAL
                    score = 95 + (idx % 5)

                assigned_tech = None
                if tmpl['type'] == AircraftComponent.ComponentType.ENGINE:
                    assigned_tech = technicians['TECH-2089']
                elif tmpl['type'] == AircraftComponent.ComponentType.COCKPIT:
                    assigned_tech = technicians['TECH-1042']
                elif tmpl['type'] in [AircraftComponent.ComponentType.LANDING_GEAR, AircraftComponent.ComponentType.BRAKES]:
                    assigned_tech = technicians['TECH-3011']
                else:
                    assigned_tech = technicians['TECH-4055']

                comp, _ = AircraftComponent.objects.update_or_create(
                    aircraft=plane,
                    component_id=comp_id,
                    defaults={
                        'name': tmpl['name_fn'](plane.model),
                        'component_type': tmpl['type'],
                        'status': comp_status,
                        'condition_score': score,
                        'last_inspection': today - timedelta(days=30 + idx * 5),
                        'next_inspection': today + timedelta(days=20 + idx * 10),
                        'assigned_technician': assigned_tech
                    }
                )
                created_components.append(comp)

        self.stdout.write(self.style.SUCCESS(f'{len(created_components)} Aircraft Components created'))

        # 6. Create Maintenance Schedules
        maint1, _ = Maintenance.objects.update_or_create(
            aircraft=aircraft_map['F-WZNR'],
            maintenance_type=Maintenance.MaintenanceType.C_CHECK,
            defaults={
                'priority': Maintenance.Priority.HIGH,
                'status': Maintenance.Status.IN_PROGRESS,
                'scheduled_date': today - timedelta(days=4),
                'due_date': today + timedelta(days=3),
                'assigned_technician': technicians['TECH-2089'],
                'description': 'Scheduled 24-month C-Check heavy inspection. Turbofan boroscope inspection, hydraulic system flush, and carbon brake pack servicing.'
            }
        )

        maint2, _ = Maintenance.objects.update_or_create(
            aircraft=aircraft_map['G-ZBKM'],
            maintenance_type=Maintenance.MaintenanceType.A_CHECK,
            defaults={
                'priority': Maintenance.Priority.MEDIUM,
                'status': Maintenance.Status.SCHEDULED,
                'scheduled_date': today + timedelta(days=1),
                'due_date': today + timedelta(days=4),
                'assigned_technician': technicians['TECH-1042'],
                'description': 'Routine 500-flight-hour A-Check. Avionics operational check, tire pressure & tread depth inspection, and emergency lighting test.'
            }
        )

        maint3, _ = Maintenance.objects.update_or_create(
            aircraft=aircraft_map['N737AA'],
            maintenance_type=Maintenance.MaintenanceType.LINE_MAINTENANCE,
            defaults={
                'priority': Maintenance.Priority.LOW,
                'status': Maintenance.Status.COMPLETED,
                'scheduled_date': today - timedelta(days=12),
                'due_date': today - timedelta(days=11),
                'completed_date': today - timedelta(days=11),
                'assigned_technician': technicians['TECH-3011'],
                'description': 'Pre-flight daily turnaround inspection and routine fluid top-up.'
            }
        )

        # 7. Create Work Orders & Tasks
        wo1, _ = WorkOrder.objects.update_or_create(
            work_order_number='WO-2026-0012',
            defaults={
                'maintenance': maint1,
                'aircraft': aircraft_map['F-WZNR'],
                'component': AircraftComponent.objects.filter(aircraft=aircraft_map['F-WZNR'], component_type='engine').first(),
                'title': 'LEAP Turbofan High-Pressure Compressor Boroscope Inspection',
                'description': 'Perform Stage 1 to 5 HPC boroscope inspection to check blade tip clearances and inspect combustion chamber liner.',
                'priority': WorkOrder.Priority.HIGH,
                'status': WorkOrder.Status.IN_PROGRESS,
                'assigned_technician': technicians['TECH-2089'],
                'notes': 'Port engine HPC guide vanes examined. Minor thermal coating wear within acceptable AMM limits.'
            }
        )

        WorkOrderTask.objects.get_or_create(work_order=wo1, description='Lockout aircraft electrical and fuel shutoff valves', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo1, description='Open engine nacelle cowlings and position maintenance access stand', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo1, description='Insert video boroscope into igniter plug port A & B', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo1, description='Inspect and measure leading edge erosion on Stage 3 rotor blades', defaults={'is_completed': False})
        WorkOrderTask.objects.get_or_create(work_order=wo1, description='Reinstall boroscope port plugs and safety-wire to AMM torque specs', defaults={'is_completed': False})

        wo2, _ = WorkOrder.objects.update_or_create(
            work_order_number='WO-2026-0015',
            defaults={
                'maintenance': maint1,
                'aircraft': aircraft_map['F-WZNR'],
                'component': AircraftComponent.objects.filter(aircraft=aircraft_map['F-WZNR'], component_type='brakes').first(),
                'title': 'Main Landing Gear Left Inboard Brake Replacement',
                'description': 'Brake wear indicator pins show wear reaching 1.2mm threshold. Remove worn carbon heat pack and install fresh brake assembly.',
                'priority': WorkOrder.Priority.HIGH,
                'status': WorkOrder.Status.WAITING_FOR_PARTS,
                'assigned_technician': technicians['TECH-3011'],
                'notes': 'Requested B737-BRK-CARB-08 replacement pack from central storage.'
            }
        )

        WorkOrderTask.objects.get_or_create(work_order=wo2, description='Jack main gear axle and remove wheel assembly #2', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo2, description='Disconnect quick-disconnect hydraulic brake line & cap', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo2, description='Receive and inspect new brake pack certification tags', defaults={'is_completed': False})
        WorkOrderTask.objects.get_or_create(work_order=wo2, description='Bleed hydraulic lines and test anti-skid transducers', defaults={'is_completed': False})

        wo3, _ = WorkOrder.objects.update_or_create(
            work_order_number='WO-2026-0020',
            defaults={
                'maintenance': maint2,
                'aircraft': aircraft_map['G-ZBKM'],
                'component': AircraftComponent.objects.filter(aircraft=aircraft_map['G-ZBKM'], component_type='cockpit').first(),
                'title': 'Cockpit Multi-Function Display (MFD) Firmware Calibration',
                'description': 'Execute FAA AD 2026-04-12 compliance update on Collins Integrated Processing Cabinet and calibrate pitot heaters.',
                'priority': WorkOrder.Priority.MEDIUM,
                'status': WorkOrder.Status.ASSIGNED,
                'assigned_technician': technicians['TECH-1042'],
                'notes': 'Diagnostic dataloader prepared. Awaiting scheduled maintenance slot tomorrow morning.'
            }
        )

        WorkOrderTask.objects.get_or_create(work_order=wo3, description='Connect ARINC 429 dataloader to flight deck port', defaults={'is_completed': False})
        WorkOrderTask.objects.get_or_create(work_order=wo3, description='Upload software package build v8.4.2 to IPC-1 and IPC-2', defaults={'is_completed': False})
        WorkOrderTask.objects.get_or_create(work_order=wo3, description='Run built-in avionics self-test (BITE) and verify checksums', defaults={'is_completed': False})

        wo4, _ = WorkOrder.objects.update_or_create(
            work_order_number='WO-2026-0008',
            defaults={
                'maintenance': maint3,
                'aircraft': aircraft_map['N737AA'],
                'component': AircraftComponent.objects.filter(aircraft=aircraft_map['N737AA'], component_type='landing_gear').first(),
                'title': 'Nose Gear Oleo Strut Pressure Check & Nitrogen Servicing',
                'description': 'Measure oleo strut extension and service with dry nitrogen to 185 PSI in accordance with AMM 32-00-00.',
                'priority': WorkOrder.Priority.LOW,
                'status': WorkOrder.Status.COMPLETED,
                'assigned_technician': technicians['TECH-3011'],
                'completed_at': timezone.now() - timedelta(days=11),
                'notes': 'Serviced to 185 PSI. No leakage detected. System operational.'
            }
        )

        WorkOrderTask.objects.get_or_create(work_order=wo4, description='Measure static oleo strut extension', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo4, description='Attach high-pressure nitrogen manifold', defaults={'is_completed': True, 'completed_at': timezone.now()})
        WorkOrderTask.objects.get_or_create(work_order=wo4, description='Sign off logbook and release to line operations', defaults={'is_completed': True, 'completed_at': timezone.now()})

        # Record parts usage
        InventoryTransaction.objects.get_or_create(
            spare_part=spare_parts['OIL-TURB-560-QT'],
            work_order=wo1,
            defaults={
                'transaction_type': InventoryTransaction.TransactionType.OUT,
                'quantity': 4,
                'notes': 'Top up CFM LEAP engine oil reservoir'
            }
        )

        # 8. Create Historical Maintenance Records
        MaintenanceRecord.objects.get_or_create(
            record_number='MR-2026-0038',
            defaults={
                'aircraft': aircraft_map['N737AA'],
                'work_order': wo4,
                'maintenance_type': 'Line Maintenance & Strut Servicing',
                'completed_date': today - timedelta(days=11),
                'technician': technicians['TECH-3011'],
                'findings': 'Oleo strut extension measured 3.2 inches, below nominal 3.8 inches.',
                'actions_taken': 'Serviced oleo strut with dry nitrogen to 185 PSI. Cleaned chrome piston and inspected scraper seals. Signoff completed.',
                'flight_hours_at_maintenance': 14210.0
            }
        )

        MaintenanceRecord.objects.get_or_create(
            record_number='MR-2026-0032',
            defaults={
                'aircraft': aircraft_map['VT-IFX'],
                'work_order': None,
                'maintenance_type': 'A-Check Inspection',
                'completed_date': today - timedelta(days=22),
                'technician': technicians['TECH-1042'],
                'findings': 'Routine 500-hr check. All systems within standard operational tolerances. Weather radar transceiver recalibrated.',
                'actions_taken': 'Full airframe visual inspection, lubricated flight control hinges, tested emergency exit door slides.',
                'flight_hours_at_maintenance': 4280.0
            }
        )

        MaintenanceRecord.objects.get_or_create(
            record_number='MR-2026-0019',
            defaults={
                'aircraft': aircraft_map['JA082A'],
                'work_order': None,
                'maintenance_type': 'B-Check Overhaul',
                'completed_date': today - timedelta(days=80),
                'technician': technicians['TECH-4055'],
                'findings': 'Flap track carriage fairing showed minor surface scratch.',
                'actions_taken': 'Blended paint defect, applied polyurethane topcoat, torqued attachment bolts to manufacturer specs.',
                'flight_hours_at_maintenance': 5800.0
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded FlightFix database with realistic MRO data!'))
