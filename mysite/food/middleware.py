import os
from django.http import JsonResponse


class APIKeyMiddleware:
    """
    Block direct browser access to /api/ endpoints.
    Allows requests from trusted Vercel origins and with correct API key.
    Auth endpoints always allowed.
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
        self.trusted_origins = [
            'https://cravelyfood-in.vercel.app',
            'https://cravelyfood-in-git-main-nextviewsinages-projects.vercel.app',
            'https://cravelyfood-87aybzrws-nextviewsinages-projects.vercel.app',
            'https://cravelyfood-nayqmqi9a-nextviewsinages-projects.vercel.app',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]
        # Add any extra origins from env
        extra = os.environ.get('CORS_ALLOWED_ORIGINS', '')
        if extra:
            self.trusted_origins += [o.strip() for o in extra.split(',') if o.strip()]

    def __call__(self, request):
        path = request.path

        # Only apply to /api/ routes
        if not path.startswith('/api/'):
            return self.get_response(request)

        # Always allow auth endpoints
        for allowed in self.ALWAYS_ALLOWED:
            if path.startswith(allowed):
                return self.get_response(request)

        # Allow correct API key
        if request.headers.get('X-API-Key', '') == self.api_key:
            return self.get_response(request)

        # Allow trusted origins
        origin = request.headers.get('Origin', '')
        referer = request.headers.get('Referer', '')
        for t in self.trusted_origins:
            if t and (origin.startswith(t) or referer.startswith(t)):
                return self.get_response(request)

        # Block everything else
        return JsonResponse(
            {'detail': 'Authentication credentials were not provided.'},
            status=401
        )
