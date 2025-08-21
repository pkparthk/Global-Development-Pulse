from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class LoginSerializer(serializers.Serializer):
    """Serializer for login requests"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class SeriesDataSerializer(serializers.Serializer):
    """Serializer for series data requests"""
    indicator = serializers.CharField()
    countries = serializers.CharField(help_text="Comma-separated list of ISO3 country codes")
    start = serializers.IntegerField(default=2000, min_value=1960, max_value=2024)
    end = serializers.IntegerField(default=2024, min_value=1960, max_value=2024)
    per_capita = serializers.BooleanField(default=False)
    log = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate that start year is before end year"""
        if data['start'] > data['end']:
            raise serializers.ValidationError("Start year must be before or equal to end year")
        return data
    
    def validate_countries(self, value):
        """Validate and parse countries parameter"""
        if not value:
            raise serializers.ValidationError("At least one country must be specified")
        
        countries = [c.strip().upper() for c in value.split(',')]
        
        if len(countries) > 6:
            raise serializers.ValidationError("Maximum 6 countries allowed")
        
        # Basic validation - should be 3-character codes
        for country in countries:
            if len(country) != 3 or not country.isalpha():
                raise serializers.ValidationError(f"Invalid country code: {country}")
        
        return countries


class SnapshotDataSerializer(serializers.Serializer):
    """Serializer for snapshot data requests"""
    indicator = serializers.CharField()
    year = serializers.IntegerField(min_value=1960, max_value=2024)
    countries = serializers.CharField(help_text="Comma-separated list of ISO3 country codes")
    
    def validate_countries(self, value):
        """Validate and parse countries parameter"""
        if not value:
            raise serializers.ValidationError("At least one country must be specified")
        
        countries = [c.strip().upper() for c in value.split(',')]
        
        if len(countries) > 6:
            raise serializers.ValidationError("Maximum 6 countries allowed")
        
        # Basic validation - should be 3-character codes
        for country in countries:
            if len(country) != 3 or not country.isalpha():
                raise serializers.ValidationError(f"Invalid country code: {country}")
        
        return countries


class CountrySerializer(serializers.Serializer):
    """Serializer for country data"""
    code = serializers.CharField()
    name = serializers.CharField()
    region = serializers.CharField()


class IndicatorSerializer(serializers.Serializer):
    """Serializer for indicator data"""
    code = serializers.CharField()
    name = serializers.CharField()
    category = serializers.CharField()


class DataPointSerializer(serializers.Serializer):
    """Serializer for individual data points"""
    year = serializers.IntegerField()
    value = serializers.FloatField(allow_null=True)


class CountrySeriesSerializer(serializers.Serializer):
    """Serializer for country series data"""
    country = serializers.CharField()
    data = DataPointSerializer(many=True)


class SeriesResponseSerializer(serializers.Serializer):
    """Serializer for series response"""
    indicator = serializers.CharField()
    series = CountrySeriesSerializer(many=True)
    source = serializers.CharField()


class CountryValueSerializer(serializers.Serializer):
    """Serializer for country value in snapshot"""
    country = serializers.CharField()
    value = serializers.FloatField(allow_null=True)


class SnapshotResponseSerializer(serializers.Serializer):
    """Serializer for snapshot response"""
    indicator = serializers.CharField()
    year = serializers.IntegerField()
    values = CountryValueSerializer(many=True)
    source = serializers.CharField()


class ErrorSerializer(serializers.Serializer):
    """Serializer for error responses"""
    error = serializers.DictField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['error'].child = serializers.DictField()
