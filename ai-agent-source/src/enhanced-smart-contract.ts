import { ethers } from 'ethers';

// Base mainnet configuration
const BASE_RPC_URL = 'https://mainnet.base.org';
// Note: This would be the address of the newly deployed enhanced contract
const CONTRACT_ADDRESS = '0x0871E02Ea98fd5E495201A76F651029cAfbAdCBC'; // Update this when enhanced contract is deployed

// Enhanced MeetingScheduler contract ABI
const ENHANCED_CONTRACT_ABI = [
  // Owner and platform functions
  "function owner() view returns (address)",
  "function platformFeePercentage() view returns (uint256)",
  "function updatePlatformFeePercentage(uint256 _newPercentage)",
  
  // Host registration and management
  "function registerAsHost(uint256 _defaultPrice, string _metadata)",
  "function updateHostMetadata(string _metadata)",
  "function setHostPrice(uint256 _price)",
  "function isHostRegistered(address _host) view returns (bool)",
  "function getHostInfo(address _host) view returns (bool isRegistered, uint256 defaultPrice, string metadata, uint256 availabilityCount)",
  
  // Availability management
  "function addAvailabilitySlot(uint256 _startTime, uint256 _endTime, uint256 _price)",
  "function updateAvailabilitySlot(uint256 _startTime, bool _isAvailable)",
  "function removeAvailabilitySlot(uint256 _startTime)",
  "function getHostAvailabilityCount(address _host) view returns (uint256)",
  "function getHostAvailabilitySlot(address _host, uint256 _index) view returns (uint256 startTime, uint256 endTime, bool isAvailable, uint256 price)",
  "function getAvailableSlots(address _host, uint256 _fromTime, uint256 _toTime) view returns (uint256[] startTimes, uint256[] endTimes, uint256[] prices)",
  "function isSlotAvailable(address _host, uint256 _startTime) view returns (bool)",
  
  // Meeting functions
  "function meetings(bytes32) view returns (address host, address requester, uint256 price, uint256 startTime, uint256 endTime, uint8 status, string metadataURI)",
  "function hostPrices(address) view returns (uint256)",
  "function scheduleMeeting(address _host, uint256 _startTime, uint256 _endTime, string _metadataURI) payable returns (bytes32)",
  "function confirmMeeting(bytes32 _meetingId)",
  "function completeMeeting(bytes32 _meetingId)",
  "function cancelMeeting(bytes32 _meetingId)",
  
  // Events
  "event MeetingScheduled(bytes32 indexed meetingId, address indexed host, address indexed requester, uint256 price, uint256 startTime, uint256 endTime)",
  "event MeetingConfirmed(bytes32 indexed meetingId)",
  "event FundsReleased(bytes32 indexed meetingId, uint256 amount)",
  "event MeetingCancelled(bytes32 indexed meetingId)",
  "event RefundIssued(bytes32 indexed meetingId, uint256 amount)",
  "event HostPriceUpdated(address indexed host, uint256 newPrice)",
  "event HostRegistered(address indexed host, string metadata)",
  "event AvailabilitySlotAdded(address indexed host, uint256 startTime, uint256 endTime, uint256 price)",
  "event AvailabilitySlotUpdated(address indexed host, uint256 startTime, uint256 endTime, bool isAvailable)",
  "event AvailabilitySlotRemoved(address indexed host, uint256 startTime)"
];

interface AvailabilitySlot {
  startTime: number;
  endTime: number;
  isAvailable: boolean;
  price: string; // in ETH
}

interface HostInfo {
  isRegistered: boolean;
  defaultPrice: string;
  metadata: string;
  availabilityCount: number;
}

class EnhancedSmartContractInterface {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet?: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ENHANCED_CONTRACT_ABI, this.provider);
  }

  // Initialize with a wallet for write operations
  initializeWallet(privateKey: string) {
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ENHANCED_CONTRACT_ABI, this.wallet);
  }

  // Host Registration Functions
  async registerAsHost(defaultPriceInEth: string, metadata: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(defaultPriceInEth);
      const tx = await this.contract.registerAsHost(priceInWei, metadata);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error registering as host:', error);
      throw error;
    }
  }

  async updateHostMetadata(metadata: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.updateHostMetadata(metadata);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating host metadata:', error);
      throw error;
    }
  }

  async setHostPrice(priceInEth: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(priceInEth);
      const tx = await this.contract.setHostPrice(priceInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error setting host price:', error);
      throw error;
    }
  }

  async isHostRegistered(hostAddress: string): Promise<boolean> {
    try {
      return await this.contract.isHostRegistered(hostAddress);
    } catch (error) {
      console.error('Error checking host registration:', error);
      throw error;
    }
  }

  async getHostInfo(hostAddress: string): Promise<HostInfo> {
    try {
      const result = await this.contract.getHostInfo(hostAddress);
      return {
        isRegistered: result.isRegistered,
        defaultPrice: ethers.formatEther(result.defaultPrice),
        metadata: result.metadata,
        availabilityCount: Number(result.availabilityCount)
      };
    } catch (error) {
      console.error('Error getting host info:', error);
      throw error;
    }
  }

  // Availability Management Functions
  async addAvailabilitySlot(
    startTime: number,
    endTime: number,
    priceInEth: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(priceInEth);
      const tx = await this.contract.addAvailabilitySlot(startTime, endTime, priceInWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error adding availability slot:', error);
      throw error;
    }
  }

  async updateAvailabilitySlot(startTime: number, isAvailable: boolean): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.updateAvailabilitySlot(startTime, isAvailable);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating availability slot:', error);
      throw error;
    }
  }

  async removeAvailabilitySlot(startTime: number): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.removeAvailabilitySlot(startTime);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error removing availability slot:', error);
      throw error;
    }
  }

  async getHostAvailabilityCount(hostAddress: string): Promise<number> {
    try {
      const count = await this.contract.getHostAvailabilityCount(hostAddress);
      return Number(count);
    } catch (error) {
      console.error('Error getting availability count:', error);
      throw error;
    }
  }

  async getHostAvailabilitySlot(hostAddress: string, index: number): Promise<AvailabilitySlot> {
    try {
      const result = await this.contract.getHostAvailabilitySlot(hostAddress, index);
      return {
        startTime: Number(result.startTime),
        endTime: Number(result.endTime),
        isAvailable: result.isAvailable,
        price: ethers.formatEther(result.price)
      };
    } catch (error) {
      console.error('Error getting availability slot:', error);
      throw error;
    }
  }

  async getAvailableSlots(
    hostAddress: string,
    fromTime: number,
    toTime: number
  ): Promise<AvailabilitySlot[]> {
    try {
      const result = await this.contract.getAvailableSlots(hostAddress, fromTime, toTime);
      const slots: AvailabilitySlot[] = [];
      
      for (let i = 0; i < result.startTimes.length; i++) {
        slots.push({
          startTime: Number(result.startTimes[i]),
          endTime: Number(result.endTimes[i]),
          isAvailable: true, // These are filtered to be available
          price: ethers.formatEther(result.prices[i])
        });
      }
      
      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  async isSlotAvailable(hostAddress: string, startTime: number): Promise<boolean> {
    try {
      return await this.contract.isSlotAvailable(hostAddress, startTime);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }

  // Enhanced Meeting Functions
  async scheduleMeeting(
    hostAddress: string,
    startTime: number,
    endTime: number,
    metadataURI: string,
    priceInEth: string
  ): Promise<{ meetingId: string; txHash: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(priceInEth);
      const tx = await this.contract.scheduleMeeting(
        hostAddress,
        startTime,
        endTime,
        metadataURI,
        { value: priceInWei }
      );
      
      const receipt = await tx.wait();
      
      // Extract meeting ID from event logs
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'MeetingScheduled';
        } catch {
          return false;
        }
      });

      let meetingId = '';
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        meetingId = parsed?.args[0] || '';
      }

      return {
        meetingId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw error;
    }
  }

  // Legacy functions for backward compatibility
  async getHostPrice(hostAddress: string): Promise<string> {
    try {
      const price = await this.contract.hostPrices(hostAddress);
      return ethers.formatEther(price);
    } catch (error) {
      console.error('Error getting host price:', error);
      throw error;
    }
  }

  async confirmMeeting(meetingId: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.confirmMeeting(meetingId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error confirming meeting:', error);
      throw error;
    }
  }

  async completeMeeting(meetingId: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.completeMeeting(meetingId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error completing meeting:', error);
      throw error;
    }
  }

  async cancelMeeting(meetingId: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const tx = await this.contract.cancelMeeting(meetingId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw error;
    }
  }

  async getMeeting(meetingId: string): Promise<{
    host: string;
    requester: string;
    price: string;
    startTime: number;
    endTime: number;
    status: number;
    metadataURI: string;
  }> {
    try {
      const meeting = await this.contract.meetings(meetingId);
      return {
        host: meeting.host,
        requester: meeting.requester,
        price: ethers.formatEther(meeting.price),
        startTime: Number(meeting.startTime),
        endTime: Number(meeting.endTime),
        status: Number(meeting.status),
        metadataURI: meeting.metadataURI
      };
    } catch (error) {
      console.error('Error getting meeting details:', error);
      throw error;
    }
  }

  async getPlatformFeePercentage(): Promise<number> {
    try {
      const fee = await this.contract.platformFeePercentage();
      return Number(fee);
    } catch (error) {
      console.error('Error getting platform fee:', error);
      throw error;
    }
  }

  async isOwner(address: string): Promise<boolean> {
    try {
      const owner = await this.contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  }
}

export default EnhancedSmartContractInterface;
export type { AvailabilitySlot, HostInfo };

