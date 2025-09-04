import { supabase } from '../lib/supabase';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { AttendanceRecord, AttendanceStats } from '../types';

export const attendanceService = {
  async markAttendance(userId: string, location?: string): Promise<AttendanceRecord> {
    const now = new Date();
    const date = format(now, 'yyyy-MM-dd');
    const time = now.toISOString();

    // Check if already marked today
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing && existing.check_out_time) {
      throw new Error('Attendance already completed for today');
    }

    if (existing && !existing.check_out_time) {
      // Mark check-out
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: time,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as AttendanceRecord;
    }

    // Mark check-in
    const currentHour = now.getHours();
    const status = currentHour >= 9 ? 'late' : 'present';

    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        user_id: userId,
        check_in_time: time,
        date,
        status,
        location,
        verification_confidence: Math.random() * 20 + 80, // Simulate confidence
      })
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRecord;
  },

  async getAttendanceHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
    }

    if (endDate) {
      query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data as AttendanceRecord[];
  },

  async getAllAttendance(
    startDate?: Date,
    endDate?: Date,
    department?: string
  ): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        user:users(*)
      `)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
    }

    if (endDate) {
      query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
    }

    const { data, error } = await query;
    if (error) throw error;

    let records = data as AttendanceRecord[];

    if (department) {
      records = records.filter(record => 
        record.user?.department === department
      );
    }

    return records;
  },

  async getAttendanceStats(userId: string, month: Date): Promise<AttendanceStats> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('user_id', userId)
      .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
      .lte('date', format(endOfMonth, 'yyyy-MM-dd'));

    if (error) throw error;

    const records = data as AttendanceRecord[];
    const totalDays = endOfMonth.getDate();
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const absentDays = totalDays - presentDays - lateDays;
    const attendancePercentage = ((presentDays + lateDays) / totalDays) * 100;

    return {
      total_days: totalDays,
      present_days: presentDays,
      late_days: lateDays,
      absent_days: absentDays,
      attendance_percentage: Math.round(attendancePercentage),
    };
  },

  async getTodayAttendance(userId: string): Promise<AttendanceRecord | null> {
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as AttendanceRecord | null;
  },
};