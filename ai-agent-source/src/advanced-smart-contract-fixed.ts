import { Contract, JsonRpcProvider, Wallet, parseEther, formatEther } from 'ethers';

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

class AdvancedSmartContractInterface {
  private contract: Contract | null = null;
  private wallet: Wallet | null = null;
  private provider: JsonRpcProvider;

  private contractAddress = '0x0871E02Ea98fd5E495201A76F651029cAfbAdCBC';

  private contractABI = [
    "function registerAsHost(string metadata, uint256 defaultPrice, uint8 pricingModel, uint256 minimumNotice, uint256 cancellationWindow) external",
    "function updateHostProfile(string metadata, uint256 defaultPrice, uint8 pricingModel, uint256 minimumNotice, uint256 cancellationWindow, bool isActive) external",
    "function addAvailabilitySlot(uint256 startTime, uint256 endTime, uint256 price, bool isRecurring, uint256 recurringInterval, string metadata) external returns (uint256)",
    "function updateAvailabilitySlot(uint256 slotId, uint256 price, bool isAvailable, string metadata) external",
    "function removeAvailabilitySlot(uint256 slotId) external",
    "function scheduleMeeting(address host, uint256 startTime, uint256 endTime, uint256 templateId, string notes) external payable",
    "function confirmMeeting(uint256 meetingId, string meetingLink) external",
    "function startMeeting(uint256 meetingId) external",
    "function completeMeeting(uint256 meetingId) external",
    "function cancelMeeting(uint256 meetingId, string reason) external",
    "function raiseDispute(uint256 meetingId, uint8 reason, string description) external",
    "function resolveDispute(uint256 disputeId, uint256 refundPercentage, string resolution) external",
    "function rateMeeting(uint256 meetingId, uint256 rating, string comment) external",
    "function createMeetingTemplate(string title, string description, uint256 duration, uint256 price, uint8 pricingModel) external returns (uint256)",
    "function releasePayment(uint256 meetingId) external",
    "function getHostInfo(address hostAddress) external view returns (bool, string, uint256, uint8, uint256, uint256, uint256, uint256, bool)",
    "function getAvailableSlots(address hostAddress, uint256 fromTime, uint256 toTime) external view returns (uint256[], uint256[], uint256[], uint256[])",
    "function getMeetingDetails(uint256 meetingId) external view returns (address, address, uint256, uint256, uint256, uint8, string, string)",
    "function getHostMeetings(address hostAddress) external view returns (uint256[])",
    "function getRequesterMeetings(address requesterAddress) external view returns (uint256[])",
    "function getHostTemplates(address hostAddress) external view returns (uint256[])",
    "function getRatings(address user, address rater) external view returns (tuple(uint256 score, string comment, uint256 timestamp, address rater)[])",
    "event HostRegistered(address indexed host, string metadata)",
    "event MeetingScheduled(uint256 indexed meetingId, address indexed host, address indexed requester, uint256 startTime)",
    "event MeetingConfirmed(uint256 indexed meetingId, address indexed host)",
    "event MeetingCompleted(uint256 indexed meetingId, uint256 completedAt)",
    "event DisputeRaised(uint256 indexed disputeId, uint256 indexed meetingId, address indexed initiator, uint8 reason)",
    "event RatingSubmitted(address indexed host, address indexed requester, uint256 meetingId, uint256 rating)",
    "event PaymentReleased(uint256 indexed meetingId, address indexed host, uint256 amount)"
  ];

  constructor() {
    this.provider = new JsonRpcProvider('https://mainnet.base.org');
  }

  initializeWallet(privateKey: string): void {
    this.wallet = new Wallet(privateKey, this.provider);
    this.contract = new Contract(this.contractAddress, this.contractABI, this.wallet);
  }

  private ensureInitialized(): void {
    if (!this.contract || !this.wallet) {
      throw new Error('Smart contract interface not initialized. Call initializeWallet() first.');
    }
  }

  async registerAsAdvancedHost(
    metadata: string,
    defaultPrice: string,
    pricingModel: PricingModel = PricingModel.Fixed,
    minimumNoticeHours: number = 24,
    cancellationWindowHours: number = 24
  ): Promise<string> {
    this.ensureInitialized();

    const priceWei = parseEther(defaultPrice);
    const notice = minimumNoticeHours * 3600;
    const cancelWindow = cancellationWindowHours * 3600;

    const tx = await this.contract!.registerAsHost(metadata, priceWei, pricingModel, notice, cancelWindow);
    await tx.wait();
    return tx.hash;
  }

  async getAdvancedHostInfo(hostAddress: string) {
    this.ensureInitialized();

    const result = await this.contract!.getHostInfo(hostAddress);
    return {
      isRegistered: result[0],
      metadata: result[1],
      defaultPrice: formatEther(result[2]),
      pricingModel: result[3],
      totalEarnings: formatEther(result[4]),
      totalMeetings: Number(result[5]),
      rating: Number(result[6]) / 10,
      ratingCount: Number(result[7]),
      isActive: result[8]
    };
  }

  async getAvailableSlots(hostAddress: string, from: Date, to: Date) {
    this.ensureInitialized();

    const fromTime = Math.floor(from.getTime() / 1000);
    const toTime = Math.floor(to.getTime() / 1000);

    const res = await this.contract!.getAvailableSlots(hostAddress, fromTime, toTime);
    const slots = [];

    for (let i = 0; i < res[0].length; i++) {
      slots.push({
        slotId: res[0][i].toString(),
        startTime: new Date(Number(res[1][i]) * 1000),
        endTime: new Date(Number(res[2][i]) * 1000),
        price: formatEther(res[3][i])
      });
    }

    return slots;
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

    const tx = await this.contract!.scheduleMeeting(
      hostAddress,
      Math.floor(startTime.getTime() / 1000),
      Math.floor(endTime.getTime() / 1000),
      templateId,
      notes,
      { value: parseEther(paymentAmount) }
    );
    const receipt = await tx.wait();

    const event = receipt.logs.find((log: any) => log.fragment?.name === 'MeetingScheduled');
    const meetingId = event?.args?.meetingId?.toString() || '';

    return { txHash: tx.hash, meetingId };
  }

  async addAvailabilitySlot(
    startTime: Date,
    endTime: Date,
    price: string,
    isRecurring = false,
    recurringIntervalDays = 0,
    metadata = ''
  ): Promise<{ txHash: string; slotId: string }> {
    this.ensureInitialized();

    const tx = await this.contract!.addAvailabilitySlot(
      Math.floor(startTime.getTime() / 1000),
      Math.floor(endTime.getTime() / 1000),
      parseEther(price),
      isRecurring,
      recurringIntervalDays * 86400,
      metadata
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'AvailabilitySlotAdded');
    const slotId = event?.args?.slotId?.toString() || '';

    return { txHash: tx.hash, slotId };
  }

  async updateAvailabilitySlot(slotId: string, price: string, isAvailable: boolean, metadata = ''): Promise<string> {
    this.ensureInitialized();

    const tx = await this.contract!.updateAvailabilitySlot(slotId, parseEther(price), isAvailable, metadata);
    await tx.wait();
    return tx.hash;
  }

  async removeAvailabilitySlot(slotId: string): Promise<string> {
    this.ensureInitialized();

    const tx = await this.contract!.removeAvailabilitySlot(slotId);
    await tx.wait();
    return tx.hash;
  }

  async getHostMeetings(hostAddress: string): Promise<string[]> {
    this.ensureInitialized();
    const meetings = await this.contract!.getHostMeetings(hostAddress);
    return meetings.map((m: any) => m.toString());
  }

  async getHostTemplates(hostAddress: string): Promise<string[]> {
    this.ensureInitialized();
    const templates = await this.contract!.getHostTemplates(hostAddress);
    return templates.map((id: any) => id.toString());
  }

  async createMeetingTemplate(
    title: string,
    description: string,
    durationMinutes: number,
    price: string,
    pricingModel: PricingModel = PricingModel.Fixed
  ): Promise<{ txHash: string; templateId: string }> {
    this.ensureInitialized();

    const tx = await this.contract!.createMeetingTemplate(
      title,
      description,
      durationMinutes * 60,
      parseEther(price),
      pricingModel
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'TemplateCreated');
    const templateId = event?.args?.templateId?.toString() || '';

    return { txHash: tx.hash, templateId };
  }

  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export default AdvancedSmartContractInterface;
