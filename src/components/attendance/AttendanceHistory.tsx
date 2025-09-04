import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Download, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { useAuthContext } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import type { AttendanceRecord } from '../../types';

const AttendanceHistory: React.FC = () => {
  const { user } = useAuthContext();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadAttendanceHistory();
  }, [user]);

  const loadAttendanceHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceHistory(user.id);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'late':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'absent':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const exportToCsv = () => {
    const headers = ['Date', 'Check-in', 'Check-out', 'Status', 'Location'];
    const csvData = records.map(record => [
      record.date,
      format(new Date(record.check_in_time), 'HH:mm:ss'),
      record.check_out_time ? format(new Date(record.check_out_time), 'HH:mm:ss') : 'Not checked out',
      record.status,
      record.location || 'Unknown'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${user?.employee_id}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter(record => {
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesStatus = !filterStatus || record.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h2>
          <p className="text-gray-600">View and manage your attendance records</p>
        </div>

        <button
          onClick={exportToCsv}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Filter by date"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {(filterDate || filterStatus) && (
            <button
              onClick={() => {
                setFilterDate('');
                setFilterStatus('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-600">Start marking your attendance to see records here.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {format(new Date(record.date), 'EEEE, MMMM do, yyyy')}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>In: {format(new Date(record.check_in_time), 'HH:mm:ss')}</span>
                      {record.check_out_time && (
                        <span>Out: {format(new Date(record.check_out_time), 'HH:mm:ss')}</span>
                      )}
                    </div>
                    {record.location && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{record.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                  {record.verification_confidence && (
                    <div className="text-xs text-gray-500 mt-1">
                      {record.verification_confidence}% confidence
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;