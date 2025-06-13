import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Plus, Edit, Trash2, Users, TrendingUp, Star, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AvailabilitySlot {
  id: string;
  startTime: Date;
  endTime: Date;
  price: string;
  isRecurring: boolean;
  recurringInterval: number;
  isAvailable: boolean;
  metadata: string;
}

interface HostStats {
  totalEarnings: string;
  totalMeetings: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  thisWeekBookings: number;
  thisMonthEarnings: string;
}

interface EnhancedHostDashboardProps {
  user: {
    address: string;
    isConnected: boolean;
    ensName?: string;
  };
}

const EnhancedHostDashboard: React.FC<EnhancedHostDashboardProps> = ({ user }) => {
  const [hostProfile, setHostProfile] = useState({
    displayName: 'AI Meeting Assistant',
    bio: 'AI-powered meeting scheduling assistant with multi-host support',
    specialties: ['AI Consultation', 'Meeting Scheduling', 'Automation'],
    languages: ['English'],
    timezone: 'UTC',
    defaultPrice: '0.01',
    pricingModel: 0,
    isActive: true,
    autoConfirm: true,
    instantBooking: true,
    verified: false
  });

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    {
      id: '1',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      price: '0.01',
      isRecurring: true,
      recurringInterval: 7,
      isAvailable: true,
      metadata: 'Standard consultation slot'
    },
    {
      id: '2',
      startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
      price: '0.015',
      isRecurring: false,
      recurringInterval: 0,
      isAvailable: true,
      metadata: 'Premium consultation slot'
    }
  ]);

  const [hostStats, setHostStats] = useState<HostStats>({
    totalEarnings: '2.45',
    totalMeetings: 127,
    averageRating: 9.2,
    responseTime: 15,
    completionRate: 98.5,
    thisWeekBookings: 8,
    thisMonthEarnings: '0.85'
  });

  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: '1',
      requesterAddress: '0x1234...5678',
      requesterName: 'Alice Johnson',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      price: '0.01',
      status: 'confirmed',
      notes: 'Blockchain consultation session'
    },
    {
      id: '2',
      requesterAddress: '0x5678...9012',
      requesterName: 'Bob Smith',
      startTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
      price: '0.015',
      status: 'pending',
      notes: 'Smart contract review'
    }
  ]);

  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    price: '0.01',
    isRecurring: false,
    recurringInterval: 7,
    metadata: ''
  });

  const handleAddSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    const slot: AvailabilitySlot = {
      id: Date.now().toString(),
      startTime: new Date(newSlot.startTime),
      endTime: new Date(newSlot.endTime),
      price: newSlot.price,
      isRecurring: newSlot.isRecurring,
      recurringInterval: newSlot.recurringInterval,
      isAvailable: true,
      metadata: newSlot.metadata
    };

    setAvailabilitySlots(prev => [...prev, slot]);
    setShowAddSlotDialog(false);
    setNewSlot({
      startTime: '',
      endTime: '',
      price: '0.01',
      isRecurring: false,
      recurringInterval: 7,
      metadata: ''
    });
  };

  const handleRemoveSlot = (slotId: string) => {
    setAvailabilitySlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleToggleSlotAvailability = (slotId: string) => {
    setAvailabilitySlots(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

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

  const getPricingModelText = (model: number) => {
    switch (model) {
      case 0: return 'Fixed';
      case 1: return 'Hourly';
      case 2: return 'Dynamic';
      case 3: return 'Subscription';
      default: return 'Fixed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your availability, meetings, and earnings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={hostProfile.isActive ? "default" : "secondary"}>
            <Activity className="w-4 h-4 mr-1" />
            {hostProfile.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {hostProfile.verified && (
            <Badge variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostStats.totalEarnings} ETH</div>
            <p className="text-xs text-muted-foreground">
              +{hostStats.thisMonthEarnings} ETH this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostStats.totalMeetings}</div>
            <p className="text-xs text-muted-foreground">
              +{hostStats.thisWeekBookings} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostStats.averageRating}/10</div>
            <p className="text-xs text-muted-foreground">
              {hostStats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{hostStats.responseTime}min</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Availability Management */}
        <TabsContent value="availability" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Availability Slots</h2>
              <p className="text-muted-foreground">
                Manage your available time slots for meetings
              </p>
            </div>
            <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Availability Slot</DialogTitle>
                  <DialogDescription>
                    Create a new time slot for meetings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ETH)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      value={newSlot.price}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={newSlot.isRecurring}
                      onCheckedChange={(checked) => setNewSlot(prev => ({ ...prev, isRecurring: checked }))}
                    />
                    <Label htmlFor="recurring">Recurring slot</Label>
                  </div>

                  {newSlot.isRecurring && (
                    <div className="space-y-2">
                      <Label htmlFor="interval">Recurring Interval (days)</Label>
                      <Select
                        value={newSlot.recurringInterval.toString()}
                        onValueChange={(value) => setNewSlot(prev => ({ ...prev, recurringInterval: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Daily</SelectItem>
                          <SelectItem value="7">Weekly</SelectItem>
                          <SelectItem value="14">Bi-weekly</SelectItem>
                          <SelectItem value="30">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="metadata">Notes (optional)</Label>
                    <Textarea
                      id="metadata"
                      placeholder="Add any notes about this slot..."
                      value={newSlot.metadata}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, metadata: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddSlotDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSlot}>
                      Add Slot
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {availabilitySlots.map((slot) => (
              <Card key={slot.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                        </span>
                        {slot.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring ({slot.recurringInterval}d)
                          </Badge>
                        )}
                        <Badge variant={slot.isAvailable ? "default" : "secondary"} className="text-xs">
                          {slot.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{slot.price} ETH</span>
                        </div>
                        {slot.metadata && (
                          <span>{slot.metadata}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSlotAvailability(slot.id)}
                      >
                        {slot.isAvailable ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Meetings Management */}
        <TabsContent value="meetings" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Upcoming Meetings</h2>
            <p className="text-muted-foreground">
              Manage your scheduled meetings and bookings
            </p>
          </div>

          <div className="grid gap-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{meeting.requesterName}</span>
                        <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(meeting.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{meeting.price} ETH</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{meeting.requesterAddress.slice(0, 6)}...{meeting.requesterAddress.slice(-4)}</span>
                        </div>
                      </div>
                      {meeting.notes && (
                        <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {meeting.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm">
                            Decline
                          </Button>
                          <Button size="sm">
                            Confirm
                          </Button>
                        </>
                      )}
                      {meeting.status === 'confirmed' && (
                        <Button size="sm">
                          Start Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Management */}
        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Host Profile</h2>
              <p className="text-muted-foreground">
                Manage your public profile and settings
              </p>
            </div>
            <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Host Profile</DialogTitle>
                  <DialogDescription>
                    Update your public profile information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={hostProfile.displayName}
                        onChange={(e) => setHostProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={hostProfile.timezone}
                        onValueChange={(value) => setHostProfile(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                          <SelectItem value="UTC+9">UTC+9 (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={hostProfile.bio}
                      onChange={(e) => setHostProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultPrice">Default Price (ETH)</Label>
                      <Input
                        id="defaultPrice"
                        type="number"
                        step="0.001"
                        value={hostProfile.defaultPrice}
                        onChange={(e) => setHostProfile(prev => ({ ...prev, defaultPrice: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricingModel">Pricing Model</Label>
                      <Select
                        value={hostProfile.pricingModel.toString()}
                        onValueChange={(value) => setHostProfile(prev => ({ ...prev, pricingModel: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Fixed</SelectItem>
                          <SelectItem value="1">Hourly</SelectItem>
                          <SelectItem value="2">Dynamic</SelectItem>
                          <SelectItem value="3">Subscription</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="isActive">Active Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow new bookings
                          </p>
                        </div>
                        <Switch
                          id="isActive"
                          checked={hostProfile.isActive}
                          onCheckedChange={(checked) => setHostProfile(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoConfirm">Auto-confirm meetings</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically confirm new bookings
                          </p>
                        </div>
                        <Switch
                          id="autoConfirm"
                          checked={hostProfile.autoConfirm}
                          onCheckedChange={(checked) => setHostProfile(prev => ({ ...prev, autoConfirm: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="instantBooking">Instant booking</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow instant bookings without approval
                          </p>
                        </div>
                        <Switch
                          id="instantBooking"
                          checked={hostProfile.instantBooking}
                          onCheckedChange={(checked) => setHostProfile(prev => ({ ...prev, instantBooking: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowEditProfileDialog(false)}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {hostProfile.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{hostProfile.displayName}</h3>
                    <p className="text-muted-foreground">{user.address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">{hostProfile.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {hostProfile.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {hostProfile.languages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{hostProfile.defaultPrice} ETH</div>
                    <div className="text-sm text-muted-foreground">Default Price</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{getPricingModelText(hostProfile.pricingModel)}</div>
                    <div className="text-sm text-muted-foreground">Pricing Model</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{hostProfile.timezone}</div>
                    <div className="text-sm text-muted-foreground">Timezone</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{hostProfile.isActive ? 'Active' : 'Inactive'}</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Analytics & Insights</h2>
            <p className="text-muted-foreground">
              Track your performance and earnings over time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Earnings Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-green-600">{hostStats.totalEarnings} ETH</div>
                  <p className="text-muted-foreground">Total earnings</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    📈 +{hostStats.thisMonthEarnings} ETH this month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Meeting Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Meetings</span>
                    <span className="font-semibold">{hostStats.totalMeetings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week</span>
                    <span className="font-semibold">{hostStats.thisWeekBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-semibold">{hostStats.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-semibold">{hostStats.averageRating}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedHostDashboard;

