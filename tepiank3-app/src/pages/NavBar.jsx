import { useNavigate, useLocation } from "react-router-dom";
import {Search, Bell, ChevronDown,LogOut, UserCircle} from "lucide-react";
import { useState } from 'react';

export default function NavBar(){
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [showUserMenu, setShowUserMenu] = useState(false);

      const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login', { replace: true });
  };


    return(
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === LOGO === */}
          <div className="flex items-center justify-start space-x-2 flex-shrink-0">
            <img
              className="max-w-40"
              src="./Tepian-K3-Logo-1.svg"
              alt="logo"
            />
          </div>

          {/* === NAVIGATION === */}
          <nav className="hidden md:flex items-center justify-center space-x-8 flex-1 ">
            {/* Beranda */}
            <button
              onClick={() => navigate("/Home")}
              className={`pb-1 font-medium transition ${
                isActive("/home")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Beranda
            </button>

            {/* Worksheet */}
            <button
              onClick={() => navigate("/Worksheet")}
              className={`pb-1 font-medium transition ${
                isActive("/Worksheet")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Worksheet
            </button>

            {/* Personalisasi */}
            <button
              onClick={() => navigate("/Personalisasi")}
              className={`pb-1 font-medium transition ${
                isActive("/Personalisasi")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Personalisasi
            </button>
          </nav>

          {/* === USER SECTION === */}
          <div className="flex items-center justify-end space-x-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search here.."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Notification */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Info */}
            <div
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full"></div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Arif Budiman
                </p>
                <p className="text-xs text-gray-500">Kaji Ulang</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </div>

            {showUserMenu && (
                  <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <button
                      onClick={() => navigate('/Profile')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

            </div>
          </div>
        </div>
      </div>
        )
}
