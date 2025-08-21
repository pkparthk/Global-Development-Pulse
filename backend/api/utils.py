import logging
from django.utils import timezone
from .models import AuditLog

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_api_request(request, action, user=None):
    """Log API request for audit purposes"""
    try:
        AuditLog.objects.create(
            user=user or getattr(request, 'user', None) if hasattr(request, 'user') and request.user.is_authenticated else None,
            action=action,
            path=request.path,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:1000],  # Limit length
        )
    except Exception as e:
        logger.warning(f"Failed to log API request: {e}")
