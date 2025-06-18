
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
    <div className="min-h-screen anime-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary animate-glow-pulse">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-black sci-fi-header">
              Smart Attendance Tracker
            </h1>
          </div>
          <p className="text-lg font-poppins text-muted-foreground">
            College Semester: June 2, 2025 - December 2, 2025
          </p>
        </div>

        {/* Date Navigation and Calendar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="anime-card">
              <div className="p-4">
                <div className="flex items-center gap-3 text-foreground">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span className="font-poppins font-semibold">{formatDate(selectedDate)}</span>
                  {!isToday && <span className="status-indicator">Past Date</span>}
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigateDate('prev')}
                className="neon-button p-3"
                variant="secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="neon-button px-4 py-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Pick Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 anime-card border-primary/30" align="start">
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
                className="neon-button p-3"
                variant="secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setSelectedDate(new Date())}
              className="neon-button px-6 py-3 font-poppins font-semibold"
            >
              Today
            </Button>
            <Link to="/stats">
              <Button className="neon-button px-6 py-3 font-poppins font-semibold">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Stats
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {isWeekend ? (
          <div className="anime-card max-w-md mx-auto">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-orbitron font-bold text-primary mb-2">System Holiday</h2>
              <p className="font-poppins text-secondary">No classes scheduled for {currentDay}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-orbitron font-bold sci-fi-header mb-2">
                {isToday ? "Today's Classes" : `Classes for ${currentDay}`}
              </h2>
              <p className="font-poppins text-muted-foreground">
                {isToday ? "Mark your attendance for each subject" : "View or edit attendance for this date"}
              </p>
            </div>

            <div className="grid gap-6">
              {getUniqueSubjects(todaysSubjects).map(([subject, count]) => (
                <div key={subject} className="anime-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-orbitron font-bold text-foreground">{subject}</h3>
                      {count > 1 && (
                        <span className="status-indicator">
                          {count} periods
                        </span>
                      )}
                    </div>
                    
                    {dayAttendance[subject] !== undefined ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 anime-card border-primary/30">
                          {dayAttendance[subject] ? (
                            <>
                              <CheckCircle className="h-6 w-6 text-green-400" />
                              <span className="text-green-400 font-poppins font-semibold">Status: Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-6 w-6 text-red-400" />
                              <span className="text-red-400 font-poppins font-semibold">Status: Absent</span>
                            </>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-poppins text-muted-foreground text-sm mb-3">Update attendance status</p>
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => markAttendance(subject, true)}
                              className="neon-button px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Present
                            </Button>
                            <Button
                              onClick={() => markAttendance(subject, false)}
                              className="neon-button px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="font-poppins text-center text-muted-foreground mb-4">
                          Mark attendance for {subject}
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={() => markAttendance(subject, true)}
                            className="neon-button px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Present
                          </Button>
                          <Button
                            onClick={() => markAttendance(subject, false)}
                            className="neon-button px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
