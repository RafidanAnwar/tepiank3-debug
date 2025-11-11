import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut } from 'lucide-react';
import { ContextApi } from '../Context/ContextApi';



export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user } = useContext(ContextApi);
    // const [user, setUser] = useState(null);


    // useEffect(() => {
    //     const raw = localStorage.getItem('loggedUser');
    //     if (!raw) {
    //         // kalau belum login, arahkan ke /login
    //         navigate('/login');
    //         return;
    //     }
    //     try {
    //         const parsed = JSON.parse(raw);
    //         setUser(parsed);
    //     } catch (err) {
    //         console.error('Gagal parse loggedUser', err);
    //         navigate('/login');
    //     }
    // }, [navigate]);


    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/login', { replace: true });
    };



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
                            className="relative"
                            onMouseEnter={() => setShowUserMenu(true)}
                            onMouseLeave={() => setShowUserMenu(false)}
                        >
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800">{user.firstname || "Undefind"}</p>
                                    <p className="text-xs text-gray-500">{user.role || "Undefind"}</p>
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
                                        <UserCircle className="w-4 h-4" />
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