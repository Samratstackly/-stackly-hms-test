import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Stethoscope,
  Building,
  Phone,
  DoorClosed,
  UserCircle,
} from 'lucide-react';
import api from "../../utils/axiosConfig"; // Cookie-based axios instance

const DoctorCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarItems, setCalendarItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const timeSlotsRef = useRef(null);

    // Fetch calendar items for logged-in doctor/nurse
    useEffect(() => {
        fetchCalendarItems();
    }, [currentDate]);

    const fetchCalendarItems = async () => {
        try {
            setLoading(true);
            
            // Use the my-calendar endpoint (no staff_id needed)
            const response = await api.get(`/appointments/my-calendar/`, {
                params: {
                    year: currentDate.getFullYear(),
                    month: currentDate.getMonth() + 1
                }
            });
            
            console.log("Calendar items received:", response.data);
            
            // Process calendar items to ensure we have proper date/time objects
            const processedItems = response.data.map(item => {
                // If appointment_datetime is provided, use it
                if (item.appointment_datetime) {
                    return {
                        ...item,
                        appointment_datetime: new Date(item.appointment_datetime)
                    };
                }
                
                // Otherwise, create datetime from appointment_date and appointment_time
                if (item.appointment_date && item.appointment_time) {
                    // Parse date
                    const [year, month, day] = item.appointment_date.split('-').map(Number);
                    
                    // Parse time (handle both string and object formats)
                    let hours = 0, minutes = 0;
                    if (typeof item.appointment_time === 'string') {
                        const [h, m] = item.appointment_time.split(':').map(Number);
                        hours = h || 0;
                        minutes = m || 0;
                    } else if (item.appointment_time && typeof item.appointment_time === 'object') {
                        hours = item.appointment_time.hours || 0;
                        minutes = item.appointment_time.minutes || 0;
                    }
                    
                    const datetime = new Date(year, month - 1, day, hours, minutes);
                    return {
                        ...item,
                        appointment_datetime: datetime
                    };
                }
                
                return item;
            });
            
            console.log("Processed calendar items:", processedItems);
            setCalendarItems(processedItems);
        } catch (error) {
            console.error('Error fetching calendar items:', error);
            setCalendarItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Navigation functions
    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    // Get current week days
    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        
        // Find Sunday of current week
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        const sunday = new Date(startOfWeek.setDate(diff));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + i);
            days.push(date);
        }
        
        return days;
    };

    // Get hours of day
    const getHours = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return hours;
    };

    // Get calendar items for specific date and hour
    const getCalendarItemsForDateTime = (date, hourStr) => {
        const hour = parseInt(hourStr.split(':')[0]);
        
        return calendarItems.filter(item => {
            if (!item.appointment_datetime || !(item.appointment_datetime instanceof Date)) {
                return false;
            }
            
            const itemDate = item.appointment_datetime;
            
            // Check if item matches the specified date and hour
            const matchesDate = 
                itemDate.getDate() === date.getDate() &&
                itemDate.getMonth() === date.getMonth() &&
                itemDate.getFullYear() === date.getFullYear();
                
            const matchesHour = itemDate.getHours() === hour;
            
            return matchesDate && matchesHour;
        });
    };

    // Get calendar items for selected date
    const getCalendarItemsForSelectedDate = () => {
        return calendarItems.filter(item => {
            if (!item.appointment_datetime || !(item.appointment_datetime instanceof Date)) {
                return false;
            }
            
            const itemDate = item.appointment_datetime;
            
            return itemDate.getDate() === selectedDate.getDate() &&
                   itemDate.getMonth() === selectedDate.getMonth() &&
                   itemDate.getFullYear() === selectedDate.getFullYear();
        });
    };

    // Format time
    const formatTime = (dateTime) => {
        if (!dateTime || !(dateTime instanceof Date)) return '';
        
        return dateTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'new': 'bg-purple-900 text-purple-300',
            'normal': 'bg-blue-900 text-blue-300',
            'severe': 'bg-red-900 text-red-300',
            'completed': 'bg-green-900 text-green-300',
            'cancelled': 'bg-gray-700 text-gray-300',
            'active': 'bg-green-900 text-green-300',
            'inactive': 'bg-gray-700 text-gray-300',
            'emergency': 'bg-red-900 text-red-300',
            'pending': 'bg-yellow-900 text-yellow-300'
        };
        return colors[status] || 'bg-gray-700 text-gray-300';
    };

    // Get item type color
    const getItemTypeColor = (item) => {
        if (item.item_type === 'surgery') {
            return 'border-l-orange-500 bg-orange-500/10';
        }
        
        const colors = {
            'checkup': 'border-l-purple-500 bg-purple-500/10',
            'followup': 'border-l-blue-500 bg-blue-500/10',
            'emergency': 'border-l-red-500 bg-red-500/10',
            'surgery': 'border-l-orange-500 bg-orange-500/10'
        };
        return colors[item.appointment_type] || 'border-l-gray-500 bg-gray-500/10';
    };

    const weekDays = getWeekDays();
    const hours = getHours();

    // Separate appointments and surgeries for the selected date
    const selectedDateItems = getCalendarItemsForSelectedDate();
    const selectedDateAppointments = selectedDateItems.filter(item => item.item_type === 'appointment');
    const selectedDateSurgeries = selectedDateItems.filter(item => item.item_type === 'surgery');

    return (
        <div className=" mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
            {/* Gradient Background */}
            <div
                className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
                style={{
                    background: "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
                    zIndex: 0,
                }}
            ></div>
            
            {/* Gradient Border */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "10px",
                    padding: "2px",
                    background:
                        "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            ></div>

            {/* Header - Original Style */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h2 className="text-black dark:text-white font-[Helvetica] text-xl font-semibold">
                        My Schedule Calendar
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <UserCircle size={16} />
                        <span>Viewing your personal schedule - Appointments & Surgeries</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevWeek}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] hover:bg-[#0EFF7B1A]"
                        >
                            <ChevronLeft size={16} className="text-[#08994A] dark:text-white" />
                        </button>
                        
                        <div className="min-w-[180px] text-center">
                            <span className="text-black dark:text-white font-medium">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        
                        <button
                            onClick={nextWeek}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B33] hover:bg-[#0EFF7B1A]"
                        >
                            <ChevronRight size={16} className="text-[#08994A] dark:text-white" />
                        </button>
                        
                        <button
                            onClick={() => {
                                const today = new Date();
                                setCurrentDate(today);
                                setSelectedDate(today);
                            }}
                            className="ml-2 px-3 py-1.5 rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white text-sm font-medium hover:opacity-90"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Calendar on Right */}
            <div className="flex gap-6 relative z-10">
                {/* Left Side - Hourly View with header inside scrollable area */}
                <div className="flex-1 bg-gray-100 dark:bg-[#1E1E1E] rounded-lg border border-gray-300 dark:border-[#3A3A3A] overflow-hidden">
                    {/* Time Slots Container - Everything scrolls together */}
                    <div className="overflow-y-auto max-h-[550px]">
                        {/* Week Days Header - Inside scrollable area */}
                        <div className="grid grid-cols-8 border-b border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] sticky top-0 z-10">
                            <div className="p-3 border-r border-gray-300 dark:border-[#3A3A3A] w-[80px] flex-shrink-0">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                            </div>
                            
                            {weekDays.map((date, index) => (
                                <div 
                                    key={index} 
                                    className={`p-3 text-center border-r border-gray-300 dark:border-[#3A3A3A] cursor-pointer flex-1 min-w-0 ${
                                        date.toDateString() === selectedDate.toDateString() 
                                            ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B0A]' 
                                            : ''
                                    }`}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <div className={`text-sm ${date.toDateString() === new Date().toDateString() ? 'text-[#08994A] dark:text-[#0EFF7B] font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className={`text-lg font-medium ${
                                        date.toDateString() === new Date().toDateString() 
                                            ? 'text-[#08994A] dark:text-[#0EFF7B]'
                                            : 'text-black dark:text-white'
                                    }`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Time Slots Grid */}
                        {hours.map((hour, hourIndex) => (
                            <div key={hourIndex} className="grid grid-cols-8 border-b border-gray-300 dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] min-h-[60px]">
                                {/* Time label - fixed width matching header */}
                                <div className="p-3 border-r border-gray-300 dark:border-[#3A3A3A] text-sm text-gray-600 dark:text-gray-400 w-[80px] flex-shrink-0">
                                    {hour}
                                </div>
                                
                                {/* Day columns - equal width matching header */}
                                {weekDays.map((date, dayIndex) => {
                                    const hourItems = getCalendarItemsForDateTime(date, hour);
                                    const hasMultipleItems = hourItems.length > 1;
                                    
                                    return (
                                        <div 
                                            key={dayIndex} 
                                            className={`border-r border-gray-300 dark:border-[#3A3A3A] p-1 flex-1 min-w-0 ${
                                                date.toDateString() === selectedDate.toDateString() 
                                                    ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B0A]' 
                                                    : ''
                                            }`}
                                            onClick={() => setSelectedDate(date)}
                                        >
                                            {/* Fixed height container with scroll only when needed */}
                                            <div className={`h-full ${hasMultipleItems ? 'overflow-y-auto' : ''}`}>
                                                {hourItems.map((item, itemIndex) => (
                                                    <div 
                                                        key={itemIndex}
                                                        className={`mb-1 p-1 rounded text-xs cursor-pointer ${getItemTypeColor(item)}`}
                                                    >
                                                        <div className="font-medium truncate text-black dark:text-white flex items-center gap-1">
                                                            {item.item_type === 'surgery' && (
                                                                <Stethoscope size={10} />
                                                            )}
                                                            {item.patient_name}
                                                        </div>
                                                        <div className="text-gray-600 dark:text-gray-400 truncate">
                                                            {formatTime(item.appointment_datetime)}
                                                            {item.item_type === 'surgery' && ` • ${item.surgery_name}`}
                                                        </div>
                                                        <div className="mt-0.5">
                                                            <span className={`px-1 py-0.5 rounded text-[10px] ${getStatusColor(item.status)}`}>
                                                                {item.status} {item.item_type === 'surgery' ? '(Surgery)' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Calendar Grid (Like in Screenshot) */}
                <div className="w-80 mt-8">
                    {/* Today row */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                            {[15, 16, 17, 18, 19].map((day, index) => {
                                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                                const isToday = day === 17;
                                return (
                                    <div key={index} className={`text-sm ${isToday ? 'font-semibold text-[#08994A] dark:text-[#0EFF7B]' : 'text-black dark:text-white'}`}>
                                        {day} {days[index]}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date grids */}
                    <div className="space-y-2">
                        {/* First row */}
                        <div className="grid grid-cols-7 gap-1">
                            {[14, 15, 16, 17, 18, 19, 20].map((day, index) => (
                                <div 
                                    key={index}
                                    className={`h-10 flex items-center justify-center rounded text-sm ${
                                        day === 17 
                                            ? 'bg-[#025126] text-white font-semibold'
                                            : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Second row */}
                        <div className="grid grid-cols-7 gap-1">
                            {[21, 22, 23, 24, 25, 26, 27].map((day, index) => (
                                <div 
                                    key={index}
                                    className="h-10 flex items-center justify-center rounded text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Third row */}
                        <div className="grid grid-cols-7 gap-1">
                            {[28, 29, 30, 31, 1, 2, 3].map((day, index) => (
                                <div 
                                    key={index}
                                    className={`h-10 flex items-center justify-center rounded text-sm ${
                                        day <= 31 
                                            ? 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                            : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Fourth row */}
                        <div className="grid grid-cols-7 gap-1">
                            {[4, 5, 6, 7, 8, 9, 10].map((day, index) => (
                                <div 
                                    key={index}
                                    className="h-10 flex items-center justify-center rounded text-sm text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Selected Date Details */}
            <div className="mt-6 relative z-10">
                {/* Appointments Section */}
                <div className="rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-4 text-black dark:text-white flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
                        Your Appointments for {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </h3>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">Loading appointments...</p>
                        </div>
                    ) : selectedDateAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No appointments scheduled for this day</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateAppointments.map((appointment, index) => (
                                <div 
                                    key={index} 
                                    className="p-4 rounded-lg border border-gray-200 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#0D0D0D] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <User size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                                                <h4 className="font-medium text-black dark:text-white">
                                                    {appointment.patient_name}
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                                                ID: {appointment.patient_id}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-[#2A2A2A] rounded text-xs text-black dark:text-white">
                                                {formatTime(appointment.appointment_datetime)}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Stethoscope size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Type:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{appointment.appointment_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Department:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{appointment.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DoorClosed size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Room:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{appointment.room_no}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Phone:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{appointment.phone_no}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-gray-200 dark:border-[#3A3A3A] text-xs text-gray-500">
                                        Created: {appointment.created_at ? new Date(appointment.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Surgeries Section - Same styling as Appointments */}
                <div className="rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] p-4">
                    <h3 className="text-lg font-semibold mb-4 text-black dark:text-white flex items-center gap-2">
                        <Stethoscope size={20} className="text-[#08994A] dark:text-[#0EFF7B]" />
                        Your Surgeries for {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </h3>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">Loading surgeries...</p>
                        </div>
                    ) : selectedDateSurgeries.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No surgeries scheduled for this day</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateSurgeries.map((surgery, index) => (
                                <div 
                                    key={index} 
                                    className="p-4 rounded-lg border border-gray-200 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#0D0D0D] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Stethoscope size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
                                                <h4 className="font-medium text-black dark:text-white">
                                                    {surgery.surgery_name}
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                                                Patient: {surgery.patient_name} • ID: {surgery.patient_id}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-[#2A2A2A] rounded text-xs text-black dark:text-white">
                                                {formatTime(surgery.appointment_datetime)}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(surgery.status)}`}>
                                                {surgery.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Patient:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{surgery.patient_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Department:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{surgery.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DoorClosed size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Room:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{surgery.room_no}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-gray-500" />
                                            <span className="text-sm text-black dark:text-white">Phone:</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{surgery.phone_no}</span>
                                        </div>
                                    </div>
                                    
                                    {surgery.description && (
                                        <div className="mb-3">
                                            <div className="text-sm font-medium text-black dark:text-white mb-1">Description:</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {surgery.description}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="pt-3 border-t border-gray-200 dark:border-[#3A3A3A] text-xs text-gray-500">
                                        Created: {surgery.created_at ? new Date(surgery.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend - Original Style */}
            <div className="mt-6 relative z-10">
                <div className="rounded-lg border border-gray-300 dark:border-[#3A3A3A] bg-gray-100 dark:bg-[#1E1E1E] p-4">
                    <h4 className="font-medium mb-3 text-black dark:text-white">Legend</h4>
                    <div className="grid grid-cols-5 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-black dark:text-white">Check Up</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-black dark:text-white">Follow Up</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-black dark:text-white">Emergency</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-black dark:text-white">Surgery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-sm text-black dark:text-white">Cancelled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-900"></div>
                            <span className="text-sm text-black dark:text-white">New</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                            <span className="text-sm text-black dark:text-white">Normal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-900"></div>
                            <span className="text-sm text-black dark:text-white">Severe</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-900"></div>
                            <span className="text-sm text-black dark:text-white">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-900"></div>
                            <span className="text-sm text-black dark:text-white">Pending</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary - Original Style */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#0EFF7B1A] to-transparent dark:from-[#0EFF7B0A] dark:to-transparent rounded-lg">
                <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#08994A] dark:text-[#0EFF7B]">
                            {calendarItems.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total Schedule Items
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {calendarItems.filter(a => a.item_type === 'appointment').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Appointments
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {calendarItems.filter(a => a.item_type === 'surgery').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Surgeries
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {calendarItems.filter(a => a.status === 'new').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            New
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {calendarItems.filter(a => a.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Completed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorCalendar;