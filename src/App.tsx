import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import AttendanceCamera from './components/attendance/AttendanceCamera';
import AttendanceHistory from './components/attendance/AttendanceHistory';
import AttendanceStats from './components/attendance/AttendanceStats';
import AdminPanel from './components/admin/AdminPanel';
import AuthForm from './components/auth/AuthForm';

const AppContent: React.FC = () => {
  const { user, loading } = useAuthContext();
  const [currentView, setCurrentView] = useState('mark-attendance');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'mark-attendance':
        return <AttendanceCamera />;
      case 'history':
        return <AttendanceHistory />;
      case 'stats':
        return <AttendanceStats />;
      case 'admin':
        return user.role === 'admin' ? <AdminPanel /> : <AttendanceCamera />;
      default:
        return <AttendanceCamera />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col md:flex-row">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;