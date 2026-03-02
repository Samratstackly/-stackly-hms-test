from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from HMS_backend.models import Staff, Department
from django.utils import timezone


class Command(BaseCommand):
    help = "Create a superadmin user + linked Staff record"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        self.stdout.write(self.style.SUCCESS("\n=== Create Super Admin ==="))

        # --- Step 1: Ask for username ---
        username = input("Enter admin username: ").strip()

        # --- Step 2: Ask for password ---
        password = input("Enter admin password: ").strip()

        # --- Step 3: Ask staff information ---
        full_name = input("Enter full name: ").strip()
        designation = input("Enter designation: ").strip()
        phone = input("Enter phone (unique): ").strip()
        email = input("Enter email (unique): ").strip()

        # --- Step 4: Ensure Admin Department Exists ---
        department, created = Department.objects.get_or_create(
            name="Admin",
            defaults={
                "status": "active",
                "description": "Default admin department"
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS("✔ Auto-created Admin department."))

        # --- Step 5: Validations ---
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR("❌ Username already exists"))
            return

        if Staff.objects.filter(phone=phone).exists():
            self.stdout.write(self.style.ERROR("❌ Phone already exists"))
            return

        if Staff.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR("❌ Email already exists"))
            return

        # --- Step 6: Create Staff with auto date_of_joining ---
        staff = Staff.objects.create(
            full_name=full_name,
            designation=designation,
            phone=phone,
            email=email,
            department=department,
            status="Active",
            date_of_joining=timezone.now().date()  # 🔥 Auto-filled joining date
        )

        # --- Step 7: Create Superuser ---
        user = User.objects.create_superuser(
            username=username,
            password=password
        )

        user.role = "admin"
        user.staff = staff
        user.is_staff = True
        user.is_superuser = True
        user.save()

        self.stdout.write(self.style.SUCCESS("\n✅ Superadmin created successfully!"))
        self.stdout.write(self.style.SUCCESS(f"Admin Username: {username}"))
        self.stdout.write(self.style.SUCCESS(f"Linked Staff ID: {staff.id}"))
        self.stdout.write(self.style.SUCCESS(f"Department Assigned: {department.name}\n"))
