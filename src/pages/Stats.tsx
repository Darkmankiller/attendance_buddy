
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
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
                const attendedClasses = getAttendedClasses(data.total_classes, percentage);
                const missedClasses = getMissedClasses(data.total_classes, percentage);

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
                      {/* Progress Bar */}
                      <div className="space-y-2">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-white">{data.total_classes}</div>
                          <div className="text-sm text-purple-200">Total Classes</div>
                        </div>
                        <div className="bg-green-500/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-400">{attendedClasses}</div>
                          <div className="text-sm text-green-200">Attended</div>
                        </div>
                        <div className="bg-red-500/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-red-400">{missedClasses}</div>
                          <div className="text-sm text-red-200">Missed</div>
                        </div>
                        <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                          <div className={`text-2xl font-bold ${getAttendanceColor(percentage)}`}>
                            {percentage < 50 ? 'Critical' : percentage < 75 ? 'Warning' : 'Good'}
                          </div>
                          <div className="text-sm text-purple-200">Status</div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {percentage < 75 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">
                              {percentage < 50 ? 'Critical Alert!' : 'Improvement Needed'}
                            </span>
                          </div>
                          <p className="text-yellow-200 text-sm">
                            {percentage < 50 
                              ? `Your attendance is critically low. Attend the next ${Math.ceil((75 - percentage) / 1)} classes to reach 75%.`
                              : `You need to attend the next ${Math.ceil((75 - percentage) / 1)} classes to reach the safe zone of 75%.`
                            }
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
