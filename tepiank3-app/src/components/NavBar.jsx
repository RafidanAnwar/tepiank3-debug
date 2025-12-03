import { useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { ContextApi } from '../Context/ContextApi';
import { authService } from '../services/authService';
import { userService } from '../services/userService';



export const NavBar = () => {
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



    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sticky top-0 z-1">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <img className='max-w-40' src="./Tepian-K3-Logo-1.svg" alt="" />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {isActive("/home") && (
                            <>
                                <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-blue-600 font-medium">Beranda</button>
                                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Transaksi</a>
                                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Troli</a>

                            </>
                        )}
                        {isActive("/pengujian") && (
                            <>
                                <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-blue-600 font-medium">Beranda</button>
                                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Riwayat</a>

                            </>
                        )}
                    </nav>

                    {/* Search & User */}
                    <div className="flex items-center space-x-4">
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
                                <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold ${userProfile?.avatar && userProfile.avatar.startsWith('/uploads') ? 'hidden' : 'flex'}`}>
                                    {(userProfile?.firstname || user?.firstname || 'G').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800">{userProfile?.firstname || user?.firstname || "Guest"}</p>
                                    <p className="text-xs text-gray-500">{user?.role || "User"}</p>
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
                                    <button
                                        onClick={() => navigate('/HomeAdm')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Dashboard</span>
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
        </header >
    )
}