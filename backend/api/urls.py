from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Metadata endpoints
    path('meta/countries/', views.countries_view, name='countries'),
    path('meta/indicators/', views.indicators_view, name='indicators'),
    
    # Data endpoints
    path('data/series/', views.series_view, name='series'),
    path('data/snapshot/', views.snapshot_view, name='snapshot'),
]
