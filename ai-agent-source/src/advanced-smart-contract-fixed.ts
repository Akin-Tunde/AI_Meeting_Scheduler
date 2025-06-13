import { ethers } from 'ethers';

// Enums for contract interaction
export enum PricingModel {
  Fixed = 0,
  Hourly = 1,
  Dynamic = 2,
  Subscription = 3
}

export enum DisputeReason {
  NoShow = 0,
  LateStart = 1,
  EarlyEnd = 2,
  QualityIssue = 3,
  TechnicalIssue = 4,
  Other = 5
}

export enum MeetingStatus {
  Pending = 0,
  Confirmed = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  Disputed = 5,
  Resolved = 6
}

// Advanced Smart Contract Interface with full feature utilization
class AdvancedSmartContractInterface {
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.providers.JsonRpcProvider;
  
  // Contract address on Base mainnet (would be updated after deployment)
  private contractAddress = '0x0871E02Ea98fd5E495201A76F651029cAfbAdCBC';
  
  // Advanced contract ABI with all features
  private contractABI = [
    // Host Management
    "function registerAsHost(string metadata, uint256 defaultPrice, uint8 pricingModel, uint256 minimumNotice, uint256 cancellationWindow) external",
    "function updateHostProfile(string metadata, uint256 defaultPrice, uint8 pricingModel, uint256 minimumNotice, uint256 cancellationWindow, bool isActive) external",
    
    // Availability Management
    "function addAvailabilitySlot(uint256 startTime, uint256 endTime, uint256 price, bool isRecurring, uint256 recurringInterval, string metadata) external returns (uint256)",
    "function updateAvailabilitySlot(uint256 slotId, uint256 price, bool isAvailable, string metadata) external",
    "function removeAvailabilitySlot(uint256 slotId) external",
    
    // Meeting Scheduling
    "function scheduleMeeting(address host, uint256 startTime, uint256 endTime, uint256 templateId, string notes) external payable",
    "function confirmMeeting(uint256 meetingId, string meetingLink) external",
    "function startMeeting(uint256 meetingId) external",
    "function completeMeeting(uint256 meetingId) external",
    "function cancelMeeting(uint256 meetingId, string reason) external",
    
    // Dispute Resolution
    "function raiseDispute(uint256 meetingId, uint8 reason, string description) external",
    "function resolveDispute(uint256 disputeId, uint256 refundPercentage, string resolution) external",
    
    // Rating System
    "function rateMeeting(uint256 meetingId, uint256 rating, string comment) external",
    
    // Meeting Templates
    "function createMeetingTemplate(string title, string description, uint256 duration, uint256 price, uint8 pricingModel) external returns (uint256)",
    
    // Payment Management
    "function releasePayment(uint256 meetingId) external",
    
    // View Functions
    "function getHostInfo(address hostAddress) external view returns (bool, string, uint256, uint8, uint256, uint256, uint256, uint256, bool)",
    "function getAvailableSlots(address hostAddress, uint256 fromTime, uint256 toTime) external view returns (uint256[], uint256[], uint256[], uint256[])",
    "function getMeetingDetails(uint256 meetingId) external view returns (address, address, uint256, uint256, uint256, uint8, string, string)",
    "function getHostMeetings(address hostAddress) external view returns (uint256[])",
    "function getRequesterMeetings(address requesterAddress) external view returns (uint256[])",
    "function getHostTemplates(address hostAddress) external view returns (uint256[])",
    "function getRatings(address user, address rater) external view returns (tuple(uint256 score, string comment, uint256 timestamp, address rater)[])",
    
    // Events
    "event HostRegistered(address indexed host, string metadata)",
    "event MeetingScheduled(uint256 indexed meetingId, address indexed host, address indexed requester, uint256 startTime)",
    "event MeetingConfirmed(uint256 indexed meetingId, address indexed host)",
    "event MeetingCompleted(uint256 indexed meetingId, uint256 completedAt)",
    "event DisputeRaised(uint256 indexed disputeId, uint256 indexed meetingId, address indexed initiator, uint8 reason)",
    "event RatingSubmitted(address indexed host, address indexed requester, uint256 meetingId, uint256 rating)",
    "event PaymentReleased(uint256 indexed meetingId, address indexed host, uint256 amount)"
  ];

  constructor() {
    // Initialize provider for Base mainnet
    this.provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
  }

  initializeWallet(privateKey: string): void {
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
  }

  private ensureInitialized(): void {
    if (!this.contract || !this.wallet) {
      throw new Error('Smart contract interface not initialized. Call initializeWallet() first.');
    }
  }

  // Advanced Host Management
  async registerAsAdvancedHost(
    metadata: string,
    defaultPrice: string,
    pricingModel: PricingModel = PricingModel.Fixed,
    minimumNoticeHours: number = 24,
    cancellationWindowHours: number = 24
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      const priceWei = ethers.parseEther(defaultPrice);
      const minimumNoticeSeconds = minimumNoticeHours * 3600;
      const cancellationWindowSeconds = cancellationWindowHours * 3600;
      
      const tx = await this.contract!.registerAsHost(
        metadata,
        priceWei,
        pricingModel,
        minimumNoticeSeconds,
        cancellationWindowSeconds
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error registering as advanced host:', error);
      throw error;
    }
  }

  async getAdvancedHostInfo(hostAddress: string): Promise<{
    isRegistered: boolean;
    metadata: string;
    defaultPrice: string;
    pricingModel: PricingModel;
    totalEarnings: string;
    totalMeetings: number;
    rating: number;
    ratingCount: number;
    isActive: boolean;
  }> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getHostInfo(hostAddress);
      
      return {
        isRegistered: result[0],
        metadata: result[1],
        defaultPrice: ethers.formatEther(result[2]),
        pricingModel: result[3],
        totalEarnings: ethers.formatEther(result[4]),
        totalMeetings: result[5].toNumber(),
        rating: result[6].toNumber() / 10, // Convert from 1000 scale to 100 scale
        ratingCount: result[7].toNumber(),
        isActive: result[8]
      };
    } catch (error) {
      console.error('Error getting advanced host info:', error);
      throw error;
    }
  }

  async getAvailableSlots(
    hostAddress: string,
    fromTime: Date,
    toTime: Date
  ): Promise<Array<{
    slotId: string;
    startTime: Date;
    endTime: Date;
    price: string;
  }>> {
    this.ensureInitialized();
    
    try {
      const fromTimestamp = Math.floor(fromTime.getTime() / 1000);
      const toTimestamp = Math.floor(toTime.getTime() / 1000);
      
      const result = await this.contract!.getAvailableSlots(hostAddress, fromTimestamp, toTimestamp);
      
      const slots = [];
      for (let i = 0; i < result[0].length; i++) {
        slots.push({
          slotId: result[0][i].toString(),
          startTime: new Date(result[1][i].toNumber() * 1000),
          endTime: new Date(result[2][i].toNumber() * 1000),
          price: ethers.formatEther(result[3][i])
        });
      }
      
      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  async scheduleMeetingAdvanced(
    hostAddress: string,
    startTime: Date,
    endTime: Date,
    paymentAmount: string,
    templateId: string = '0',
    notes: string = ''
  ): Promise<{ txHash: string; meetingId: string }> {
    this.ensureInitialized();
    
    try {
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);
      const paymentWei = ethers.parseEther(paymentAmount);
      
      const tx = await this.contract!.scheduleMeeting(
        hostAddress,
        startTimestamp,
        endTimestamp,
        templateId,
        notes,
        { value: paymentWei }
      );
      
      const receipt = await tx.wait();
      
      // Extract meeting ID from events
      const event = receipt.events?.find((e: any) => e.event === 'MeetingScheduled');
      const meetingId = event?.args?.meetingId?.toString() || '';
      
      return { txHash: tx.hash, meetingId };
    } catch (error) {
      console.error('Error scheduling advanced meeting:', error);
      throw error;
    }
  }

  async addAvailabilitySlot(
    startTime: Date,
    endTime: Date,
    price: string,
    isRecurring: boolean = false,
    recurringIntervalDays: number = 0,
    metadata: string = ''
  ): Promise<{ txHash: string; slotId: string }> {
    this.ensureInitialized();
    
    try {
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);
      const priceWei = ethers.parseEther(price);
      const recurringInterval = recurringIntervalDays * 24 * 3600;
      
      const tx = await this.contract!.addAvailabilitySlot(
        startTimestamp,
        endTimestamp,
        priceWei,
        isRecurring,
        recurringInterval,
        metadata
      );
      
      const receipt = await tx.wait();
      
      // Extract slot ID from events
      const event = receipt.events?.find((e: any) => e.event === 'AvailabilitySlotAdded');
      const slotId = event?.args?.slotId?.toString() || '';
      
      return { txHash: tx.hash, slotId };
    } catch (error) {
      console.error('Error adding availability slot:', error);
      throw error;
    }
  }

  async updateAvailabilitySlot(
    slotId: string,
    price: string,
    isAvailable: boolean,
    metadata: string = ''
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      const priceWei = ethers.parseEther(price);
      
      const tx = await this.contract!.updateAvailabilitySlot(
        slotId,
        priceWei,
        isAvailable,
        metadata
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating availability slot:', error);
      throw error;
    }
  }

  async removeAvailabilitySlot(slotId: string): Promise<string> {
    this.ensureInitialized();
    
    try {
      const tx = await this.contract!.removeAvailabilitySlot(slotId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error removing availability slot:', error);
      throw error;
    }
  }

  async getHostMeetings(hostAddress: string): Promise<string[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getHostMeetings(hostAddress);
      return result.map((id: any) => id.toString());
    } catch (error) {
      console.error('Error getting host meetings:', error);
      throw error;
    }
  }

  async getHostTemplates(hostAddress: string): Promise<string[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getHostTemplates(hostAddress);
      return result.map((id: any) => id.toString());
    } catch (error) {
      console.error('Error getting host templates:', error);
      throw error;
    }
  }

  async createMeetingTemplate(
    title: string,
    description: string,
    durationMinutes: number,
    price: string,
    pricingModel: PricingModel = PricingModel.Fixed
  ): Promise<{ txHash: string; templateId: string }> {
    this.ensureInitialized();
    
    try {
      const durationSeconds = durationMinutes * 60;
      const priceWei = ethers.parseEther(price);
      
      const tx = await this.contract!.createMeetingTemplate(
        title,
        description,
        durationSeconds,
        priceWei,
        pricingModel
      );
      
      const receipt = await tx.wait();
      
      // Extract template ID from events
      const event = receipt.events?.find((e: any) => e.event === 'TemplateCreated');
      const templateId = event?.args?.templateId?.toString() || '';
      
      return { txHash: tx.hash, templateId };
    } catch (error) {
      console.error('Error creating meeting template:', error);
      throw error;
    }
  }

  // Cleanup
  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export default AdvancedSmartContractInterface;

