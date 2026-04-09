from django.core.management.base import BaseCommand
from food.models import SurgePricingRule


RULES = [
    # Always-active demo rule — DISABLED, real rules handle timing
    dict(name='Always Active Demo', trigger='custom_time', multiplier=1.20,
         label='⚡ Surge Pricing Active +20%', emoji='⚡',
         start_hour=0, end_hour=23, is_active=False, priority=0),
    dict(name='Peak Lunch Rush',  trigger='peak_lunch',   multiplier=1.20,
         label='🍽️ Lunch Rush — Surge +20%',   emoji='🍽️', is_active=True, priority=1),
    dict(name='Peak Dinner Rush', trigger='peak_dinner',  multiplier=1.25,
         label='🌆 Dinner Rush — Surge +25%',  emoji='🌆', is_active=True, priority=2),
    dict(name='Late Night',       trigger='late_night',   multiplier=1.15,
         label='🌙 Late Night Surge +15%',     emoji='🌙', is_active=True, priority=3),
    dict(name='Weekend Surge',    trigger='weekend',      multiplier=1.10,
         label='🎉 Weekend Surge +10%',        emoji='🎉', is_active=True, priority=4),
    dict(name='Rainy Day',        trigger='rain',         multiplier=1.30,
         label='🌧️ Rainy Day Surge +30%',     emoji='🌧️', is_active=True, priority=5),
    dict(name='High Demand',      trigger='high_demand',  multiplier=1.20,
         label='🔥 High Demand — Surge +20%', emoji='🔥',
         demand_threshold=30, is_active=True, priority=6),
]


class Command(BaseCommand):
    help = 'Seed / update default surge pricing rules'

    def handle(self, *args, **kwargs):
        created_count = 0
        for r in RULES:
            name = r['name']
            _, was_created = SurgePricingRule.objects.update_or_create(
                name=name, defaults=r
            )
            if was_created:
                created_count += 1
        self.stdout.write(self.style.SUCCESS(
            f'Surge rules ready ({created_count} new, {len(RULES) - created_count} updated)'
        ))
