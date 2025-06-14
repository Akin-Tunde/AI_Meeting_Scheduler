"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HostAvailabilityManager {
    constructor(smartContract, hostAddress) {
        this.smartContract = smartContract;
        this.hostAddress = hostAddress;
    }
    // Get available time slots for a specific date range
    async getAvailableSlots(fromDate, toDate) {
        try {
            // Convert date strings to timestamps
            const fromTime = fromDate ? Math.floor(new Date(fromDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
            const toTime = toDate ? Math.floor(new Date(toDate).getTime() / 1000) : fromTime + (7 * 24 * 60 * 60); // Default to 7 days
            const slots = await this.smartContract.getAvailableSlots(this.hostAddress, fromTime, toTime);
            // Format slots for display
            const formattedSlots = [];
            for (const slot of slots) {
                const startDate = new Date(slot.startTime * 1000);
                const endDate = new Date(slot.endTime * 1000);
                const formattedSlot = `${this.formatDateTime(startDate)} - ${this.formatDateTime(endDate)} (${slot.price} ETH)`;
                formattedSlots.push(formattedSlot);
            }
            return formattedSlots;
        }
        catch (error) {
            console.error('Error getting available slots:', error);
            // Fallback to empty array if contract call fails
            return [];
        }
    }
    // Get available slots for a specific date (natural language processing)
    async getAvailabilityForDate(dateQuery) {
        try {
            let targetDate;
            if (!dateQuery) {
                targetDate = new Date();
            }
            else {
                // Parse natural language date queries
                targetDate = this.parseNaturalLanguageDate(dateQuery);
            }
            // Get slots for the entire day
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);
            return await this.getAvailableSlots(startOfDay.toISOString(), endOfDay.toISOString());
        }
        catch (error) {
            console.error('Error getting availability for date:', error);
            return [];
        }
    }
    // Add a new availability slot
    async addAvailabilitySlot(startTime, endTime, priceInEth) {
        try {
            const startTimestamp = Math.floor(startTime.getTime() / 1000);
            const endTimestamp = Math.floor(endTime.getTime() / 1000);
            return await this.smartContract.addAvailabilitySlot(startTimestamp, endTimestamp, priceInEth);
        }
        catch (error) {
            console.error('Error adding availability slot:', error);
            throw error;
        }
    }
    // Update availability slot status
    async updateSlotAvailability(startTime, isAvailable) {
        try {
            const startTimestamp = Math.floor(startTime.getTime() / 1000);
            return await this.smartContract.updateAvailabilitySlot(startTimestamp, isAvailable);
        }
        catch (error) {
            console.error('Error updating slot availability:', error);
            throw error;
        }
    }
    // Remove an availability slot
    async removeAvailabilitySlot(startTime) {
        try {
            const startTimestamp = Math.floor(startTime.getTime() / 1000);
            return await this.smartContract.removeAvailabilitySlot(startTimestamp);
        }
        catch (error) {
            console.error('Error removing availability slot:', error);
            throw error;
        }
    }
    // Check if a specific slot is available
    async isSlotAvailable(startTime) {
        try {
            const startTimestamp = Math.floor(startTime.getTime() / 1000);
            return await this.smartContract.isSlotAvailable(this.hostAddress, startTimestamp);
        }
        catch (error) {
            console.error('Error checking slot availability:', error);
            return false;
        }
    }
    // Get all availability slots for the host
    async getAllAvailabilitySlots() {
        try {
            const count = await this.smartContract.getHostAvailabilityCount(this.hostAddress);
            const slots = [];
            for (let i = 0; i < count; i++) {
                const slot = await this.smartContract.getHostAvailabilitySlot(this.hostAddress, i);
                slots.push(slot);
            }
            return slots;
        }
        catch (error) {
            console.error('Error getting all availability slots:', error);
            return [];
        }
    }
    // Helper function to parse natural language dates
    parseNaturalLanguageDate(dateQuery) {
        const query = dateQuery.toLowerCase().trim();
        const today = new Date();
        // Handle common date expressions
        if (query.includes('today')) {
            return today;
        }
        if (query.includes('tomorrow')) {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return tomorrow;
        }
        if (query.includes('monday')) {
            return this.getNextWeekday(1); // Monday = 1
        }
        if (query.includes('tuesday')) {
            return this.getNextWeekday(2);
        }
        if (query.includes('wednesday')) {
            return this.getNextWeekday(3);
        }
        if (query.includes('thursday')) {
            return this.getNextWeekday(4);
        }
        if (query.includes('friday')) {
            return this.getNextWeekday(5);
        }
        if (query.includes('saturday')) {
            return this.getNextWeekday(6);
        }
        if (query.includes('sunday')) {
            return this.getNextWeekday(0); // Sunday = 0
        }
        if (query.includes('next week')) {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            return nextWeek;
        }
        // Try to parse as a standard date
        try {
            const parsedDate = new Date(dateQuery);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }
        catch (error) {
            // Ignore parsing errors
        }
        // Default to today if parsing fails
        return today;
    }
    // Helper function to get the next occurrence of a specific weekday
    getNextWeekday(targetDay) {
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) {
            daysUntilTarget += 7; // Next week
        }
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilTarget);
        return targetDate;
    }
    // Helper function to format date and time for display
    formatDateTime(date) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        return date.toLocaleDateString('en-US', options);
    }
    // Helper function to format time only
    formatTime(date) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        };
        return date.toLocaleTimeString('en-US', options);
    }
    // Generate default availability slots (for initial setup)
    async generateDefaultAvailability(priceInEth = "0.01") {
        const txHashes = [];
        const today = new Date();
        try {
            // Generate availability for the next 30 days, weekdays only, 9 AM to 5 PM
            for (let day = 1; day <= 30; day++) {
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() + day);
                // Skip weekends
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    continue;
                }
                // Create 1-hour slots from 9 AM to 5 PM
                for (let hour = 9; hour < 17; hour++) {
                    const startTime = new Date(currentDate);
                    startTime.setHours(hour, 0, 0, 0);
                    const endTime = new Date(currentDate);
                    endTime.setHours(hour + 1, 0, 0, 0);
                    try {
                        const txHash = await this.addAvailabilitySlot(startTime, endTime, priceInEth);
                        txHashes.push(txHash);
                    }
                    catch (error) {
                        console.error(`Error adding slot for ${startTime}:`, error);
                        // Continue with other slots even if one fails
                    }
                }
            }
        }
        catch (error) {
            console.error('Error generating default availability:', error);
        }
        return txHashes;
    }
}
exports.default = HostAvailabilityManager;
