import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, DollarSign, Star, Filter, MessageSquare, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Meeting {
  id: string;
  hostAddress: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  price: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  specialty: string;
  rating?: number;
  feedback?: string;
}

interface BookingRequest {
  hostAddress: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  price: string;
  notes: string;
  specialty: string;
}

interface EnhancedRequesterDashboardProps {
  user: {
    address: string;
    isConnected: boolean;
    ensName?: string;
  };
  onBookMeeting?: (request: BookingRequest) => void;
}

const EnhancedRequesterDashboard: React.FC<EnhancedRequesterDashboardProps> = ({ user, onBookMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      hostAddress: '0x1234567890123456789012345678901234567890',
      hostName: 'Dr. Sarah Chen',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      price: '0.05',
      status: 'confirmed',
      notes: 'Blockchain consultation session',
      specialty: 'Blockchain Consulting'
    },
    {
      id: '2',
      hostAddress: '0x2345678901234567890123456789012345678901',
      hostName: 'Alex Rodriguez',
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
      price: '0.03',
      status: 'pending',
      notes: 'Technical support for smart contract deployment',
      specialty: 'Technical Support'
    },
    {
      id: '3',
      hostAddress: '0x3456789012345678901234567890123456789012',
      hostName: 'Maria Santos',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
      price: '0.08',
      status: 'completed',
      notes: 'Business strategy consultation',
      specialty: 'Business Strategy',
      rating: 9,
      feedback: 'Excellent insights on tokenomics and go-to-market strategy!'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [newBooking, setNewBooking] = useState<BookingRequest>({
    hostAddress: '',
    hostName: '',
    startTime: new Date(),
    endTime: new Date(),
    price: '0.01',
    notes: '',
    specialty: ''
  });
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const pastMeetings = filteredMeetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCancelMeeting = (meetingId: string) => {
    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, status: 'cancelled' as const }
          : meeting
      )
    );
  };

  const handleSubmitRating = () => {
    if (selectedMeeting) {
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === selectedMeeting.id 
            ? { ...meeting, rating, feedback }
            : meeting
        )
      );
      setShowRatingDialog(false);
      setRating(0);
      setFeedback('');
      setSelectedMeeting(null);
    }
  };

  const handleBookMeeting = () => {
    if (onBookMeeting) {
      onBookMeeting(newBooking);
    }
    
    // Add to local state for demo
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      ...newBooking,
      status: 'pending'
    };
    
    setMeetings(prev => [...prev, newMeeting]);
    setShowBookingDialog(false);
    setNewBooking({
      hostAddress: '',
      hostName: '',
      startTime: new Date(),
      endTime: new Date(),
      price: '0.01',
      notes: '',
      specialty: ''
    });
  };

  const totalSpent = meetings
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + parseFloat(m.price), 0);

  const averageRating = meetings
    .filter(m => m.rating)
    .reduce((sum, m, _, arr) => sum + (m.rating || 0) / arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">My Meetings</h1>
          <p className="text-muted-foreground">
            Manage your meeting bookings and history
          </p>
        </div>
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Book Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a New Meeting</DialogTitle>
              <DialogDescription>
                Schedule a meeting with a host
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostName">Host Name</Label>
                  <Input
                    id="hostName"
                    value={newBooking.hostName}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, hostName: e.target.value }))}
                    placeholder="Enter host name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select
                    value={newBooking.specialty}
                    onValueChange={(value) => setNewBooking(prev => ({ ...prev, specialty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blockchain Consulting">Blockchain Consulting</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Business Strategy">Business Strategy</SelectItem>
                      <SelectItem value="Legal Consultation">Legal Consultation</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newBooking.startTime.toISOString().slice(0, 16)}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newBooking.endTime.toISOString().slice(0, 16)}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={newBooking.price}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about the meeting..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBookMeeting}>
                  Book Meeting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingMeetings.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toFixed(3)} ETH</div>
            <p className="text-xs text-muted-foreground">
              Across {meetings.filter(m => m.status === 'completed').length} completed meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {meetings.filter(m => m.rating).length} rated meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.length > 0 ? Math.round((meetings.filter(m => m.status === 'completed').length / meetings.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search meetings by host, specialty, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No upcoming meetings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Book a meeting with a host to get started
              </p>
              <Button onClick={() => setShowBookingDialog(true)}>
                Book Your First Meeting
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {meeting.hostName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{meeting.hostName}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {meeting.specialty}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                                {getStatusIcon(meeting.status)}
                                <span className="ml-1">{meeting.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTime(meeting.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60))} min
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{meeting.price} ETH</span>
                          </div>
                        </div>

                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {meeting.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelMeeting(meeting.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {meeting.status === 'confirmed' && (
                          <>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                            <Button size="sm">
                              Join Meeting
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Meeting History */}
        <TabsContent value="history" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No meeting history</h3>
              <p className="text-sm text-muted-foreground">
                Your completed and cancelled meetings will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {meeting.hostName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{meeting.hostName}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {meeting.specialty}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                                {getStatusIcon(meeting.status)}
                                <span className="ml-1">{meeting.status}</span>
                              </Badge>
                              {meeting.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{meeting.rating}/10</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTime(meeting.startTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60))} min
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{meeting.price} ETH</span>
                          </div>
                        </div>

                        {meeting.notes && (
                          <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                        )}

                        {meeting.feedback && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm">{meeting.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {meeting.status === 'completed' && !meeting.rating && (
                          <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMeeting(meeting)}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Rate
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rate Your Meeting</DialogTitle>
                                <DialogDescription>
                                  How was your meeting with {selectedMeeting?.hostName}?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Rating (1-10)</Label>
                                  <div className="flex space-x-1">
                                    {[...Array(10)].map((_, i) => (
                                      <Button
                                        key={i}
                                        variant={rating > i ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setRating(i + 1)}
                                        className="w-8 h-8 p-0"
                                      >
                                        {i + 1}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="feedback">Feedback (optional)</Label>
                                  <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your experience..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSubmitRating} disabled={rating === 0}>
                                    Submit Rating
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button variant="outline" size="sm">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRequesterDashboard;

