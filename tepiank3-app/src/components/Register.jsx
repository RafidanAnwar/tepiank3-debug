//saya memiliki project (react+vite, tailwind+vite)
//bantu saya membuat fungsi handlesubmit dari file Register.jsx:
//fungsi simpan data register ke file /src/dataDummy/tb_User.js
//isi tb_User.js : const tbUser = []



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import tb_User from '../dataDummy/tb_User';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ id:0, firstname: '', fullname: '', email: '', password: '',role:"User", createdAt:"" });

  // const handleSubmitOld = (e) => {
  //   e.preventDefault();
  //   console.log('Register:', formData);
  //   navigate('/login');
  // };


  
  //---------------------------------
  
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', formData);

    // Ambil user dari localStorage atau dari tb_User default
    const tbUserData = JSON.parse(localStorage.getItem('tb_User')) || tb_User;

    // Cek apakah email sudah digunakan
    const existingUser = tbUserData.find(user => user.email === formData.email);
    if (existingUser) {
      alert('Email sudah terdaftar. Silakan gunakan email lain.');
      return;
    }

    // Buat user baru
    const newUser = {
      id: tbUserData.length + 1,
      firstname: formData.firstname,
      fullname: formData.fullname,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      createdAt: new Date().toISOString(),
    };

    // Simpan ke localStorage
    const updatedUsers = [...tbUserData, newUser];
    localStorage.setItem('tb_User', JSON.stringify(updatedUsers));

    alert('Registrasi berhasil! Silakan login.');
    navigate('/login');
  };



//--------------------------------






  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-400 via-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-bold text-2xl">T</span>
            </div>
            <h1 className="text-3xl font-bold text-white">TEPIAN<span className="text-cyan-200">K3</span></h1>
          </div>
          <p className="text-white/90 text-sm">Sistem Layanan Digital Terpadu</p>
        </div> */}

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
            <img className='max-w-60 m-auto' src="./Tepian-K3-Logo-1.svg" alt="" />
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-10">Buat Akun Baru</h2>
            <p className="text-gray-600 text-sm">Daftar untuk mengakses layanan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panggilan</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.firstname}
                  onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input type="checkbox" required className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label className="ml-2 text-sm text-gray-600">
                Saya setuju dengan <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Syarat & Ketentuan</a> dan <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Kebijakan Privasi</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Daftar
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
              Masuk
            </button>
          </p>
        </div>

        {/* Footer */}
        {/* <p className="text-center text-white/80 text-xs mt-6">
          © 2024 TEPIAN K3 - Digital Ecosystem Development
        </p> */}
      </div>
    </div>
  );
}

export default Register;