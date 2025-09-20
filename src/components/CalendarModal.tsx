import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'task' | 'meeting';
  status?: string;
  project?: string;
  description?: string;
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const { projects } = useProjects();
  const { userProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateCalendarEvents();
    }
  }, [isOpen, projects]);

  const generateCalendarEvents = () => {
    setLoading(true);
    
    const calendarEvents: CalendarEvent[] = [];
    
    // Generate events from projects
    projects.forEach(project => {
      // Add deadline events
      calendarEvents.push({
        id: `deadline-${project.id}`,
        title: `${project.title} - Deadline`,
        date: project.deadline,
        type: 'deadline',
        status: project.status,
        project: project.title,
        description: `Project deadline for ${project.title}`
      });

      // Add milestone events (simulated based on progress)
      if (project.progress > 0 && project.progress < 100) {
        const milestoneDate = new Date();
        milestoneDate.setDate(milestoneDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        calendarEvents.push({
          id: `milestone-${project.id}`,
          title: `${project.title} - Progress Review`,
          date: milestoneDate,
          type: 'meeting',
          project: project.title,
          description: `Progress review meeting for ${project.title}`
        });
      }
    });

    // Add some sample recurring meetings
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const meetingDate = new Date(today);
      meetingDate.setDate(today.getDate() + i);
      
      // Weekly team meetings (every Monday)
      if (meetingDate.getDay() === 1) {
        calendarEvents.push({
          id: `team-meeting-${i}`,
          title: 'Weekly Team Standup',
          date: meetingDate,
          type: 'meeting',
          description: 'Weekly team synchronization meeting'
        });
      }
    }

    setEvents(calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime()));
    setLoading(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'task': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-blue-100 border-blue-400' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded border ${getEventTypeColor(event.type)} truncate`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .slice(0, 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading calendar events...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar Grid */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Days Header */}
                  <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                    {renderCalendarGrid()}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selected Date Events */}
                {selectedDate && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {getEventIcon(event.type)}
                            <span className="font-medium text-sm">{event.title}</span>
                          </div>
                          {event.project && (
                            <p className="text-xs opacity-75">Project: {event.project}</p>
                          )}
                          {event.description && (
                            <p className="text-xs opacity-75 mt-1">{event.description}</p>
                          )}
                        </div>
                      ))}
                      {getEventsForDate(selectedDate).length === 0 && (
                        <p className="text-gray-500 text-sm">No events scheduled for this date</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {getEventIcon(event.type)}
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <p className="text-xs opacity-75">
                          {event.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {event.project && (
                          <p className="text-xs opacity-75">Project: {event.project}</p>
                        )}
                      </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <p className="text-gray-500 text-sm">No upcoming events</p>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-sm text-gray-700">Deadlines</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                      <span className="text-sm text-gray-700">Tasks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                      <span className="text-sm text-gray-700">Meetings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}