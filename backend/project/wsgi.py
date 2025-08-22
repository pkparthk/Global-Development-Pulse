import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

application = get_wsgi_application()

# Initialize MongoDB connection
try:
    from api.mongodb import init_mongodb
    init_mongodb()
except ImportError:
    pass  # MongoDB not configured
