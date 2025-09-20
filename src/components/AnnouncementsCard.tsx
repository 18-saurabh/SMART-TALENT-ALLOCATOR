import React from 'react';
import { Bell, Calendar, User, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  author: string;
  date: Date;
  isRead: boolean;
}

export default function AnnouncementsCard() {
  // Mock announcements data - in real app, this would come from API
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'New Project Management Guidelines',
      message: 'Please review the updated project submission guidelines before your next deadline.',
      type: 'info',
      author: 'HR Team',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isRead: false
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      message: 'The platform will be under maintenance this weekend from 2 AM to 6 AM.',
      type: 'warning',
      author: 'IT Department',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isRead: true
    },
    {
      id: '3',
      title: 'Team Performance Recognition',
      message: 'Congratulations to all team members for achieving 95% on-time delivery this quarter!',
      type: 'success',
      author: 'Management',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isRead: true
    },
    {
      id: '4',
      title: 'Urgent: Project Deadline Changes',
      message: 'Several project deadlines have been moved up. Please check your dashboard for updates.',
      type: 'urgent',
      author: 'Project Manager',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: false
    }
  ];

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'urgent': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'urgent': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Mark all as read
        </button>
      </div>
      
      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No announcements</p>
          <p className="text-sm text-gray-400 mt-1">Company updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                getAnnouncementColor(announcement.type)
              } ${!announcement.isRead ? 'border-l-4' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getAnnouncementIcon(announcement.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-medium text-gray-900 ${!announcement.isRead ? 'font-semibold' : ''}`}>
                      {announcement.title}
                    </h3>
                    {!announcement.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {announcement.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{announcement.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{announcement.date.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}