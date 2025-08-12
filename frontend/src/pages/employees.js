import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  UserCheck,
  Clock,
  Calendar
} from 'lucide-react'
import { employeeAPI, attendanceAPI } from '../services/api'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [todayAttendance, setTodayAttendance] = useState([])

  useEffect(() => {
    fetchEmployees()
    fetchTodayAttendance()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll()
      if (response.success) {
        setEmployees(response.data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance()
      if (response.success) {
        setTodayAttendance(response.data)
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEmployeeAttendance = (employeeId) => {
    return todayAttendance.find(att => att.employee_id === employeeId)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Hadir
          </span>
        )
      case 'terlambat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Terlambat
          </span>
        )
      case 'alpha':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Alpha
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Belum Absen
          </span>
        )
    }
  }

  const formatTime = (datetime) => {
    if (!datetime) return '-'
    return new Date(datetime).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari karyawan berdasarkan nama, posisi, departemen, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
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
              const attendance = getEmployeeAttendance(employee.employee_id)
              
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
                          <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
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

                    {/* Attendance Status */}
                    <div className="ml-6 text-right space-y-2">
                      {getStatusBadge(attendance?.status)}
                      
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
              )
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
    </div>
  )
}

export default Employees