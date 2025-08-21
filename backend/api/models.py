from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class QueryCache(models.Model):
    """Cache for World Bank API responses"""
    key = models.CharField(max_length=255, unique=True)
    payload = models.JSONField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'query_cache'
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['expires_at']),
        ]
    
    def is_expired(self):
        """Check if cache entry is expired"""
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"Cache: {self.key} (expires: {self.expires_at})"


class AuditLog(models.Model):
    """Audit log for API requests"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    action = models.CharField(max_length=100)
    path = models.CharField(max_length=500)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_log'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        user_str = self.user.username if self.user else 'Anonymous'
        return f"{user_str} - {self.action} - {self.timestamp}"


class Country(models.Model):
    """Country metadata"""
    code = models.CharField(max_length=3, unique=True)  # ISO3 code
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=255, blank=True)
    income_level = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'countries'
        verbose_name_plural = 'Countries'
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Indicator(models.Model):
    """Indicator metadata"""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'indicators'
    
    def __str__(self):
        return f"{self.name} ({self.code})"
