/*
  # Attendance Management System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier linked to Supabase auth
      - `email` (text, unique) - User email address
      - `full_name` (text) - Full name of the user
      - `employee_id` (text, unique) - Employee identification number
      - `department` (text) - Department name
      - `role` (text) - User role (employee or admin)
      - `photo_url` (text, optional) - URL to user's photo for facial recognition
      - `is_enrolled` (boolean) - Whether facial recognition is set up
      - `created_at` (timestamp) - Account creation time

    - `attendance_records`
      - `id` (uuid, primary key) - Record identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `check_in_time` (timestamp) - When user checked in
      - `check_out_time` (timestamp, optional) - When user checked out
      - `date` (date) - Date of attendance
      - `status` (text) - Attendance status (present, late, absent)
      - `location` (text, optional) - GPS location of attendance marking
      - `verification_confidence` (numeric, optional) - Facial recognition confidence score
      - `created_at` (timestamp) - Record creation time

  2. Security
    - Enable RLS on all tables
    - Users can read/update their own profile
    - Users can read/insert their own attendance records
    - Admins can read all data
    - Public cannot access any data without authentication

  3. Features
    - Automatic timestamp defaults
    - Unique constraints for data integrity
    - Foreign key relationships for data consistency
    - Indexes for performance on frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  employee_id text UNIQUE NOT NULL,
  department text NOT NULL,
  role text DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  photo_url text,
  is_enrolled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  check_in_time timestamptz NOT NULL,
  check_out_time timestamptz,
  date date NOT NULL,
  status text DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
  location text,
  verification_confidence numeric CHECK (verification_confidence >= 0 AND verification_confidence <= 100),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Attendance records policies
CREATE POLICY "Users can read own attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own attendance"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attendance"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Create unique constraint to prevent multiple attendance records per day per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_date ON attendance_records(user_id, date);