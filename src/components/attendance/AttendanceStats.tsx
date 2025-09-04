import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Clock, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { useAuthContext } from '../../contexts/AuthContext';
import { format, addMonths, subMonths } from 'date-fns';
import type { AttendanceStats as StatsType } from '../../types';

const AttendanceStats: React.FC = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user, currentMonth]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceStats(user.id, currentMonth);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getAttendanceGrade = (percentage: number) => {
    if (percentage >= 95) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 85) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 75) return { grade: 'C+', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (percentage >= 70) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Failed to load statistics</div>
      </div>
    );
  }

  const grade = getAttendanceGrade(stats.attendance_percentage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Attendance Statistics</h2>
          <p className="text-gray-600">Track your attendance performance</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-4 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-gray-900 min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overall Performance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{stats.attendance_percentage}%</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${grade.bg} ${grade.color}`}>
                Grade {grade.grade}
              </div>
            </div>
          </div>
          <TrendingUp className="w-12 h-12 text-blue-200" />
        </div>
        
        <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span>Attendance Rate</span>
            <span>{stats.present_days + stats.late_days} / {stats.total_days} days</span>
          </div>
          <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${stats.attendance_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{stats.present_days}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Days</p>
              <p className="text-2xl font-bold text-amber-600">{stats.late_days}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Days</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent_days}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_days}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-900">Present</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-green-700">
                {stats.present_days} days ({Math.round((stats.present_days / stats.total_days) * 100)}%)
              </div>
              <div className="w-24 bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.present_days / stats.total_days) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-900">Late</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-amber-700">
                {stats.late_days} days ({Math.round((stats.late_days / stats.total_days) * 100)}%)
              </div>
              <div className="w-24 bg-amber-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.late_days / stats.total_days) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-900">Absent</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-red-700">
                {stats.absent_days} days ({Math.round((stats.absent_days / stats.total_days) * 100)}%)
              </div>
              <div className="w-24 bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.absent_days / stats.total_days) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;