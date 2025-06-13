import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, MapPin, DollarSign, Users, Verified, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HostProfile {
  address: string;
  displayName: string;
  bio: string;
  profileImageUrl?: string;
  defaultPrice: string;
  pricingModel: number;
  totalEarnings: string;
  totalMeetings: number;
  rating: number;
  ratingCount: number;
  isActive: boolean;
  specialties: string[];
  languages: string[];
  timezone: string;
  responseTime: number;
  availability: {
    nextAvailable: Date | null;
    slotsThisWeek: number;
    slotsNextWeek: number;
  };
  metadata: {
    verified: boolean;
    premiumHost: boolean;
    instantBooking: boolean;
    autoConfirm: boolean;
  };
}

interface HostSearchFilters {
  priceRange?: { min: number; max: number };
  rating?: number;
  specialties?: string[];
  languages?: string[];
  timezone?: string;
  availability?: {
    date?: Date;
    timeRange?: { start: number; end: number };
  };
  instantBooking?: boolean;
  verified?: boolean;
  premiumOnly?: boolean;
}

interface HostMarketplaceProps {
  user: {
    address: string;
    isConnected: boolean;
    ensName?: string;
  };
  onHostSelect: (host: HostProfile) => void;
  onBookMeeting: (host: HostProfile, details: any) => void;
}

const HostMarketplace: React.FC<HostMarketplaceProps> = ({ user, onHostSelect, onBookMeeting }) => {
  const [hosts, setHosts] = useState<HostProfile[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<HostProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHost, setSelectedHost] = useState<HostProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'availability' | 'responseTime'>('rating');
  
  // Filter states
  const [filters, setFilters] = useState<HostSearchFilters>({
    priceRange: { min: 0, max: 1 },
    rating: 0,
    specialties: [],
    verified: false,
    instantBooking: false,
    premiumOnly: false
  });

  // Mock data for demonstration
  const mockHosts: HostProfile[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      displayName: 'Dr. Sarah Chen',
      bio: 'Expert blockchain consultant with 10+ years in DeFi and smart contract development. Specialized in tokenomics and protocol design.',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      defaultPrice: '0.05',
      pricingModel: 0,
      totalEarnings: '2.5',
      totalMeetings: 47,
      rating: 9.2,
      ratingCount: 43,
      isActive: true,
      specialties: ['Blockchain Consulting', 'Smart Contracts', 'DeFi'],
      languages: ['English', 'Mandarin'],
      timezone: 'UTC-8',
      responseTime: 15,
      availability: {
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slotsThisWeek: 8,
        slotsNextWeek: 12
      },
      metadata: {
        verified: true,
        premiumHost: true,
        instantBooking: true,
        autoConfirm: true
      }
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      displayName: 'Alex Rodriguez',
      bio: 'Full-stack developer and technical mentor. Helping teams build scalable Web3 applications and navigate technical challenges.',
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      defaultPrice: '0.03',
      pricingModel: 0,
      totalEarnings: '1.8',
      totalMeetings: 62,
      rating: 8.9,
      ratingCount: 58,
      isActive: true,
      specialties: ['Technical Support', 'Web3 Development', 'Code Review'],
      languages: ['English', 'Spanish'],
      timezone: 'UTC-5',
      responseTime: 30,
      availability: {
        nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000),
        slotsThisWeek: 15,
        slotsNextWeek: 18
      },
      metadata: {
        verified: true,
        premiumHost: false,
        instantBooking: true,
        autoConfirm: false
      }
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      displayName: 'Maria Santos',
      bio: 'Business strategist and startup advisor. Specialized in go-to-market strategies for blockchain startups and tokenomics design.',
      profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      defaultPrice: '0.08',
      pricingModel: 0,
      totalEarnings: '3.2',
      totalMeetings: 38,
      rating: 9.5,
      ratingCount: 35,
      isActive: true,
      specialties: ['Business Strategy', 'Tokenomics', 'Startup Consulting'],
      languages: ['English', 'Portuguese', 'Spanish'],
      timezone: 'UTC-3',
      responseTime: 45,
      availability: {
        nextAvailable: new Date(Date.now() + 48 * 60 * 60 * 1000),
        slotsThisWeek: 5,
        slotsNextWeek: 8
      },
      metadata: {
        verified: true,
        premiumHost: true,
        instantBooking: false,
        autoConfirm: true
      }
    },
    {
      address: '0x4567890123456789012345678901234567890123',
      displayName: 'David Kim',
      bio: 'Legal expert in cryptocurrency and blockchain regulations. Helping projects navigate compliance and regulatory frameworks.',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      defaultPrice: '0.12',
      pricingModel: 0,
      totalEarnings: '4.1',
      totalMeetings: 29,
      rating: 9.7,
      ratingCount: 27,
      isActive: true,
      specialties: ['Legal Consultation', 'Regulatory Compliance', 'Smart Contract Auditing'],
      languages: ['English', 'Korean'],
      timezone: 'UTC+9',
      responseTime: 60,
      availability: {
        nextAvailable: new Date(Date.now() + 72 * 60 * 60 * 1000),
        slotsThisWeek: 3,
        slotsNextWeek: 6
      },
      metadata: {
        verified: true,
        premiumHost: true,
        instantBooking: false,
        autoConfirm: false
      }
    },
    {
      address: '0x5678901234567890123456789012345678901234',
      displayName: 'Emma Thompson',
      bio: 'UX/UI designer specializing in Web3 interfaces. Creating intuitive user experiences for decentralized applications.',
      profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      defaultPrice: '0.04',
      pricingModel: 0,
      totalEarnings: '1.2',
      totalMeetings: 31,
      rating: 8.6,
      ratingCount: 28,
      isActive: true,
      specialties: ['UI/UX Design', 'Web3 Design', 'User Research'],
      languages: ['English'],
      timezone: 'UTC+0',
      responseTime: 20,
      availability: {
        nextAvailable: new Date(Date.now() + 6 * 60 * 60 * 1000),
        slotsThisWeek: 12,
        slotsNextWeek: 15
      },
      metadata: {
        verified: false,
        premiumHost: false,
        instantBooking: true,
        autoConfirm: true
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setHosts(mockHosts);
      setFilteredHosts(mockHosts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hosts, searchQuery, filters, sortBy]);

  const applyFilters = () => {
    let filtered = hosts.filter(host => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          host.displayName.toLowerCase().includes(query) ||
          host.bio.toLowerCase().includes(query) ||
          host.specialties.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const price = parseFloat(host.defaultPrice);
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && host.rating < filters.rating) {
        return false;
      }

      // Specialty filter
      if (filters.specialties && filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some(specialty =>
          host.specialties.includes(specialty)
        );
        if (!hasSpecialty) return false;
      }

      // Verified filter
      if (filters.verified && !host.metadata.verified) {
        return false;
      }

      // Instant booking filter
      if (filters.instantBooking && !host.metadata.instantBooking) {
        return false;
      }

      // Premium only filter
      if (filters.premiumOnly && !host.metadata.premiumHost) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return parseFloat(a.defaultPrice) - parseFloat(b.defaultPrice);
        case 'availability':
          return b.availability.slotsThisWeek - a.availability.slotsThisWeek;
        case 'responseTime':
          return a.responseTime - b.responseTime;
        default:
          return 0;
      }
    });

    setFilteredHosts(filtered);
  };

  const handleHostSelect = (host: HostProfile) => {
    setSelectedHost(host);
    onHostSelect(host);
  };

  const formatNextAvailable = (date: Date | null) => {
    if (!date) return 'Not available';
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Available in ${diffHours}h`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `Available in ${diffDays}d`;
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

  const availableSpecialties = Array.from(
    new Set(hosts.flatMap(host => host.specialties))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Host Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and book meetings with verified experts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <Users className="w-4 h-4 mr-1" />
              {hosts.length} Hosts
            </Badge>
            <Badge variant="secondary">
              <Star className="w-4 h-4 mr-1" />
              {(hosts.reduce((sum, h) => sum + h.rating, 0) / hosts.length).toFixed(1)} Avg Rating
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search hosts by name, specialty, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="responseTime">Response Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range (ETH)</label>
                  <Slider
                    value={[filters.priceRange?.min || 0, filters.priceRange?.max || 1]}
                    onValueChange={([min, max]) => 
                      setFilters(prev => ({ ...prev, priceRange: { min, max } }))
                    }
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.priceRange?.min?.toFixed(2)} ETH</span>
                    <span>{filters.priceRange?.max?.toFixed(2)} ETH</span>
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <Slider
                    value={[filters.rating || 0]}
                    onValueChange={([rating]) => 
                      setFilters(prev => ({ ...prev, rating }))
                    }
                    max={10}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    {filters.rating?.toFixed(1) || '0.0'}+ stars
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialties</label>
                  <Select
                    value={filters.specialties?.[0] || ''}
                    onValueChange={(value) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        specialties: value ? [value] : [] 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any specialty</SelectItem>
                      {availableSpecialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, verified: !!checked }))
                    }
                  />
                  <label htmlFor="verified" className="text-sm">Verified hosts only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instant"
                    checked={filters.instantBooking}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, instantBooking: !!checked }))
                    }
                  />
                  <label htmlFor="instant" className="text-sm">Instant booking</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premium"
                    checked={filters.premiumOnly}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, premiumOnly: !!checked }))
                    }
                  />
                  <label htmlFor="premium" className="text-sm">Premium hosts only</label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filteredHosts.length} hosts found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHosts.map((host) => (
              <Card key={host.address} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Host Header */}
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={host.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.address}`}
                          alt={host.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {host.metadata.verified && (
                          <Verified className="absolute -top-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold truncate">{host.displayName}</h3>
                          {host.metadata.premiumHost && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{host.rating.toFixed(1)}</span>
                          <span>({host.ratingCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {host.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {host.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {host.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{host.specialties.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Pricing and Availability */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">{host.defaultPrice} ETH</span>
                          <span className="text-muted-foreground">
                            ({getPricingModelText(host.pricingModel)})
                          </span>
                        </div>
                        {host.metadata.instantBooking && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Instant
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatNextAvailable(host.availability.nextAvailable)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{host.timezone}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {host.availability.slotsThisWeek} slots this week • 
                        Responds in ~{host.responseTime}min
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-3">
                              <img
                                src={host.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.address}`}
                                alt={host.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span>{host.displayName}</span>
                                  {host.metadata.verified && (
                                    <Verified className="w-5 h-5 text-blue-500" />
                                  )}
                                  {host.metadata.premiumHost && (
                                    <Badge variant="secondary">Premium</Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{host.rating.toFixed(1)} ({host.ratingCount} reviews)</span>
                                </div>
                              </div>
                            </DialogTitle>
                            <DialogDescription>
                              {host.bio}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="availability">Availability</TabsTrigger>
                              <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Specialties</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {host.specialties.map((specialty) => (
                                      <Badge key={specialty} variant="outline">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Languages</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {host.languages.map((language) => (
                                      <Badge key={language} variant="outline">
                                        {language}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold">{host.totalMeetings}</div>
                                  <div className="text-sm text-muted-foreground">Total Meetings</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">{host.totalEarnings} ETH</div>
                                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">~{host.responseTime}min</div>
                                  <div className="text-sm text-muted-foreground">Response Time</div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="availability" className="space-y-4">
                              <div className="text-center py-8">
                                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-medium mb-2">Availability Calendar</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {host.availability.slotsThisWeek} slots available this week
                                </p>
                                <Button onClick={() => onBookMeeting(host, {})}>
                                  Book a Meeting
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="reviews" className="space-y-4">
                              <div className="text-center py-8">
                                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-medium mb-2">Reviews & Ratings</h3>
                                <p className="text-sm text-muted-foreground">
                                  {host.ratingCount} reviews with an average of {host.rating.toFixed(1)} stars
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onBookMeeting(host, {})}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredHosts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No hosts found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostMarketplace;

