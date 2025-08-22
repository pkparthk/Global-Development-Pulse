import React, { useState } from "react";
import {
  LogOut,
  User,
  BarChart3,
  Globe,
  TrendingUp,
  // Settings,
  Mail,
  // Calendar,
  X,
  // Bell
} from "lucide-react";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUserProfile } from "@/services/queries";
import { apiService } from "@/services/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, isLoggingOut, isAuthenticated } = useAuth();
  const { data: currentUser, isLoading, error } = useUserProfile();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleProfileToggle = () => {
    setShowProfile(!showProfile);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  // Fallback user data from token if API fails
  const displayUser = currentUser || apiService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Global Development Pulse
                </h1>
                <p className="text-sm text-gray-600">
                  World Bank Data Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 relative">
              {/* <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button> */}

              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Globe className="h-4 w-4 mr-2" />
                Data Sources
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileToggle}
                className="relative"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <Card className="w-80 shadow-lg border bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Profile Information
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleProfileToggle}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {displayUser ? (
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 rounded-full p-2">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {displayUser.first_name && displayUser.last_name
                                  ? `${displayUser.first_name} ${displayUser.last_name}`
                                  : displayUser.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{displayUser.username}
                              </p>
                            </div>
                          </div>

                          {displayUser.email && (
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 rounded-full p-2">
                                <Mail className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Email
                                </p>
                                <p className="text-sm text-gray-500">
                                  {displayUser.email}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 rounded-full p-2">
                              <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                User ID
                              </p>
                              <p className="text-sm text-gray-500">
                                #{displayUser.id}
                              </p>
                            </div>
                          </div> */}
                          {error && (
                            <div className="text-center text-xs text-orange-500 mt-2">
                              Profile data from cache (API unavailable)
                            </div>
                          )}
                        </>
                      ) : isLoading ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            Loading user information...
                          </p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-4">
                          <p className="text-red-500">
                            Failed to load user information
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {error.message}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No user information available
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay to close profile when clicking outside */}
      {showProfile && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={handleProfileToggle}
        />
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2025 Global Development Pulse</span>
              <span>•</span>
              <span>Powered by World Bank Open Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Real-time analytics platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
