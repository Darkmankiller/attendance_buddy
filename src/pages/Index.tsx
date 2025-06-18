
import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [todaysAttendance, setTodaysAttendance] = useState<{[subject: string]: boolean | null}>({});
  const { toast } = useToast();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[currentDate.getDay()];
  const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
  const todaysSubjects = timetable[currentDay] || [];

  useEffect(() => {
    // Load attendance data from localStorage
    const savedData = localStorage.getItem('attendanceData');
    if (savedData) {
      setAttendanceData(JSON.parse(savedData));
    }

    // Check if today's attendance is already marked
    const today = currentDate.toDateString();
    const todaysData = localStorage.getItem(`attendance_${today}`);
    if (todaysData) {
      setTodaysAttendance(JSON.parse(todaysData));
    }
  }, [currentDate]);

  const markAttendance = (subject: string, isPresent: boolean) => {
    const newAttendanceData = { ...attendanceData };
    
    if (!newAttendanceData[subject]) {
      newAttendanceData[subject] = { total_classes: 0, attendance_score: 0 };
    }

    // Calculate new attendance
    const currentTotal = newAttendanceData[subject].total_classes;
    const currentScore = newAttendanceData[subject].attendance_score;
    
    newAttendanceData[subject].total_classes = currentTotal + 1;
    
    if (isPresent) {
      newAttendanceData[subject].attendance_score = Math.min(100, currentScore + 1);
    } else {
      newAttendanceData[subject].attendance_score = Math.max(0, currentScore - 3);
    }

    setAttendanceData(newAttendanceData);
    localStorage.setItem('attendanceData', JSON.stringify(newAttendanceData));

    // Mark today's attendance
    const newTodaysAttendance = { ...todaysAttendance, [subject]: isPresent };
    setTodaysAttendance(newTodaysAttendance);
    
    const today = currentDate.toDateString();
    localStorage.setItem(`attendance_${today}`, JSON.stringify(newTodaysAttendance));

    toast({
      title: `Attendance Marked!`,
      description: `${subject}: ${isPresent ? 'Present (+1%)' : 'Absent (-3%)'}`,
      duration: 2000,
    });
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

        {/* Date and Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="font-semibold">{formatDate(currentDate)}</span>
              </div>
            </CardContent>
          </Card>

          <Link to="/stats">
            <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Stats
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        {isWeekend ? (
          <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border-emerald-400/30 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Holiday!</h2>
              <p className="text-emerald-200">Enjoy your weekend! No classes today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Today's Classes</h2>
              <p className="text-purple-200">Mark your attendance for each subject</p>
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
                    {todaysAttendance[subject] !== undefined ? (
                      <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg">
                        {todaysAttendance[subject] ? (
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
