export interface User {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  role: 'employee' | 'admin';
  photo_url?: string;
  is_enrolled: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  location?: string;
  verification_confidence?: number;
  created_at: string;
  user?: User;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  attendance_percentage: number;
}