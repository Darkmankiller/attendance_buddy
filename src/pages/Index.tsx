
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, BarChart3, CheckCircle, XCircle, TrendingUp, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AttendanceData {
  [subject: string]: {
    total_classes: number;
    attendance_score: number;
  };
}

const timetable: { [key: string]: string[] } = {
  Monday: ['Minor', 'MDC', 'TCP/IP', 'C++', 'CO'],
  Tuesday: ['Minor', 'Minor', 'MDC', 'E-Waste', 'TCP/IP'],
  Wednesday: ['Minor', 'CO', 'MDC', 'E-Waste', 'TCP/IP'],
  Thursday: ['Minor', 'C++', 'TCP/IP', 'E-Waste', 'CO'],
  Friday: ['Minor', 'CO', 'C++', 'E-Waste', 'C++']
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [dayAttendance, setDayAttendance] = useState<{[subject: string]: boolean | null}>({});
  const { toast } = useToast();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[selectedDate.getDay()];
  const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
  const todaysSubjects = timetable[currentDay] || [];

  useEffect(() => {
    // Load attendance data from localStorage
    const savedData = localStorage.getItem('attendanceData');
    if (savedData) {
      setAttendanceData(JSON.parse(savedData));
    }

    // Load attendance for selected date
    const dateKey = selectedDate.toDateString();
    const dayData = localStorage.getItem(`attendance_${dateKey}`);
    if (dayData) {
      setDayAttendance(JSON.parse(dayData));
    } else {
      setDayAttendance({});
    }
  }, [selectedDate]);

  const markAttendance = (subject: string, isPresent: boolean) => {
    const newAttendanceData = { ...attendanceData };
    
    if (!newAttendanceData[subject]) {
      newAttendanceData[subject] = { total_classes: 0, attendance_score: 0 };
    }

    // Check if this subject was already marked for this date
    const previousAttendance = dayAttendance[subject];
    const currentTotal = newAttendanceData[subject].total_classes;
    const currentScore = newAttendanceData[subject].attendance_score;
    
    if (previousAttendance === undefined) {
      // First time marking for this date
      newAttendanceData[subject].total_classes = currentTotal + 1;
      if (isPresent) {
        newAttendanceData[subject].attendance_score = Math.min(100, currentScore + 1);
      } else {
        newAttendanceData[subject].attendance_score = Math.max(0, currentScore - 3);
      }
    } else {
      // Editing existing attendance
      if (previousAttendance && !isPresent) {
        // Was present, now absent: remove +1, add -3
        newAttendanceData[subject].attendance_score = Math.max(0, currentScore - 4);
      } else if (!previousAttendance && isPresent) {
        // Was absent, now present: remove -3, add +1
        newAttendanceData[subject].attendance_score = Math.min(100, currentScore + 4);
      }
      // If same value, no change needed
    }

    setAttendanceData(newAttendanceData);
    localStorage.setItem('attendanceData', JSON.stringify(newAttendanceData));

    // Update day's attendance
    const newDayAttendance = { ...dayAttendance, [subject]: isPresent };
    setDayAttendance(newDayAttendance);
    
    const dateKey = selectedDate.toDateString();
    localStorage.setItem(`attendance_${dateKey}`, JSON.stringify(newDayAttendance));

    toast({
      title: `Attendance ${previousAttendance !== undefined ? 'Updated' : 'Marked'}!`,
      description: `${subject}: ${isPresent ? 'Present (+1%)' : 'Absent (-3%)'}`,
      duration: 2000,
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getUniqueSubjects = (subjects: string[]) => {
    const subjectCount: {[key: string]: number} = {};
    subjects.forEach(subject => {
      subjectCount[subject] = (subjectCount[subject] || 0) + 1;
    });
    return Object.entries(subjectCount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Smart Attendance Tracker</h1>
          </div>
          <p className="text-purple-200 text-lg">College Semester: June 2, 2025 - December 2, 2025</p>
        </div>

        {/* Date Navigation and Calendar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-white">
                  <CalendarIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">{formatDate(selectedDate)}</span>
                  {!isToday && <span className="text-purple-300 text-sm">(Past Date)</span>}
                </div>
              </CardContent>
            </Card>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigateDate('prev')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Pick Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => navigateDate('next')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setSelectedDate(new Date())}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Today
            </Button>
            <Link to="/stats">
              <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Stats
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {isWeekend ? (
          <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border-emerald-400/30 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Holiday!</h2>
              <p className="text-emerald-200">No classes on {currentDay}!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isToday ? "Today's Classes" : `Classes for ${currentDay}`}
              </h2>
              <p className="text-purple-200">
                {isToday ? "Mark your attendance for each subject" : "View or edit attendance for this date"}
              </p>
            </div>

            <div className="grid gap-4 md:gap-6">
              {getUniqueSubjects(todaysSubjects).map(([subject, count]) => (
                <Card key={subject} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{subject}</span>
                      {count > 1 && (
                        <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-sm">
                          {count} periods
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayAttendance[subject] !== undefined ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg">
                          {dayAttendance[subject] ? (
                            <>
                              <CheckCircle className="h-6 w-6 text-green-400" />
                              <span className="text-green-400 font-semibold">Marked Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-6 w-6 text-red-400" />
                              <span className="text-red-400 font-semibold">Marked Absent</span>
                            </>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-purple-200 text-sm mb-3">Want to change this?</p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => markAttendance(subject, true)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Present
                            </Button>
                            <Button
                              onClick={() => markAttendance(subject, false)}
                              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-purple-200 text-center mb-4">Did you attend {subject}?</p>
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={() => markAttendance(subject, true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Present
                          </Button>
                          <Button
                            onClick={() => markAttendance(subject, false)}
                            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
