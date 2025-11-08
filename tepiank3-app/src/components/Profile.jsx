import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle, ArrowLeft, Camera, Upload, X, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('view'); // 'view', 'edit', or 'password'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);




  // Profile data state
  const [profileData, setProfileData] = useState({
    name: 'Musfiq',
    email: 'musfiq@example.com',
    phone: '',
    address: '',
    photo: null,
    password: 'oldpassword123' // Stored for demo purposes
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Check if profile is complete
  const isProfileComplete = () => {
    return profileData.name && profileData.email && profileData.phone && profileData.address;
  };

  // // Show warning on first visit if profile incomplete
  // useEffect(() => {
  //   if (isFirstVisit && !isProfileComplete()) {
  //     setShowWarningPopup(true);
  //     setIsFirstVisit(false);
  //   }
  // }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setCurrentPage('edit');
  };

  const handlePasswordClick = () => {
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setCurrentPage('password');
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    setPasswordErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validatePassword = () => {
    const errors = {};

    // Check old password
    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Password lama harus diisi';
    } else if (passwordData.oldPassword !== profileData.password) {
      errors.oldPassword = 'Password lama tidak sesuai';
    }

    // Check new password
    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru harus diisi';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password minimal 8 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    } else if (passwordData.newPassword === passwordData.oldPassword) {
      errors.newPassword = 'Password baru harus berbeda dengan password lama';
    }

    // Check confirm password
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak sesuai';
    }

    return errors;
  };

  const handlePasswordSubmit = () => {
    const errors = validatePassword();

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    // Save new password
    setProfileData(prev => ({ ...prev, password: passwordData.newPassword }));
    setCurrentPage('view');
    setSuccessMessage('Password berhasil diubah');
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handlePhotoSelect = (event, source) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
    setShowPhotoOptions(false);
  };

  const handleSaveChanges = () => {
    // Validate all fields
    if (!editData.name || !editData.email || !editData.phone || !editData.address) {
      // setShowWarningPopup(true);
      return;
    }

    // Save changes
    setProfileData({ ...editData });
    setCurrentPage('view');
    setSuccessMessage('Data profil berhasil disimpan');
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handleLogout = () => {
    alert('Logging out...');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-800">Berhasil!</p>
              <p className="text-sm text-gray-600">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Popup */}
      {/* {showWarningPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Lengkapi Data Profil</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Harap lengkapi semua data profil Anda (Nama, Email, No HP, dan Alamat) untuk melanjutkan.
                </p>
                <button
                  onClick={() => setShowWarningPopup(false)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img className='max-w-40' src="./Tepian-K3-Logo-1.svg" alt="" />
              {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">TEPIAN<span className="text-blue-600">K3</span></h1>
                <p className="text-xs text-gray-500">Balai Kesehatan Pengujuan dan Laboratorium</p>
              </div> */}
            </div>

            <div className="flex items-center">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  {profileData.photo ? (
                    <img src={profileData.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(profileData.name)}</span>
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{profileData.name}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                    <button
                      onClick={() => {
                        setCurrentPage('view');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                    >
                      <UserCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">Profile</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors group">
                      <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                      <span className="text-sm text-gray-700 group-hover:text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentPage === 'view' ? (
          // View Profile Page
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/home')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Kembali</h2>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Profil Saya</h2>
              <div className="flex space-x-3">


                {/* <button
                  onClick={() => navigate('/home')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <span>Kembali</span>
                </button> */}

                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Edit Profil</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8">
              {profileData.photo ? (
                <img src={profileData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-100" />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-4 border-4 border-blue-100">
                  <span className="text-white font-bold text-4xl">{getInitials(profileData.name)}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Nama Lengkap</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.name || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.email || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">No. HP</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.phone || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Alamat</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.address || '-'}</p>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">*********</p>
                </div>
              </div>
              <button
                onClick={handlePasswordClick}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Ubah Password</span>
              </button>
            </div>
          </div>
        ) : currentPage === 'password' ? (
          // Change Password Page
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('view')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Ubah Password</h2>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Lama <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordData.oldPassword}
                    onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border ${passwordErrors.oldPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Masukkan password lama"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Masukkan ulang password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mt-8"
              >
                Simpan Password Baru
              </button>
            </div>
          </div>
        ) : (
          // Edit Profile Page
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage('view')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Edit Profil</h2>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {editData.photo ? (
                  <img src={editData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-100" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center border-4 border-blue-100">
                    <span className="text-white font-bold text-4xl">{getInitials(editData.name)}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowPhotoOptions(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {showPhotoOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Pilih Foto Profil</h3>
                      <button onClick={() => setShowPhotoOptions(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => cameraInputRef.current.click()}
                        className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Ambil Foto dari Kamera</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Pilih dari Folder</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect(e, 'file')}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoSelect(e, 'camera')}
                className="hidden"
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nomor HP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <button
                onClick={handleSaveChanges}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="text-center pb-12 pt-16">
        <div className="inline-block">
          <img className="w-55" src="./Logo-DED-Balai-K3-Smr-1.svg" alt="logo" />
        </div>
      </div>



      {/* <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style> */}
    </div>



  );

};

export default Profile;