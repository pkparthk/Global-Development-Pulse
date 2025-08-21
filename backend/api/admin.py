
from django.contrib import admin
from .models import QueryCache, AuditLog, Country, Indicator


@admin.register(QueryCache)
class QueryCacheAdmin(admin.ModelAdmin):
    list_display = ['key', 'created_at', 'expires_at', 'is_expired']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['key']
    readonly_fields = ['key', 'created_at']
    
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'path', 'ip_address', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'action', 'path', 'ip_address']
    readonly_fields = ['user', 'action', 'path', 'ip_address', 'user_agent', 'timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'region', 'is_active']
    list_filter = ['region', 'is_active']
    search_fields = ['code', 'name', 'region']
    ordering = ['name']


@admin.register(Indicator)
class IndicatorAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'is_default', 'is_active']
    list_filter = ['category', 'is_default', 'is_active']
    search_fields = ['code', 'name', 'category']
    ordering = ['category', 'name']
