"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// Base mainnet configuration
const BASE_RPC_URL = 'https://mainnet.base.org';
const CONTRACT_ADDRESS = '0x0871E02Ea98fd5E495201A76F651029cAfbAdCBC';
// MeetingScheduler contract ABI (based on the provided contract)
const CONTRACT_ABI = [
    "function owner() view returns (address)",
    "function platformFeePercentage() view returns (uint256)",
    "function meetings(bytes32) view returns (address host, address requester, uint256 price, uint256 startTime, uint256 endTime, uint8 status, string metadataURI)",
    "function hostPrices(address) view returns (uint256)",
    "function setHostPrice(uint256 _price)",
    "function scheduleMeeting(address _host, uint256 _startTime, uint256 _endTime, string _metadataURI) payable returns (bytes32)",
    "function confirmMeeting(bytes32 _meetingId)",
    "function completeMeeting(bytes32 _meetingId)",
    "function cancelMeeting(bytes32 _meetingId)",
    "function updatePlatformFeePercentage(uint256 _newPercentage)",
    "event MeetingScheduled(bytes32 indexed meetingId, address indexed host, address indexed requester, uint256 price, uint256 startTime, uint256 endTime)",
    "event MeetingConfirmed(bytes32 indexed meetingId)",
    "event FundsReleased(bytes32 indexed meetingId, uint256 amount)",
    "event MeetingCancelled(bytes32 indexed meetingId)",
    "event RefundIssued(bytes32 indexed meetingId, uint256 amount)",
    "event HostPriceUpdated(address indexed host, uint256 newPrice)"
];
class SmartContractInterface {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(BASE_RPC_URL);
        this.contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
    }
    // Initialize with a wallet for write operations
    initializeWallet(privateKey) {
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    }
    // Get host price
    async getHostPrice(hostAddress) {
        try {
            const price = await this.contract.hostPrices(hostAddress);
            return ethers_1.ethers.formatEther(price);
        }
        catch (error) {
            console.error('Error getting host price:', error);
            throw error;
        }
    }
    // Set host price (requires wallet)
    async setHostPrice(priceInEth) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        try {
            const priceInWei = ethers_1.ethers.parseEther(priceInEth);
            const tx = await this.contract.setHostPrice(priceInWei);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error setting host price:', error);
            throw error;
        }
    }
    // Schedule a meeting
    async scheduleMeeting(hostAddress, startTime, endTime, metadataURI, priceInEth) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        try {
            const priceInWei = ethers_1.ethers.parseEther(priceInEth);
            const tx = await this.contract.scheduleMeeting(hostAddress, startTime, endTime, metadataURI, { value: priceInWei });
            const receipt = await tx.wait();
            // Extract meeting ID from event logs
            const event = receipt.logs.find((log) => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed?.name === 'MeetingScheduled';
                }
                catch {
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
        }
        catch (error) {
            console.error('Error scheduling meeting:', error);
            throw error;
        }
    }
    // Confirm a meeting (host only)
    async confirmMeeting(meetingId) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        try {
            const tx = await this.contract.confirmMeeting(meetingId);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error confirming meeting:', error);
            throw error;
        }
    }
    // Complete a meeting (host only)
    async completeMeeting(meetingId) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        try {
            const tx = await this.contract.completeMeeting(meetingId);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error completing meeting:', error);
            throw error;
        }
    }
    // Cancel a meeting
    async cancelMeeting(meetingId) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        try {
            const tx = await this.contract.cancelMeeting(meetingId);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error cancelling meeting:', error);
            throw error;
        }
    }
    // Get meeting details
    async getMeeting(meetingId) {
        try {
            const meeting = await this.contract.meetings(meetingId);
            return {
                host: meeting.host,
                requester: meeting.requester,
                price: ethers_1.ethers.formatEther(meeting.price),
                startTime: Number(meeting.startTime),
                endTime: Number(meeting.endTime),
                status: Number(meeting.status),
                metadataURI: meeting.metadataURI
            };
        }
        catch (error) {
            console.error('Error getting meeting details:', error);
            throw error;
        }
    }
    // Get platform fee percentage
    async getPlatformFeePercentage() {
        try {
            const fee = await this.contract.platformFeePercentage();
            return Number(fee);
        }
        catch (error) {
            console.error('Error getting platform fee:', error);
            throw error;
        }
    }
    // Check if address is contract owner
    async isOwner(address) {
        try {
            const owner = await this.contract.owner();
            return owner.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            console.error('Error checking owner:', error);
            return false;
        }
    }
}
exports.default = SmartContractInterface;
