import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from .serializers import (
    LoginSerializer, UserSerializer, SeriesDataSerializer, SnapshotDataSerializer,
    SeriesResponseSerializer, SnapshotResponseSerializer, CountrySerializer,
    IndicatorSerializer, ErrorSerializer
)
from .services.worldbank import WorldBankService, WorldBankAPIError
from .utils import log_api_request

logger = logging.getLogger(__name__)


def create_error_response(code: str, message: str, details=None, status_code=400):
    """Create standardized error response"""
    error_data = {
        'error': {
            'code': code,
            'message': message,
            'details': details
        }
    }
    return Response(error_data, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User authentication endpoint
    """
    log_api_request(request, 'login_attempt')
    
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return create_error_response(
            'VALIDATION_ERROR',
            'Invalid input data',
            serializer.errors,
            status.HTTP_400_BAD_REQUEST
        )
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    user = authenticate(username=username, password=password)
    if not user:
        log_api_request(request, 'login_failed', user=None)
        return create_error_response(
            'INVALID_CREDENTIALS',
            'Invalid username or password',
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return create_error_response(
            'ACCOUNT_DISABLED',
            'User account is disabled',
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    
    log_api_request(request, 'login_success', user=user)
    
    return Response({
        'access': str(access),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint
    """
    log_api_request(request, 'logout', user=request.user)
    
    try:
        # Add refresh token to blacklist if provided
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception as e:
        logger.warning(f"Error blacklisting token: {e}")
    
    return Response({
        'detail': 'Successfully logged out'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    """
    JWT token refresh endpoint
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return create_error_response(
            'MISSING_REFRESH_TOKEN',
            'Refresh token is required',
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token
        
        return Response({
            'access': str(access)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return create_error_response(
            'INVALID_TOKEN',
            'Invalid or expired refresh token',
            status_code=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def countries_view(request):
    """
    Get list of available countries
    """
    log_api_request(request, 'get_countries')
    
    try:
        wb_service = WorldBankService()
        countries = wb_service.get_countries()
        
        serializer = CountrySerializer(countries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except WorldBankAPIError as e:
        logger.error(f"World Bank API error in countries_view: {e}")
        return create_error_response(
            'EXTERNAL_API_ERROR',
            'Failed to fetch countries data',
            str(e),
            status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        logger.error(f"Unexpected error in countries_view: {e}")
        return create_error_response(
            'INTERNAL_ERROR',
            'An unexpected error occurred',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def indicators_view(request):
    """
    Get list of available indicators
    """
    log_api_request(request, 'get_indicators')
    
    try:
        wb_service = WorldBankService()
        indicators = wb_service.get_indicators()
        
        serializer = IndicatorSerializer(indicators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in indicators_view: {e}")
        return create_error_response(
            'INTERNAL_ERROR',
            'Failed to fetch indicators',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def series_view(request):
    """
    Get time series data for indicators and countries
    """
    user = request.user if request.user.is_authenticated else None
    log_api_request(request, 'get_series', user=user)
    
    # Validate query parameters
    serializer = SeriesDataSerializer(data=request.GET)
    if not serializer.is_valid():
        return create_error_response(
            'VALIDATION_ERROR',
            'Invalid query parameters',
            serializer.errors,
            status.HTTP_400_BAD_REQUEST
        )
    
    try:
        wb_service = WorldBankService()
        data = wb_service.get_series_data(
            indicator=serializer.validated_data['indicator'],
            countries=serializer.validated_data['countries'],
            start_year=serializer.validated_data['start'],
            end_year=serializer.validated_data['end'],
            per_capita=serializer.validated_data['per_capita'],
            log_scale=serializer.validated_data['log']
        )
        
        response_serializer = SeriesResponseSerializer(data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except WorldBankAPIError as e:
        logger.error(f"World Bank API error in series_view: {e}")
        return create_error_response(
            'EXTERNAL_API_ERROR',
            'Failed to fetch series data',
            str(e),
            status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        logger.error(f"Unexpected error in series_view: {e}")
        return create_error_response(
            'INTERNAL_ERROR',
            'An unexpected error occurred',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def snapshot_view(request):
    """
    Get snapshot data for a specific year
    """
    log_api_request(request, 'get_snapshot', user=request.user)
    
    # Validate query parameters
    serializer = SnapshotDataSerializer(data=request.GET)
    if not serializer.is_valid():
        return create_error_response(
            'VALIDATION_ERROR',
            'Invalid query parameters',
            serializer.errors,
            status.HTTP_400_BAD_REQUEST
        )
    
    try:
        wb_service = WorldBankService()
        data = wb_service.get_snapshot_data(
            indicator=serializer.validated_data['indicator'],
            year=serializer.validated_data['year'],
            countries=serializer.validated_data['countries']
        )
        
        response_serializer = SnapshotResponseSerializer(data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except WorldBankAPIError as e:
        logger.error(f"World Bank API error in snapshot_view: {e}")
        return create_error_response(
            'EXTERNAL_API_ERROR',
            'Failed to fetch snapshot data',
            str(e),
            status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        logger.error(f"Unexpected error in snapshot_view: {e}")
        return create_error_response(
            'INTERNAL_ERROR',
            'An unexpected error occurred',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
