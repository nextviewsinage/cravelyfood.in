from django.core.management.base import BaseCommand
from food.models import SurgePricingRule


RULES = [
    dict(name='Peak Lunch Rush',  trigger='peak_lunch',   multiplier=1.20, label='🍽️ Lunch Rush — Surge +20%',    emoji='🍽️', priority=1),
    dict(name='Peak Dinner Rush', trigger='peak_dinner',  multiplier=1.25, label='🌆 Dinner Rush — Surge +25%',   emoji='🌆', priority=2),
    dict(name='Late Night',       trigger='late_night',   multiplier=1.15, label='🌙 Late Night Surge +15%',      emoji='🌙', priority=3),
    dict(name='Weekend Surge',    trigger='weekend',      multiplier=1.10, label='🎉 Weekend Surge +10%',         emoji='🎉', priority=4),
    dict(name='Rainy Day',        trigger='rain',         multiplier=1.30, label='🌧️ Rainy Day Surge +30%',      emoji='🌧️', priority=5),
    dict(name='High Demand',      trigger='high_demand',  multiplier=1.20, label='🔥 High Demand — Surge +20%',  emoji='🔥', demand_threshold=30, priority=6),
]


class Command(BaseCommand):
    help = 'Seed default surge pricing rules'

    def handle(self, *args, **kwargs):
        created = 0
        for r in RULES:
            _, was_created = SurgePricingRule.objects.get_or_create(trigger=r['trigger'], defaults=r)
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Surge rules ready ({created} new, {len(RULES)-created} already existed)'))
