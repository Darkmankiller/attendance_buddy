
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

interface AttendanceData {
  [subject: string]: {
    total_classes: number;
    attendance_score: number;
  };
}

const Stats = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  useEffect(() => {
    const savedData = localStorage.getItem('attendanceData');
    if (savedData) {
      setAttendanceData(JSON.parse(savedData));
    }
  }, []);

  // Calculate semester progress and remaining classes
  const getSemesterInfo = () => {
    const semesterStart = new Date('2025-06-02');
    const semesterEnd = new Date('2025-12-02');
    const today = new Date();
    
    const totalDays = Math.floor((semesterEnd.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((today.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysPassed);
    
    return {
      totalDays,
      daysPassed: Math.max(0, daysPassed),
      daysRemaining,
      progressPercentage: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
    };
  };

  const getSubjectStats = (subject: string, data: AttendanceData[string]) => {
    const attendedClasses = getAttendedClasses(data.total_classes, data.attendance_score);
    const missedClasses = getMissedClasses(data.total_classes, data.attendance_score);
    
    // Estimate remaining classes based on timetable frequency
    const subjectFrequency = getSubjectFrequency(subject);
    const semesterInfo = getSemesterInfo();
    const weeksRemaining = Math.ceil(semesterInfo.daysRemaining / 7);
    const estimatedRemainingClasses = weeksRemaining * subjectFrequency;
    
    const totalProjectedClasses = data.total_classes + estimatedRemainingClasses;
    const progressPercentage = (data.total_classes / totalProjectedClasses) * 100;
    
    // Calculate classes needed to maintain 75%
    const targetAttendance = 0.75;
    const currentAttended = attendedClasses;
    const totalNeeded = Math.ceil(currentAttended / targetAttendance);
    const classesNeededFor75 = Math.max(0, totalNeeded - data.total_classes);
    
    return {
      attendedClasses,
      missedClasses,
      estimatedRemainingClasses,
      totalProjectedClasses,
      progressPercentage,
      classesNeededFor75
    };
  };

  const getSubjectFrequency = (subject: string) => {
    // Count how many times each subject appears per week
    const timetable = {
      Monday: ['Minor', 'MDC', 'TCP/IP', 'C++', 'CO'],
      Tuesday: ['Minor', 'Minor', 'MDC', 'E-Waste', 'TCP/IP'],
      Wednesday: ['Minor', 'CO', 'MDC', 'E-Waste', 'TCP/IP'],
      Thursday: ['Minor', 'C++', 'TCP/IP', 'E-Waste', 'CO'],
      Friday: ['Minor', 'CO', 'C++', 'E-Waste', 'C++']
    };
    
    let frequency = 0;
    Object.values(timetable).forEach(day => {
      frequency += day.filter(subj => subj === subject).length;
    });
    
    return frequency;
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage < 50) return 'text-red-400';
    if (percentage < 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage < 50) return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (percentage < 75) return <TrendingUp className="h-5 w-5 text-yellow-400" />;
    return <CheckCircle className="h-5 w-5 text-green-400" />;
  };

  const getAttendedClasses = (totalClasses: number, percentage: number) => {
    return Math.round((percentage / 100) * totalClasses);
  };

  const getMissedClasses = (totalClasses: number, percentage: number) => {
    return totalClasses - getAttendedClasses(totalClasses, percentage);
  };

  const subjects = Object.keys(attendanceData);
  const overallAttendance = subjects.length > 0 
    ? subjects.reduce((sum, subject) => sum + attendanceData[subject].attendance_score, 0) / subjects.length 
    : 0;

  const semesterInfo = getSemesterInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Attendance Statistics</h1>
          </div>
        </div>

        {/* Semester Progress */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Calendar className="h-6 w-6 text-purple-400" />
              Semester Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-purple-200 text-sm">
                <span>June 2, 2025</span>
                <span>{semesterInfo.progressPercentage.toFixed(1)}% Complete</span>
                <span>December 2, 2025</span>
              </div>
              <Progress value={semesterInfo.progressPercentage} className="h-2 bg-white/20" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{semesterInfo.daysPassed}</div>
                  <div className="text-purple-200 text-sm">Days Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{semesterInfo.daysRemaining}</div>
                  <div className="text-purple-200 text-sm">Days Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{semesterInfo.totalDays}</div>
                  <div className="text-purple-200 text-sm">Total Days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getAttendanceColor(overallAttendance)}`}>
                  {overallAttendance.toFixed(1)}%
                </div>
                <p className="text-purple-200">Overall Attendance</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{subjects.length}</div>
                <p className="text-purple-200">Total Subjects</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {subjects.reduce((sum, subject) => sum + attendanceData[subject].total_classes, 0)}
                </div>
                <p className="text-purple-200">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Stats */}
        {subjects.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
              <p className="text-purple-200 mb-6">Start marking your attendance to see statistics here!</p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-lg">
                  Mark Today's Attendance
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Subject-wise Breakdown</h2>
            <div className="grid gap-6">
              {subjects.map((subject) => {
                const data = attendanceData[subject];
                const percentage = data.attendance_score;
                const stats = getSubjectStats(subject, data);

                return (
                  <Card key={subject} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="text-xl">{subject}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(percentage)}
                          <span className={`text-2xl font-bold ${getAttendanceColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar for Semester Completion */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-purple-200">
                          <span>Semester Progress</span>
                          <span>{stats.progressPercentage.toFixed(1)}% Complete</span>
                        </div>
                        <Progress 
                          value={stats.progressPercentage} 
                          className="h-2 bg-white/20"
                        />
                        <div className="text-xs text-purple-300 text-center">
                          {data.total_classes} / {stats.totalProjectedClasses} classes (estimated)
                        </div>
                      </div>

                      {/* Attendance Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-purple-200">
                          <span>Attendance Rate</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-3 bg-white/20"
                        />
                        <div className="flex justify-between text-sm text-purple-200">
                          <span>0%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-white">{data.total_classes}</div>
                          <div className="text-xs text-purple-200">Total</div>
                        </div>
                        <div className="bg-green-500/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-400">{stats.attendedClasses}</div>
                          <div className="text-xs text-green-200">Attended</div>
                        </div>
                        <div className="bg-red-500/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-red-400">{stats.missedClasses}</div>
                          <div className="text-xs text-red-200">Missed</div>
                        </div>
                        <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-blue-400">{stats.estimatedRemainingClasses}</div>
                          <div className="text-xs text-blue-200">Remaining</div>
                        </div>
                        <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                          <div className={`text-lg font-bold ${getAttendanceColor(percentage)}`}>
                            {percentage < 50 ? 'Critical' : percentage < 75 ? 'Warning' : 'Good'}
                          </div>
                          <div className="text-xs text-purple-200">Status</div>
                        </div>
                      </div>

                      {/* Target to maintain 75% */}
                      {percentage < 75 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">Target: 75% Attendance</span>
                          </div>
                          <p className="text-yellow-200 text-sm mb-2">
                            To reach 75% attendance, you need to attend <strong>{stats.classesNeededFor75}</strong> more consecutive classes.
                          </p>
                          <div className="text-xs text-yellow-300">
                            Current: {stats.attendedClasses}/{data.total_classes} classes attended
                          </div>
                        </div>
                      )}

                      {percentage >= 75 && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="font-semibold text-green-400">Target Achieved! 🎉</span>
                          </div>
                          <p className="text-green-200 text-sm">
                            Great job! You're maintaining good attendance. Keep it up to stay above 75%.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
