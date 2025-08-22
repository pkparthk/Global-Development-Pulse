import os
from mongoengine import connect, Document, StringField, DateTimeField, IntField, FloatField, ListField, BooleanField
from datetime import datetime
from django.conf import settings
from decouple import config

def init_mongodb():
    """Initialize MongoDB connection"""
    mongodb_uri = config('MONGODB_URI', default='')
    if mongodb_uri:
        connect(host=mongodb_uri, alias='default')
        print("✅ Connected to MongoDB Atlas")
    else:
        print("⚠️ MongoDB URI not configured, skipping MongoDB connection")

# Example MongoDB Models using MongoEngine
class AnalyticsEvent(Document):
    """Store user analytics and activity tracking"""
    user_id = IntField()
    username = StringField(max_length=150)
    event_type = StringField(max_length=100, required=True)
    event_data = StringField()  # JSON string for flexible data
    ip_address = StringField(max_length=45)
    user_agent = StringField()
    timestamp = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'analytics_events',
        'indexes': [
            'user_id',
            'event_type', 
            'timestamp',
            ('user_id', 'event_type')
        ]
    }

class WorldBankDataCache(Document):
    """Cache World Bank API responses in MongoDB"""
    indicator = StringField(max_length=50, required=True)
    country_codes = ListField(StringField(max_length=3))
    start_year = IntField()
    end_year = IntField()
    per_capita = BooleanField(default=False)
    log_scale = BooleanField(default=False)
    data = StringField()  # JSON string of the actual data
    cached_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField()
    
    meta = {
        'collection': 'worldbank_cache',
        'indexes': [
            'indicator',
            'cached_at',
            'expires_at',
            ('indicator', 'country_codes', 'start_year', 'end_year')
        ]
    }

class UserPreferences(Document):
    """Store user preferences and settings in MongoDB"""
    user_id = IntField(required=True, unique=True)
    username = StringField(max_length=150)
    favorite_indicators = ListField(StringField(max_length=50))
    favorite_countries = ListField(StringField(max_length=3))
    dashboard_layout = StringField()  # JSON string for dashboard configuration
    theme = StringField(max_length=20, default='light')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_preferences',
        'indexes': ['user_id', 'username']
    }

def save_analytics_event(user_id, username, event_type, event_data=None, request=None):
    """Helper function to save analytics events"""
    try:
        event = AnalyticsEvent(
            user_id=user_id,
            username=username,
            event_type=event_type,
            event_data=event_data,
            ip_address=get_client_ip(request) if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None
        )
        event.save()
        return event
    except Exception as e:
        print(f"Error saving analytics event: {e}")
        return None

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
