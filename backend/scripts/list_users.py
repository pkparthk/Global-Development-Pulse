#!/usr/bin/env python
import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.contrib.auth.models import User

def list_users():
    """List all registered users"""
    users = User.objects.all().order_by('date_joined')
    
    if not users.exists():
        print("No users found in the database.")
        return
    
    print(f"\n📊 Total Users: {users.count()}")
    print("=" * 80)
    print(f"{'ID':<4} {'Username':<15} {'Name':<25} {'Email':<30} {'Joined':<20}")
    print("=" * 80)
    
    for user in users:
        full_name = f"{user.first_name} {user.last_name}".strip() or "N/A"
        joined = user.date_joined.strftime("%Y-%m-%d %H:%M")
        print(f"{user.id:<4} {user.username:<15} {full_name:<25} {user.email:<30} {joined:<20}")
    
    print("=" * 80)

if __name__ == "__main__":
    try:
        list_users()
    except Exception as e:
        print(f"❌ Error: {e}")
