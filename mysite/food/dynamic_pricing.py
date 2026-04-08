"""
Dynamic / Surge Pricing Engine
Evaluates active SurgePricingRules and returns the highest-priority match.
"""
from django.utils import timezone
from django.db.models import Count


def get_surge_info(request=None):
    """
    Returns a dict:
      {
        'multiplier': 1.30,
        'label': '🌧️ Rain Surge +30%',
        'emoji': '🌧️',
        'reason': 'rain',
        'active': True,
      }
    or None if no surge is active.
    """
    from .models import SurgePricingRule, Order

    now = timezone.localtime(timezone.now())
    hour = now.hour
    weekday = now.weekday()  # 0=Mon … 6=Sun

    # Recent demand: orders in last 60 minutes
    from datetime import timedelta
    recent_orders = Order.objects.filter(
        created_at__gte=now - timedelta(hours=1)
    ).count()

    rules = SurgePricingRule.objects.filter(is_active=True)

    for rule in rules:
        triggered = False

        if rule.trigger == 'peak_lunch' and 12 <= hour < 14:
            triggered = True
        elif rule.trigger == 'peak_dinner' and 19 <= hour < 22:
            triggered = True
        elif rule.trigger == 'late_night' and (hour >= 23 or hour < 5):
            triggered = True
        elif rule.trigger == 'weekend' and weekday >= 5:
            triggered = True
        elif rule.trigger == 'high_demand' and recent_orders >= rule.demand_threshold:
            triggered = True
        elif rule.trigger == 'custom_time':
            if rule.start_hour is not None and rule.end_hour is not None:
                if rule.start_hour <= rule.end_hour:
                    triggered = rule.start_hour <= hour < rule.end_hour
                else:  # overnight window e.g. 22–4
                    triggered = hour >= rule.start_hour or hour < rule.end_hour
        elif rule.trigger == 'rain':
            # Rain detection: check query param or session flag set by frontend
            if request:
                triggered = request.GET.get('rain') == '1' or \
                            request.session.get('is_raining', False)

        if triggered:
            mult = float(rule.multiplier)
            pct = round((mult - 1) * 100)
            return {
                'multiplier': mult,
                'label': rule.label or f"{rule.emoji} Surge +{pct}%",
                'emoji': rule.emoji,
                'reason': rule.trigger,
                'active': True,
            }

    return None


def apply_surge(base_price, surge_info):
    """Return (dynamic_price, original_price) as floats."""
    if not surge_info:
        return float(base_price), float(base_price)
    dynamic = round(float(base_price) * surge_info['multiplier'], 2)
    return dynamic, float(base_price)
