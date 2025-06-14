"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdvancedHostAvailabilityManager {
    constructor(smartContract, hostAddress) {
        this.availabilityCache = new Map();
        this.templatesCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheValidityPeriod = 5 * 60 * 1000; // 5 minutes
        this.smartContract = smartContract;
        this.hostAddress = hostAddress;
    }
    // Advanced Availability Management
    async addAvailabilitySlot(startTime, endTime, price, isRecurring = false, recurringIntervalDays = 0, metadata = '') {
        try {
            const result = await this.smartContract.addAvailabilitySlot(startTime, endTime, price, isRecurring, recurringIntervalDays, metadata);
            // Update cache
            const slot = {
                slotId: result.slotId,
                startTime,
                endTime,
                price,
                isRecurring,
                metadata
            };
            this.availabilityCache.set(result.slotId, slot);
            return result.slotId;
        }
        catch (error) {
            console.error('Error adding availability slot:', error);
            throw error;
        }
    }
    async updateAvailabilitySlot(slotId, price, isAvailable, metadata = '') {
        try {
            await this.smartContract.updateAvailabilitySlot(slotId, price, isAvailable, metadata);
            // Update cache
            const cachedSlot = this.availabilityCache.get(slotId);
            if (cachedSlot) {
                cachedSlot.price = price;
                cachedSlot.metadata = metadata;
                this.availabilityCache.set(slotId, cachedSlot);
            }
        }
        catch (error) {
            console.error('Error updating availability slot:', error);
            throw error;
        }
    }
    async removeAvailabilitySlot(slotId) {
        try {
            await this.smartContract.removeAvailabilitySlot(slotId);
            this.availabilityCache.delete(slotId);
        }
        catch (error) {
            console.error('Error removing availability slot:', error);
            throw error;
        }
    }
    // Enhanced availability querying with natural language support
    async getAvailabilityForDate(dateQuery) {
        try {
            const { fromTime, toTime } = this.parseDateQuery(dateQuery);
            const slots = await this.getAvailableSlots(fromTime, toTime);
            return slots.map(slot => this.formatSlotForDisplay(slot));
        }
        catch (error) {
            console.error('Error getting availability for date:', error);
            return [];
        }
    }
    async getAvailableSlots(fromTime, toTime) {
        try {
            // Check cache validity
            if (this.shouldRefreshCache()) {
                await this.refreshAvailabilityCache(fromTime, toTime);
            }
            // Filter cached slots by time range
            const availableSlots = [];
            for (const slot of this.availabilityCache.values()) {
                if (slot.startTime >= fromTime && slot.endTime <= toTime) {
                    availableSlots.push(slot);
                }
            }
            return availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        }
        catch (error) {
            console.error('Error getting available slots:', error);
            return [];
        }
    }
    // Meeting Templates Management
    async createMeetingTemplate(title, description, durationMinutes, price, pricingModel = 0 // Fixed pricing by default
    ) {
        try {
            const result = await this.smartContract.createMeetingTemplate(title, description, durationMinutes, price, pricingModel);
            // Update templates cache
            const template = {
                templateId: result.templateId,
                title,
                description,
                duration: durationMinutes * 60, // Convert to seconds
                price,
                pricingModel
            };
            this.templatesCache.set(result.templateId, template);
            return result.templateId;
        }
        catch (error) {
            console.error('Error creating meeting template:', error);
            throw error;
        }
    }
    async getHostTemplates() {
        try {
            const templateIds = await this.smartContract.getHostTemplates(this.hostAddress);
            const templates = [];
            for (const templateId of templateIds) {
                let template = this.templatesCache.get(templateId);
                if (!template) {
                    // Template not in cache, would need to fetch from contract
                    // For now, create a placeholder
                    template = {
                        templateId,
                        title: 'Template ' + templateId,
                        description: 'Meeting template',
                        duration: 3600, // 1 hour default
                        price: '0.01',
                        pricingModel: 0
                    };
                    this.templatesCache.set(templateId, template);
                }
                templates.push(template);
            }
            return templates;
        }
        catch (error) {
            console.error('Error getting host templates:', error);
            return [];
        }
    }
    // Advanced scheduling with templates
    async scheduleFromTemplate(templateId, startTime, requesterAddress, notes = '') {
        try {
            const template = this.templatesCache.get(templateId);
            if (!template) {
                throw new Error('Template not found');
            }
            const endTime = new Date(startTime.getTime() + template.duration * 1000);
            const result = await this.smartContract.scheduleMeetingAdvanced(this.hostAddress, startTime, endTime, template.price, templateId, notes);
            return result;
        }
        catch (error) {
            console.error('Error scheduling from template:', error);
            throw error;
        }
    }
    // Bulk availability management
    async addRecurringAvailability(startTime, endTime, price, recurringDays, // Days of week (0-6, 0=Sunday)
    weeksCount, metadata = '') {
        const slotIds = [];
        try {
            for (let week = 0; week < weeksCount; week++) {
                for (const dayOfWeek of recurringDays) {
                    const slotStart = new Date(startTime);
                    slotStart.setDate(slotStart.getDate() + (week * 7) + (dayOfWeek - slotStart.getDay()));
                    const slotEnd = new Date(endTime);
                    slotEnd.setDate(slotEnd.getDate() + (week * 7) + (dayOfWeek - slotEnd.getDay()));
                    // Only add future slots
                    if (slotStart > new Date()) {
                        const slotId = await this.addAvailabilitySlot(slotStart, slotEnd, price, false, // Individual slots, not recurring
                        0, `${metadata} - Week ${week + 1}, ${this.getDayName(dayOfWeek)}`);
                        slotIds.push(slotId);
                    }
                }
            }
            return slotIds;
        }
        catch (error) {
            console.error('Error adding recurring availability:', error);
            throw error;
        }
    }
    async addBusinessHoursAvailability(startDate, endDate, dailyStartHour, dailyEndHour, price, workingDays = [1, 2, 3, 4, 5], // Monday to Friday
    slotDurationMinutes = 60) {
        const slotIds = [];
        try {
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                if (workingDays.includes(currentDate.getDay())) {
                    // Add slots for this working day
                    for (let hour = dailyStartHour; hour < dailyEndHour; hour += slotDurationMinutes / 60) {
                        const slotStart = new Date(currentDate);
                        slotStart.setHours(hour, 0, 0, 0);
                        const slotEnd = new Date(slotStart);
                        slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMinutes);
                        // Only add future slots
                        if (slotStart > new Date()) {
                            const slotId = await this.addAvailabilitySlot(slotStart, slotEnd, price, false, 0, `Business hours - ${this.formatTimeSlot(slotStart, slotEnd)}`);
                            slotIds.push(slotId);
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return slotIds;
        }
        catch (error) {
            console.error('Error adding business hours availability:', error);
            throw error;
        }
    }
    // Advanced availability analytics
    async getAvailabilityAnalytics(fromDate, toDate) {
        try {
            const slots = await this.getAvailableSlots(fromDate, toDate);
            const hostMeetings = await this.smartContract.getHostMeetings(this.hostAddress);
            // Calculate analytics
            const totalSlots = slots.length;
            const bookedSlots = hostMeetings.length; // Simplified - would need to filter by date range
            const availableSlots = totalSlots - bookedSlots;
            let totalPotentialEarnings = 0;
            const hourCounts = {};
            const dayCounts = {};
            for (const slot of slots) {
                totalPotentialEarnings += parseFloat(slot.price);
                const hour = slot.startTime.getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                const dayName = this.getDayName(slot.startTime.getDay());
                dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
            }
            const averageSlotPrice = totalSlots > 0 ? (totalPotentialEarnings / totalSlots).toFixed(4) : '0';
            const peakHours = Object.entries(hourCounts)
                .map(([hour, count]) => ({ hour: parseInt(hour), count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            const peakDays = Object.entries(dayCounts)
                .map(([day, count]) => ({ day, count }))
                .sort((a, b) => b.count - a.count);
            return {
                totalSlots,
                bookedSlots,
                availableSlots,
                totalPotentialEarnings: totalPotentialEarnings.toFixed(4),
                averageSlotPrice,
                peakHours,
                peakDays
            };
        }
        catch (error) {
            console.error('Error getting availability analytics:', error);
            throw error;
        }
    }
    // Private helper methods
    shouldRefreshCache() {
        return Date.now() - this.lastCacheUpdate > this.cacheValidityPeriod;
    }
    async refreshAvailabilityCache(fromTime, toTime) {
        try {
            const slots = await this.smartContract.getAvailableSlots(this.hostAddress, fromTime, toTime);
            this.availabilityCache.clear();
            for (const slot of slots) {
                const advancedSlot = {
                    slotId: slot.slotId,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    price: slot.price,
                    isRecurring: false, // Would need to get this from contract
                    metadata: '' // Would need to get this from contract
                };
                this.availabilityCache.set(slot.slotId, advancedSlot);
            }
            this.lastCacheUpdate = Date.now();
        }
        catch (error) {
            console.error('Error refreshing availability cache:', error);
        }
    }
    parseDateQuery(dateQuery) {
        const now = new Date();
        let fromTime;
        let toTime;
        if (!dateQuery) {
            // Default to next 7 days
            fromTime = new Date(now);
            toTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        else {
            const query = dateQuery.toLowerCase();
            if (query.includes('today')) {
                fromTime = new Date(now);
                fromTime.setHours(0, 0, 0, 0);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('tomorrow')) {
                fromTime = new Date(now);
                fromTime.setDate(fromTime.getDate() + 1);
                fromTime.setHours(0, 0, 0, 0);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('next week')) {
                fromTime = new Date(now);
                fromTime.setDate(fromTime.getDate() + 7);
                fromTime.setHours(0, 0, 0, 0);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 7);
            }
            else if (query.includes('monday')) {
                fromTime = this.getNextWeekday(now, 1);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('tuesday')) {
                fromTime = this.getNextWeekday(now, 2);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('wednesday')) {
                fromTime = this.getNextWeekday(now, 3);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('thursday')) {
                fromTime = this.getNextWeekday(now, 4);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('friday')) {
                fromTime = this.getNextWeekday(now, 5);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('saturday')) {
                fromTime = this.getNextWeekday(now, 6);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else if (query.includes('sunday')) {
                fromTime = this.getNextWeekday(now, 0);
                toTime = new Date(fromTime);
                toTime.setDate(toTime.getDate() + 1);
            }
            else {
                // Default to next 7 days
                fromTime = new Date(now);
                toTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            }
        }
        return { fromTime, toTime };
    }
    getNextWeekday(date, targetDay) {
        const result = new Date(date);
        const currentDay = result.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        if (daysUntilTarget === 0 && result.getHours() >= 18) {
            // If it's the target day but late, get next week's occurrence
            result.setDate(result.getDate() + 7);
        }
        else {
            result.setDate(result.getDate() + daysUntilTarget);
        }
        result.setHours(0, 0, 0, 0);
        return result;
    }
    formatSlotForDisplay(slot) {
        const startTime = slot.startTime.toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const endTime = slot.endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${startTime} - ${endTime} (${slot.price} ETH)${slot.metadata ? ` - ${slot.metadata}` : ''}`;
    }
    formatTimeSlot(startTime, endTime) {
        const start = startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const end = endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${start} - ${end}`;
    }
    getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }
    // Public utility methods
    async generateDefaultSchedule(startDate, weeksCount = 4, workingDays = [1, 2, 3, 4, 5], dailyStartHour = 9, dailyEndHour = 17, slotDurationMinutes = 60, price = '0.01') {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + weeksCount * 7);
        return await this.addBusinessHoursAvailability(startDate, endDate, dailyStartHour, dailyEndHour, price, workingDays, slotDurationMinutes);
    }
    async clearAllAvailability() {
        try {
            const slots = Array.from(this.availabilityCache.keys());
            for (const slotId of slots) {
                await this.removeAvailabilitySlot(slotId);
            }
            this.availabilityCache.clear();
        }
        catch (error) {
            console.error('Error clearing all availability:', error);
            throw error;
        }
    }
}
exports.default = AdvancedHostAvailabilityManager;
