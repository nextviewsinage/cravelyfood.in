import os
from django.http import JsonResponse


class APIKeyMiddleware:
    """
    Block direct browser access to /api/ endpoints.
    Only allow requests that come with the correct X-API-Key header
    or from trusted origins (Vercel frontend).
    Auth endpoints are always allowed (login/register).
    """

    ALWAYS_ALLOWED = [
        '/api/auth/token/',
        '/api/auth/token/refresh/',
        '/api/auth/register/',
        '/admin/',
    ]

    def __init__(self, get_response):
        self.get_response = get_response
        self.api_key = os.environ.get('API_SECRET_KEY', 'cravelyfood-api-key-2024')

    def __call__(self, request):
        path = request.path

        # Only apply to /api/ routes
        if not path.startswith('/api/'):
            return self.get_response(request)

        # Always allow auth endpoints
        for allowed in self.ALWAYS_ALLOWED:
            if path.startswith(allowed):
                return self.get_response(request)

        # Allow if correct API key header present
        api_key = request.headers.get('X-API-Key', '')
        if api_key == self.api_key:
            return self.get_response(request)

        # Allow if request comes from trusted Vercel origin
        origin = request.headers.get('Origin', '')
        referer = request.headers.get('Referer', '')
        trusted = os.environ.get(
            'CORS_ALLOWED_ORIGINS',
            'https://cravelyfood-in.vercel.app'
        )
        trusted_list = trusted.split(',')

        for t in trusted_list:
            t = t.strip()
            if t and (origin.startswith(t) or referer.startswith(t)):
                return self.get_response(request)

        # Block direct browser access
        return JsonResponse(
            {'detail': 'Authentication credentials were not provided.'},
            status=401
        )
