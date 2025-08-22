import React, { useState } from "react";
import {
  LogOut,
  User,
  BarChart3,
  Globe,
  TrendingUp,
  Settings,
  Mail,
  Calendar,
  X,
  // Bell
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/services/queries";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, currentUser, isLoggingOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleProfileToggle = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      {currentUser ? (
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 rounded-full p-2">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {currentUser.first_name && currentUser.last_name
                                  ? `${currentUser.first_name} ${currentUser.last_name}`
                                  : currentUser.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{currentUser.username}
                              </p>
                            </div>
                          </div>

                          {currentUser.email && (
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 rounded-full p-2">
                                <Mail className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Email
                                </p>
                                <p className="text-sm text-gray-500">
                                  {currentUser.email}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 rounded-full p-2">
                              <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                User ID
                              </p>
                              <p className="text-sm text-gray-500">
                                #{currentUser.id}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mb-2"
                              onClick={() => {
                                // For now, just show user info. Could be expanded later.
                                toast.info("Profile management coming soon!");
                                setShowProfile(false);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Account Settings
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setShowProfile(false);
                                handleLogout();
                              }}
                              disabled={isLoggingOut}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              {isLoggingOut ? "Logging out..." : "Logout"}
                            </Button>
                          </div>
                        </>
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
