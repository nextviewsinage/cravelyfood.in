from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from food.models import UserProfile


class Command(BaseCommand):
    help = 'Promote a user to admin role + staff'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" not found'))
            return

        user.is_staff = True
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'admin'
        profile.save()

        self.stdout.write(self.style.SUCCESS(
            f'✅ "{username}" is now admin (is_staff=True, role=admin)'
        ))
