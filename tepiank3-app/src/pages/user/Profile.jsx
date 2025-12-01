import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle, ArrowLeft, Camera, Upload, X, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { ContextApi } from '../../context/ContextApi';
import CameraCapture from '../../components/common/CameraCapture';

const Profile = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('view'); // 'view', 'edit', or 'password'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const { user, logout } = useContext(ContextApi);
  const [profileData, setProfileData] = useState({
    firstname: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    position: '',
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ ...profileData });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      const safeData = {
        firstname: data.firstname || '',
        fullname: data.fullname || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
        position: data.position || '',
        avatar: data.avatar || null
      };
      setProfileData(safeData);
      setEditData(safeData);
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Remove /api suffix from base URL for static files
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const validatePassword = async () => {
    const errors = {};
    if (!passwordData.oldPassword) errors.oldPassword = 'Password lama harus diisi';
    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru harus diisi';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak sesuai';
    }
    return errors;
  };

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setCurrentPage('edit');
  };

  const handlePasswordClick = () => {
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setCurrentPage('password');
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setPasswordErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePasswordSubmit = async () => {
    try {
      const errors = await validatePassword();
      if (Object.keys(errors).length > 0) {
        setPasswordErrors(errors);
        return;
      }
      setLoading(true);
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setCurrentPage('view');
      setSuccessMessage('Password berhasil diubah');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      setPasswordErrors({
        general: error.response?.data?.error || 'Gagal mengubah password. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files[0];
    if (file) await uploadPhoto(file);
    setShowPhotoOptions(false);
  };

  const handleCameraCapture = async (file) => {
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.');
      return;
    }
    try {
      setLoading(true);
      const result = await userService.uploadAvatar(file);
      setEditData(prev => ({ ...prev, avatar: result.avatar }));
      setSuccessMessage('Foto profil berhasil diupload');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Gagal mengupload foto profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!editData.firstname || !editData.email) {
        alert('Nama dan email harus diisi');
        return;
      }
      setLoading(true);
      await userService.updateProfile({
        firstname: editData.firstname,
        fullname: editData.fullname,
        phone: editData.phone,
        address: editData.address,
        company: editData.company,
        position: editData.position
      });
      setProfileData({ ...editData });
      setCurrentPage('view');
      setSuccessMessage('Data profil berhasil disimpan');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
              <img className='max-w-40' src="./Tepian-K3-Logo-1.svg" alt="Logo" />
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData.avatar ? (
                    <img src={getImageUrl(profileData.avatar)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">{getInitials(profileData.firstname)}</span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{profileData.firstname}</p>
                  <p className="text-xs text-gray-500">{profileData.company || 'User'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
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
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'view' ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/home')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Profil Saya</h2>
              </div>
              <button
                onClick={handleEditClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Edit Profil</span>
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center border-4 border-blue-100 overflow-hidden">
                {profileData.avatar ? (
                  <img src={getImageUrl(profileData.avatar)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-4xl">{getInitials(profileData.firstname)}</span>
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">{profileData.fullname || 'Belum ada nama'}</h3>
              <p className="text-gray-500">{profileData.company || '-'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Nama Panggilan</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.firstname || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Nama Lengkap</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.fullname || '-'}</p>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Alamat</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.address || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Perusahaan</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.company || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Posisi</label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">{profileData.position || '-'}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-gray-800">*********</p>
                  <button
                    onClick={handlePasswordClick}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Ubah Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'password' ? (
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
              </div>

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
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center border-4 border-blue-100 overflow-hidden">
                  {editData.avatar ? (
                    <img src={getImageUrl(editData.avatar)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-4xl">{getInitials(editData.firstname)}</span>
                  )}
                </div>
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
                        onClick={() => {
                          setShowPhotoOptions(false);
                          setShowCamera(true);
                        }}
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
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <CameraCapture
                isOpen={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={handleCameraCapture}
              />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Panggilan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama panggilan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. HP</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nomor HP"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Perusahaan</label>
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posisi</label>
                  <input
                    type="text"
                    value={editData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan posisi jabatan"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setCurrentPage('view')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;