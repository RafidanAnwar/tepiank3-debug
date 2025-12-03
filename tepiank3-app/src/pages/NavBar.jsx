import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef, useContext } from 'react';
import { userService } from '../services/userService';
import { ContextApi } from '../Context/ContextApi';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user, logout } = useContext(ContextApi);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogout = () => {
    try {
      console.log('Logging out...');
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login', { replace: true });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check user role and page context
  const isAdmin = userProfile?.role === 'ADMIN' || user?.role === 'ADMIN';
  const isAdminPage = location.pathname.includes('/HomeAdm') ||
    location.pathname.includes('/Cluster') ||
    location.pathname.includes('/JenisPengujian') ||
    location.pathname.includes('/Parameter') ||
    location.pathname.includes('/Peralatan') ||
    location.pathname.includes('/User');
  const isUserPage = location.pathname.includes('/Home') ||
    location.pathname.includes('/pengujian') ||
    location.pathname.includes('/Worksheet') ||
    location.pathname.includes('/Personalisasi');


  return (
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
        <nav className="hidden md:flex items-center justify-center space-x-8 flex-1">
          {/* Common Navigation for both User and Admin */}
          {(isUserPage || !isAdminPage) && (
            <button
              onClick={() => navigate(isAdmin ? "/HomeAdm" : "/Home")}
              className={`pb-1 font-medium transition ${(isActive("/Home") || isActive("/HomeAdm"))
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-gray-700 hover:text-blue-600"
                }`}
            >
              Beranda
            </button>
          )}

          {/* Worksheet - Available for all users */}
          <button
            onClick={() => navigate("/Worksheet")}
            className={`pb-1 font-medium transition ${isActive("/Worksheet")
              ? "text-blue-600 font-semibold border-b-2 border-blue-600"
              : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Worksheet
          </button>

          {/* Personalisasi - Available for all users */}
          <button
            onClick={() => navigate("/Personalisasi")}
            className={`pb-1 font-medium transition ${isActive("/Personalisasi")
              ? "text-blue-600 font-semibold border-b-2 border-blue-600"
              : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Personalisasi
          </button>

          {/* User-specific navigation */}
          {(isUserPage || !isAdminPage) && !isAdmin && (
            <>
              <button
                onClick={() => navigate("/transaksi")}
                className={`pb-1 font-medium transition ${isActive("/transaksi")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                Transaksi
              </button>
              <button
                onClick={() => navigate("/troli")}
                className={`pb-1 font-medium transition ${isActive("/troli")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                Troli
              </button>
            </>
          )}

          {/* Context-specific navigation */}
          {isActive("/pengujian") && (
            <button
              onClick={() => navigate("/Home")}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Riwayat
            </button>
          )}
        </nav>

        {/* === USER SECTION === */}
        <div className="flex items-center justify-end space-x-4">


          {/* User Info */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <div className="flex items-center space-x-2 cursor-pointer">
              {userProfile?.avatar && userProfile.avatar.startsWith('/uploads') ? (
                <img
                  src={`http://localhost:3001${userProfile.avatar}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold ${userProfile?.avatar && userProfile.avatar.startsWith('/uploads') ? 'hidden' : 'flex'}`}>
                {(userProfile?.firstname || user?.firstname || 'G').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {userProfile?.firstname || user?.firstname || "Guest"}
                  </p>

                </div>
                <p className="text-xs text-gray-500">{userProfile?.role || user?.role || "USER"}</p>
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
                {isAdmin && (
                  <button
                    onClick={() => navigate(isAdminPage ? '/Home' : '/HomeAdm')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{isAdminPage ? 'User View' : 'Admin Dashboard'}</span>
                  </button>
                )}
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

export default NavBar;
export { NavBar };
