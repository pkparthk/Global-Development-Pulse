import requests
import logging
import hashlib
from typing import List, Dict, Optional, Any
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from ..models import QueryCache

logger = logging.getLogger(__name__)


class WorldBankAPIError(Exception):
    """Custom exception for World Bank API errors"""
    pass


class WorldBankService:
    """Service class for World Bank API integration"""
    
    def __init__(self):
        self.base_url = settings.WORLD_BANK_API_BASE
        self.cache_ttl = settings.CACHE_TTL
        
    def _generate_cache_key(self, **kwargs) -> str:
        """Generate a unique cache key for the query parameters"""
        # Sort parameters for consistent key generation
        sorted_params = sorted(kwargs.items())
        param_string = '&'.join([f"{k}={v}" for k, v in sorted_params])
        return hashlib.md5(param_string.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get data from cache if available and not expired"""
        try:
            # Try Redis cache first
            cached_data = cache.get(cache_key)
            if cached_data:
                return cached_data
            
            # Fallback to database cache
            try:
                cache_entry = QueryCache.objects.get(key=cache_key)
                if not cache_entry.is_expired():
                    # Update Redis cache
                    cache.set(cache_key, cache_entry.payload, self.cache_ttl)
                    return cache_entry.payload
                else:
                    # Delete expired entry
                    cache_entry.delete()
            except QueryCache.DoesNotExist:
                pass
            
        except Exception as e:
            logger.warning(f"Cache retrieval error: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, data: Dict) -> None:
        """Save data to cache"""
        try:
            # Save to Redis
            cache.set(cache_key, data, self.cache_ttl)
            
            # Save to database cache
            expires_at = timezone.now() + timedelta(seconds=self.cache_ttl)
            QueryCache.objects.update_or_create(
                key=cache_key,
                defaults={
                    'payload': data,
                    'expires_at': expires_at
                }
            )
        except Exception as e:
            logger.warning(f"Cache save error: {e}")
    
    def _make_request(self, url: str, params: Dict = None) -> Dict:
        """Make HTTP request to World Bank API with error handling"""
        try:
            response = requests.get(
                url,
                params=params,
                timeout=30,
                headers={'User-Agent': 'Global-Development-Pulse/1.0'}
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Check if the response contains an error message
            if data and len(data) >= 1 and isinstance(data[0], dict):
                if 'message' in data[0]:
                    error_messages = data[0]['message']
                    if isinstance(error_messages, list) and error_messages:
                        error_msg = error_messages[0].get('value', 'Unknown World Bank API error')
                        logger.error(f"World Bank API error: {error_msg}")
                        raise WorldBankAPIError(f"World Bank API error: {error_msg}")
            
            # Check for valid data format
            if not data or len(data) < 2:
                raise WorldBankAPIError("Invalid response format from World Bank API")
            
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"World Bank API request failed: {e}")
            raise WorldBankAPIError(f"Failed to fetch data from World Bank API: {str(e)}")
        except ValueError as e:
            logger.error(f"Invalid JSON response: {e}")
            raise WorldBankAPIError("Invalid response format from World Bank API")
    
    def _normalize_series_data(self, raw_data: List, countries: List[str]) -> List[Dict]:
        """Normalize World Bank API response to consistent format"""
        series = []
        
        # Group data by country
        country_data = {}
        for item in raw_data:
            if not item or not isinstance(item, dict):
                continue
                
            country_code = item.get('countryiso3code')
            if not country_code or country_code not in countries:
                continue
            
            if country_code not in country_data:
                country_data[country_code] = []
            
            year = item.get('date')
            value = item.get('value')
            
            if year and value is not None:
                try:
                    country_data[country_code].append({
                        'year': int(year),
                        'value': float(value)
                    })
                except (ValueError, TypeError):
                    continue
        
        # Create series for each country
        for country_code in countries:
            data_points = country_data.get(country_code, [])
            # Sort by year ascending
            data_points.sort(key=lambda x: x['year'])
            
            series.append({
                'country': country_code,
                'data': data_points
            })
        
        return series
    
    def _fetch_all_pages(self, base_url: str, params: Dict) -> List:
        """Fetch all pages from World Bank API"""
        all_data = []
        page = 1
        per_page = 1000  # Maximum allowed by World Bank API
        
        while True:
            current_params = {
                **params,
                'page': page,
                'per_page': per_page
            }
            
            logger.info(f"Fetching page {page} from World Bank API")
            response_data = self._make_request(base_url, current_params)
            
            # First element contains pagination info
            pagination_info = response_data[0] if response_data else {}
            data = response_data[1] if len(response_data) > 1 else []
            
            if not data:
                break
            
            all_data.extend(data)
            
            # Check if we have more pages
            total_pages = pagination_info.get('pages', 1)
            if page >= total_pages:
                break
            
            page += 1
        
        return all_data
    
    def get_series_data(
        self,
        indicator: str,
        countries: List[str],
        start_year: int = 1960,
        end_year: int = 2024,
        per_capita: bool = False,
        log_scale: bool = False
    ) -> Dict:
        """
        Get time series data for specified indicator and countries
        """
        # Generate cache key
        cache_key = self._generate_cache_key(
            type='series',
            indicator=indicator,
            countries=sorted(countries),
            start_year=start_year,
            end_year=end_year,
            per_capita=per_capita,
            log_scale=log_scale
        )
        
        # Try to get from cache
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            logger.info(f"Cache hit for series data: {cache_key}")
            return cached_data
        
        logger.info(f"Cache miss for series data: {cache_key}")
        
        # Prepare URL and parameters
        countries_str = ';'.join(countries)
        url = f"{self.base_url}/country/{countries_str}/indicator/{indicator}"
        
        params = {
            'date': f"{start_year}:{end_year}",
            'format': 'json',
            'per_page': 1000
        }
        
        try:
            # Fetch all pages
            raw_data = self._fetch_all_pages(url, params)
            
            # Normalize data
            series = self._normalize_series_data(raw_data, countries)
            
            # Apply transformations if needed
            if per_capita or log_scale:
                series = self._apply_transformations(series, per_capita, log_scale)
            
            result = {
                'indicator': indicator,
                'series': series,
                'source': 'World Bank Open Data'
            }
            
            # Cache the result
            self._save_to_cache(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching series data: {e}")
            raise WorldBankAPIError(f"Failed to fetch series data: {str(e)}")
    
    def get_snapshot_data(
        self,
        indicator: str,
        year: int,
        countries: List[str]
    ) -> Dict:
        """
        Get snapshot data for a specific year
        """
        # Generate cache key
        cache_key = self._generate_cache_key(
            type='snapshot',
            indicator=indicator,
            year=year,
            countries=sorted(countries)
        )
        
        # Try to get from cache
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            logger.info(f"Cache hit for snapshot data: {cache_key}")
            return cached_data
        
        logger.info(f"Cache miss for snapshot data: {cache_key}")
        
        # Prepare URL and parameters
        countries_str = ';'.join(countries)
        url = f"{self.base_url}/country/{countries_str}/indicator/{indicator}"
        
        params = {
            'date': str(year),
            'format': 'json',
            'per_page': 1000
        }
        
        try:
            # Fetch data
            raw_data = self._fetch_all_pages(url, params)
            
            # Process snapshot data
            values = []
            for item in raw_data:
                if not item or not isinstance(item, dict):
                    continue
                
                country_code = item.get('countryiso3code')
                if not country_code or country_code not in countries:
                    continue
                
                value = item.get('value')
                values.append({
                    'country': country_code,
                    'value': float(value) if value is not None else None
                })
            
            result = {
                'indicator': indicator,
                'year': year,
                'values': values,
                'source': 'World Bank Open Data'
            }
            
            # Cache the result
            self._save_to_cache(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching snapshot data: {e}")
            raise WorldBankAPIError(f"Failed to fetch snapshot data: {str(e)}")
    
    def _apply_transformations(self, series: List[Dict], per_capita: bool, log_scale: bool) -> List[Dict]:
        """Apply per capita and log scale transformations"""
        import math
        
        transformed_series = []
        
        for country_series in series:
            transformed_data = []
            
            for data_point in country_series['data']:
                value = data_point['value']
                
                if value is not None and value > 0:
                    # Apply log scale if requested
                    if log_scale:
                        try:
                            value = math.log10(value)
                        except (ValueError, ZeroDivisionError):
                            value = None
                
                transformed_data.append({
                    'year': data_point['year'],
                    'value': value
                })
            
            transformed_series.append({
                'country': country_series['country'],
                'data': transformed_data
            })
        
        return transformed_series
    
    def get_countries(self) -> List[Dict]:
        """Get list of countries"""
        cache_key = self._generate_cache_key(type='countries')
        
        # Try cache first
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data
        
        url = f"{self.base_url}/country"
        params = {
            'format': 'json',
            'per_page': 1000
        }
        
        try:
            raw_data = self._fetch_all_pages(url, params)
            
            countries = []
            for item in raw_data:
                if not item or not isinstance(item, dict):
                    continue
                
                # Skip aggregates and regions
                if item.get('capitalCity') or item.get('id') in ['WLD', 'EAS', 'ECS', 'LCN', 'MEA', 'NAC', 'SAS', 'SSF']:
                    countries.append({
                        'code': item.get('id'),
                        'name': item.get('name'),
                        'region': item.get('region', {}).get('value', '') if item.get('region') else ''
                    })
            
            # Sort by name
            countries.sort(key=lambda x: x['name'])
            
            # Cache the result
            self._save_to_cache(cache_key, countries)
            
            return countries
            
        except Exception as e:
            logger.error(f"Error fetching countries: {e}")
            raise WorldBankAPIError(f"Failed to fetch countries: {str(e)}")
    
    def get_indicators(self) -> List[Dict]:
        """Get predefined indicators from PRD"""
        # Return hardcoded indicators from PRD since World Bank indicators API is too large
        indicators = [
            {
                'code': 'NY.GDP.PCAP.CD',
                'name': 'GDP per capita (current US$)',
                'category': 'Economy'
            },
            {
                'code': 'EG.USE.ELEC.KH.PC',
                'name': 'Electric power consumption (kWh per capita)',
                'category': 'Environment'
            },
            {
                'code': 'SP.POP.TOTL',
                'name': 'Population, total',
                'category': 'Demography'
            }
        ]
        
        return indicators
