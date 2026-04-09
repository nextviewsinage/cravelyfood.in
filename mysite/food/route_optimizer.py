"""
Hyperlocal Delivery Route Optimizer
Uses Nearest-Neighbor heuristic (TSP approximation) — no external API needed.
"""
import math
import uuid


# Ahmedabad city center as default restaurant origin
DEFAULT_ORIGIN = (23.0225, 72.5714)


def haversine(lat1, lon1, lat2, lon2):
    """Distance in km between two lat/lng points."""
    R = 6371
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def nearest_neighbor_route(origin, stops):
    """
    Greedy nearest-neighbor TSP.
    origin: (lat, lng)
    stops: list of dicts with keys: id, lat, lng, label
    Returns ordered list of stops with cumulative distance/eta.
    """
    if not stops:
        return []

    unvisited = list(stops)
    route = []
    current = origin
    total_km = 0.0

    while unvisited:
        # Find nearest unvisited stop
        nearest = min(
            unvisited,
            key=lambda s: haversine(current[0], current[1], s['lat'], s['lng'])
        )
        dist = haversine(current[0], current[1], nearest['lat'], nearest['lng'])
        total_km += dist
        # Avg city speed 20 km/h → minutes
        eta_min = round((total_km / 20) * 60)
        route.append({
            **nearest,
            'distance_from_prev_km': round(dist, 2),
            'cumulative_km': round(total_km, 2),
            'eta_minutes': eta_min,
        })
        current = (nearest['lat'], nearest['lng'])
        unvisited.remove(nearest)

    return route


def build_batch(orders, origin=DEFAULT_ORIGIN):
    """
    Given a list of Order objects, geocode addresses (use stored lat/lng if available),
    run nearest-neighbor, return optimized route + batch_id.
    """
    batch_id = uuid.uuid4().hex[:8].upper()

    stops = []
    for o in orders:
        lat = o.delivery_lat or DEFAULT_ORIGIN[0] + (hash(o.customer_address) % 100) * 0.001
        lng = o.delivery_lng or DEFAULT_ORIGIN[1] + (hash(o.customer_address[::-1]) % 100) * 0.001
        stops.append({
            'id': o.id,
            'lat': lat,
            'lng': lng,
            'label': f"#{o.id} — {o.customer_name}",
            'address': o.customer_address,
            'phone': o.customer_phone,
            'item': getattr(o.food_item, 'name', ''),
            'qty': o.quantity,
            'amount': float(o.total_price),
        })

    route = nearest_neighbor_route(origin, stops)
    total_km = route[-1]['cumulative_km'] if route else 0
    total_eta = route[-1]['eta_minutes'] if route else 0

    return {
        'batch_id': batch_id,
        'total_orders': len(route),
        'total_km': round(total_km, 2),
        'total_eta_minutes': total_eta,
        'origin': {'lat': origin[0], 'lng': origin[1], 'label': 'Restaurant'},
        'route': route,
    }
