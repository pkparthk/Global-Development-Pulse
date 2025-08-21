from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for deployment monitoring"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Global Development Pulse API'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/', include('api.urls')),
]
