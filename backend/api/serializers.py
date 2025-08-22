from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
import re


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


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate_password(self, value):
        """
        Custom password validation to match frontend requirements
        """
        # Use Django's built-in password validation first
        validate_password(value)
        
        # Additional custom validations
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        
        if not re.search(r'[a-zA-Z]', value):
            raise serializers.ValidationError("Password must contain at least one letter")
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one number")
        
        if not re.search(r'[^a-zA-Z0-9]', value):
            raise serializers.ValidationError("Password must contain at least one special character")
        
        if re.match(r'^\d+$', value):
            raise serializers.ValidationError("Password cannot be only numbers")
        
        return value

    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        """Validate email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value
    
    def validate_username(self, value):
        """Validate username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists")
        return value
    
    def create(self, validated_data):
        """Create user with encrypted password"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


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
