import React from "react";
import {
  LogOut, User, BarChart3, Globe, TrendingUp,
  // Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/services/queries";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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

            <div className="flex items-center space-x-2">
              {/* <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button> */}

              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Globe className="h-4 w-4 mr-2" />
                Data Sources
              </Button>

              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
