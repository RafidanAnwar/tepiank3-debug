import { useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut, LayoutDashboard, ShoppingCart, FileText } from 'lucide-react';
import { ContextApi } from '../../context/ContextApi';
import { useCart } from '../../context/CartContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';



export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const { user, logout } = useContext(ContextApi);
    const { cartCount } = useCart();
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
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
                        <img className='max-w-40' src="/Tepian-K3-Logo-1.svg" alt="" />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => navigate('/home')}
                            className={`font-medium hover:text-blue-600 ${isActive('/home') ? 'text-blue-600' : 'text-gray-700'}`}
                        >
                            Beranda
                        </button>

                        <button
                            onClick={() => navigate('/transactions')}
                            className={`flex items-center space-x-1 font-medium hover:text-blue-600 ${isActive('/transactions') ? 'text-blue-600' : 'text-gray-700'}`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Transaksi</span>
                        </button>

                        <button
                            onClick={() => navigate('/cart')}
                            className={`flex items-center space-x-1 font-medium hover:text-blue-600 ${isActive('/cart') ? 'text-blue-600' : 'text-gray-700'}`}
                        >
                            <div className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span>Troli</span>
                        </button>
                    </nav>

                    {/* Search & User */}
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden lg:block">
                            <input
                                type="text"
                                placeholder="Search here.."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                        <button className="relative p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                            <Bell className="w-5 h-5 text-gray-600" />
                        </button>

                        <div
                            ref={menuRef}
                            className="relative"
                            onMouseEnter={() => setShowUserMenu(true)}
                            onMouseLeave={() => setShowUserMenu(false)}
                        >
                            <div className="flex items-center space-x-2 cursor-pointer">
                                {userProfile?.avatar && userProfile.avatar.startsWith('/uploads') ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${userProfile.avatar}`}
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
        </header>
    )
}

export default NavBar;