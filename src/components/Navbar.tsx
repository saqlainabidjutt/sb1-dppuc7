import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, BarChart3, LogOut, DollarSign, Users, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, userRole, userName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const NavLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
        isActive(to) ? 'bg-indigo-700' : 'hover:bg-indigo-700'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:inline">DriverTrack</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/dashboard" icon={BarChart3}>Dashboard</NavLink>
            <NavLink to="/sales" icon={DollarSign}>Enter Sales</NavLink>
            <NavLink to="/reports" icon={BarChart3}>Reports</NavLink>
            {userRole === 'admin' && (
              <NavLink to="/drivers" icon={Users}>Manage Drivers</NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {userRole === 'admin' && (
              <NavLink to="/settings" icon={Settings}>Settings</NavLink>
            )}
            <span className="text-sm">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            <NavLink to="/dashboard" icon={BarChart3}>Dashboard</NavLink>
            <NavLink to="/sales" icon={DollarSign}>Enter Sales</NavLink>
            <NavLink to="/reports" icon={BarChart3}>Reports</NavLink>
            {userRole === 'admin' && (
              <>
                <NavLink to="/drivers" icon={Users}>Manage Drivers</NavLink>
                <NavLink to="/settings" icon={Settings}>Settings</NavLink>
              </>
            )}
            <div className="pt-2 border-t border-indigo-500">
              <div className="px-3 py-2 text-sm">{userName}</div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-indigo-700 transition text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;