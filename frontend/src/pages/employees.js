import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  UserCheck,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Shield,
  Image
} from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employee',
    position: '',
    department: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchTodayAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Gagal mengambil data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      if (response.success) {
        setTodayAttendance(response.data);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'employee',
      position: '',
      department: '',
      email: '',
      phone: ''
    });
  };

  const openModal = (type, employee = null) => {
    setModalType(type);
    setSelectedEmployee(employee);
    
    if (type === 'create') {
      resetForm();
    } else if (employee) {
      setFormData({
        name: employee.name || '',
        username: employee.username || '',
        password: '', // Always empty for security
        role: employee.role || 'employee',
        position: employee.position || '',
        department: employee.department || '',
        email: employee.email || '',
        phone: employee.phone || ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      let response;
      
      if (modalType === 'create') {
        response = await employeeAPI.create(formData);
        alert('✅ Karyawan berhasil ditambahkan!');
      } else if (modalType === 'edit') {
        response = await employeeAPI.update(selectedEmployee.id, formData);
        alert('✅ Data karyawan berhasil diperbarui!');
      }

      if (response.success) {
        await fetchEmployees();
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus karyawan "${employee.name}"?`)) {
      return;
    }

    try {
      const response = await employeeAPI.delete(employee.id);
      if (response.success) {
        alert('✅ Karyawan berhasil dihapus!');
        await fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('❌ ' + (error.response?.data?.message || 'Gagal menghapus karyawan'));
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeAttendance = (employeeId) => {
    return todayAttendance.find(att => att.employee_id === employeeId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Hadir
          </span>
        );
      case 'terlambat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Terlambat
          </span>
        );
      case 'alpha':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Alpha
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Belum Absen
          </span>
        );
    }
  };

  const formatTime = (datetime) => {
    if (!datetime) return '-';
    return new Date(datetime).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-gray-600">Total Karyawan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {todayAttendance.filter(att => att.check_in).length}
              </p>
              <p className="text-gray-600">Hadir Hari Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {todayAttendance.filter(att => att.status === 'terlambat').length}
              </p>
              <p className="text-gray-600">Terlambat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari karyawan berdasarkan nama, posisi, departemen, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Karyawan ({filteredEmployees.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Status absensi untuk hari ini: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => {
              const attendance = getEmployeeAttendance(employee.employee_id);
              
              return (
                <div key={employee.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-lg">
                            {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
                            {employee.role === 'admin' && (
                              <Shield className="h-4 w-4 text-blue-600" title="Admin" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {employee.position}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          {employee.department}
                        </div>
                        {employee.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {employee.email}
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendance Status & Actions */}
                    <div className="ml-6 text-right space-y-2">
                      {getStatusBadge(attendance?.status)}
                      
                      {/* Attendance Photos */}
                      {attendance && (attendance.check_in_photo || attendance.check_out_photo) && (
                        <div className="flex justify-end space-x-1 mt-2">
                          {attendance.check_in_photo && (
                            <a 
                              href={`http://localhost:3001${attendance.check_in_photo}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Foto Check In"
                            >
                              <Image className="h-3 w-3 mr-1" />
                              In
                            </a>
                          )}
                          {attendance.check_out_photo && (
                            <a 
                              href={`http://localhost:3001${attendance.check_out_photo}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="Foto Check Out"
                            >
                              <Image className="h-3 w-3 mr-1" />
                              Out
                            </a>
                          )}
                        </div>
                      )}
                      
                      {attendance && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {attendance.check_in && (
                            <div className="flex items-center justify-end">
                              <span className="mr-1">In:</span>
                              <span className="font-medium">{formatTime(attendance.check_in)}</span>
                            </div>
                          )}
                          {attendance.check_out && (
                            <div className="flex items-center justify-end">
                              <span className="mr-1">Out:</span>
                              <span className="font-medium">{formatTime(attendance.check_out)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-1 mt-3">
                        <button
                          onClick={() => openModal('view', employee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', employee)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {employee.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(employee)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {attendance?.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Catatan:</span> {attendance.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Tidak ada karyawan yang ditemukan' : 'Tidak ada data karyawan'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-1">
                  Coba ubah kata kunci pencarian
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit/View Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' && 'Tambah Karyawan Baru'}
                  {modalType === 'edit' && 'Edit Karyawan'}
                  {modalType === 'view' && 'Detail Karyawan'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Password */}
                {modalType !== 'view' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {modalType === 'create' ? '*' : '(Kosongkan jika tidak diubah)'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalType === 'create'}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posisi *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departemen *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={modalType === 'view'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Employee ID (View only) */}
                {modalType === 'view' && selectedEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={selectedEmployee.employee_id}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {modalType !== 'view' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {modalType === 'create' ? 'Simpan' : 'Update'}
                    </button>
                  </div>
                )}

                {modalType === 'view' && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;