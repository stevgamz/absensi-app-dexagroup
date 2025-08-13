import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogIn,
  LogOut,
  MessageSquare,
  Upload,
  Image,
  X
} from 'lucide-react';
import { attendanceAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  
  // Photo upload states
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceAPI.getTodayStatus();
      if (response.success) {
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  // Fetch attendance history
  const fetchHistory = async () => {
    try {
      const response = await attendanceAPI.getHistory(7);
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchHistory();
  }, []);

  // Handle file upload
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'checkin') {
          setCheckInPhoto(e.target.result);
        } else {
          setCheckOutPhoto(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded photo
  const removePhoto = (type) => {
    if (type === 'checkin') {
      setCheckInPhoto(null);
    } else {
      setCheckOutPhoto(null);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await attendanceAPI.checkIn(notes, checkInPhoto || '', '');
      if (response.success) {
        alert('✅ Check in berhasil!');
        setNotes('');
        setCheckInPhoto(null);
        await fetchTodayStatus();
        await fetchHistory();
      }
    } catch (error) {
      console.error('Check in error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Check in gagal'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await attendanceAPI.checkOut(notes, checkOutPhoto || '', '');
      if (response.success) {
        alert('✅ Check out berhasil!');
        setNotes('');
        setCheckOutPhoto(null);
        await fetchTodayStatus();
        await fetchHistory();
      }
    } catch (error) {
      console.error('Check out error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Check out gagal'));
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Hadir</span>;
      case 'terlambat':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Terlambat</span>;
      case 'alpha':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Alpha</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const attendance = todayStatus?.attendance;
  const canCheckIn = todayStatus?.can_check_in;
  const canCheckOut = todayStatus?.can_check_out;

  return (
    <div className="space-y-6">
      {/* Current Time & Date */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Waktu Sekarang</h3>
            <p className="text-3xl font-bold">{formatTime(currentTime)}</p>
            <p className="text-primary-100 mt-1">{formatDate(currentTime)}</p>
          </div>
          <Clock className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Absensi Hari Ini</h3>
        
        {attendance ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Check In</p>
                  <p className="text-sm text-gray-600">{formatTime(attendance.check_in)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(attendance.status)}
                {attendance.check_in_photo && (
                  <a 
                    href={`http://localhost:3001${attendance.check_in_photo}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Image className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            
            {attendance.check_out ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Check Out</p>
                    <p className="text-sm text-gray-600">{formatTime(attendance.check_out)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Selesai
                  </span>
                  {attendance.check_out_photo && (
                    <a 
                      href={`http://localhost:3001${attendance.check_out_photo}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Image className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">Check Out</p>
                    <p className="text-sm text-gray-600">Belum check out</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada absensi hari ini</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Absensi</h3>
        
        {/* Notes Input */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="Tambahkan catatan..."
            />
          </div>
        </div>

        {/* Photo Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Check In Photo */}
          {canCheckIn && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Check In</h4>
              {checkInPhoto ? (
                <div className="relative">
                  <img
                    src={checkInPhoto}
                    alt="Check In"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto('checkin')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center h-32 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload Foto</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'checkin')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Check Out Photo */}
          {canCheckOut && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Check Out</h4>
              {checkOutPhoto ? (
                <div className="relative">
                  <img
                    src={checkOutPhoto}
                    alt="Check Out"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto('checkout')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center h-32 border border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload Foto</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'checkout')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn || actionLoading}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {actionLoading ? 'Processing...' : 'Check In'}
          </button>
          
          <button
            onClick={handleCheckOut}
            disabled={!canCheckOut || actionLoading}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {actionLoading ? 'Processing...' : 'Check Out'}
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Absensi (7 Hari Terakhir)</h3>
        
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(item.date)}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {item.check_in && (
                        <span>In: {formatTime(item.check_in)}</span>
                      )}
                      {item.check_out && (
                        <span>Out: {formatTime(item.check_out)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2">
                  {getStatusBadge(item.status)}
                  {(item.check_in_photo || item.check_out_photo) && (
                    <div className="flex space-x-1">
                      {item.check_in_photo && (
                        <a 
                          href={`http://localhost:3001${item.check_in_photo}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                          title="Foto Check In"
                        >
                          <Image className="h-4 w-4" />
                        </a>
                      )}
                      {item.check_out_photo && (
                        <a 
                          href={`http://localhost:3001${item.check_out_photo}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Foto Check Out"
                        >
                          <Image className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada riwayat absensi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
