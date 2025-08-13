import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar';

const Layout = ({ user, onLogout }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Absensi';
      case '/employees':
        return 'Daftar Karyawan';
      default:
        return 'Absensi App';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="mt-2 text-gray-600">
            Selamat datang, <span className="font-medium">{user?.name}</span>
          </p>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
