import React from 'react';
import { Camera, Calendar, BarChart3, Users } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuthContext();

  const navItems = [
    { id: 'mark-attendance', label: 'Mark Attendance', icon: Camera },
    { id: 'history', label: 'My History', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Users }] : []),
  ];

  return (
    <nav className="bg-white shadow-sm border-t border-gray-200 md:border-t-0 md:border-r md:w-64">
      <div className="px-4 py-4">
        <div className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                currentView === id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;