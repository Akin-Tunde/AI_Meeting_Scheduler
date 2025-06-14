"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MultiHostManager {
    constructor(smartContract, sessionManager) {
        this.hostCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheValidityPeriod = 10 * 60 * 1000; // 10 minutes
        this.smartContract = smartContract;
        this.sessionManager = sessionManager;
    }
    // Host Discovery and Search
    async searchHosts(filters = {}, sortBy = 'rating', page = 1, pageSize = 20) {
        try {
            await this.refreshHostCache();
            let filteredHosts = Array.from(this.hostCache.values());
            // Apply filters
            filteredHosts = this.applyFilters(filteredHosts, filters);
            // Sort hosts
            filteredHosts = this.sortHosts(filteredHosts, sortBy);
            // Paginate
            const startIndex = (page - 1) * pageSize;
            const paginatedHosts = filteredHosts.slice(startIndex, startIndex + pageSize);
            return {
                hosts: paginatedHosts,
                totalCount: filteredHosts.length,
                filters,
                sortBy,
                page,
                pageSize
            };
        }
        catch (error) {
            console.error('Error searching hosts:', error);
            return {
                hosts: [],
                totalCount: 0,
                filters,
                sortBy,
                page,
                pageSize
            };
        }
    }
    async getHostProfile(hostAddress) {
        try {
            // Check cache first
            if (this.hostCache.has(hostAddress)) {
                return this.hostCache.get(hostAddress);
            }
            // Fetch from smart contract and database
            const contractInfo = await this.smartContract.getAdvancedHostInfo(hostAddress);
            const dbProfile = await this.sessionManager.getHostProfile(hostAddress);
            if (!contractInfo.isRegistered) {
                return null;
            }
            const hostProfile = await this.buildHostProfile(hostAddress, contractInfo, dbProfile);
            this.hostCache.set(hostAddress, hostProfile);
            return hostProfile;
        }
        catch (error) {
            console.error('Error getting host profile:', error);
            return null;
        }
    }
    async getRecommendedHosts(requesterAddress, preferences = {}, limit = 5) {
        try {
            // Get user's previous sessions to understand preferences
            const previousSessions = await this.sessionManager.getSessionsByRequester(requesterAddress);
            const userHistory = this.analyzeUserHistory(previousSessions);
            // Combine explicit preferences with learned preferences
            const combinedPreferences = {
                ...userHistory,
                ...preferences
            };
            // Search with personalized filters
            const searchResult = await this.searchHosts({
                priceRange: combinedPreferences.budget ? { min: 0, max: combinedPreferences.budget } : undefined,
                specialties: combinedPreferences.specialty ? [combinedPreferences.specialty] : undefined,
                languages: combinedPreferences.language ? [combinedPreferences.language] : undefined,
                timezone: combinedPreferences.timezone,
                rating: 7.0, // Minimum rating for recommendations
                verified: true
            }, 'rating', 1, limit);
            return searchResult.hosts;
        }
        catch (error) {
            console.error('Error getting recommended hosts:', error);
            return [];
        }
    }
    async getFeaturedHosts(limit = 10) {
        try {
            const searchResult = await this.searchHosts({
                rating: 8.5, // High rating threshold
                verified: true,
                premiumOnly: true
            }, 'rating', 1, limit);
            return searchResult.hosts;
        }
        catch (error) {
            console.error('Error getting featured hosts:', error);
            return [];
        }
    }
    // Host Categories and Specialties
    async getHostsBySpecialty(specialty, limit = 20) {
        try {
            const searchResult = await this.searchHosts({
                specialties: [specialty],
                verified: true
            }, 'rating', 1, limit);
            return searchResult.hosts;
        }
        catch (error) {
            console.error('Error getting hosts by specialty:', error);
            return [];
        }
    }
    async getAvailableSpecialties() {
        try {
            await this.refreshHostCache();
            const specialtyMap = new Map();
            for (const host of this.hostCache.values()) {
                if (host.isActive) {
                    for (const specialty of host.specialties) {
                        const current = specialtyMap.get(specialty) || { count: 0, totalPrice: 0 };
                        specialtyMap.set(specialty, {
                            count: current.count + 1,
                            totalPrice: current.totalPrice + parseFloat(host.defaultPrice)
                        });
                    }
                }
            }
            return Array.from(specialtyMap.entries()).map(([specialty, data]) => ({
                specialty,
                hostCount: data.count,
                averagePrice: data.totalPrice / data.count
            })).sort((a, b) => b.hostCount - a.hostCount);
        }
        catch (error) {
            console.error('Error getting available specialties:', error);
            return [];
        }
    }
    // Host Comparison
    async compareHosts(hostAddresses) {
        try {
            const hosts = await Promise.all(hostAddresses.map(address => this.getHostProfile(address)));
            const validHosts = hosts.filter(host => host !== null);
            if (validHosts.length === 0) {
                throw new Error('No valid hosts found for comparison');
            }
            const prices = validHosts.map(host => parseFloat(host.defaultPrice));
            const ratings = validHosts.map(host => host.rating);
            const allSpecialties = validHosts.flatMap(host => host.specialties);
            const allLanguages = validHosts.flatMap(host => host.languages);
            const specialtyOverlap = this.findOverlap(allSpecialties);
            const languageOverlap = this.findOverlap(allLanguages);
            return {
                hosts: validHosts,
                comparison: {
                    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
                    ratingRange: { min: Math.min(...ratings), max: Math.max(...ratings) },
                    availabilityComparison: validHosts.map(host => ({
                        address: host.address,
                        nextAvailable: host.availability.nextAvailable,
                        slotsThisWeek: host.availability.slotsThisWeek
                    })),
                    specialtyOverlap,
                    languageOverlap
                }
            };
        }
        catch (error) {
            console.error('Error comparing hosts:', error);
            throw error;
        }
    }
    // Host Analytics and Insights
    async getMarketplaceAnalytics() {
        try {
            await this.refreshHostCache();
            const allHosts = Array.from(this.hostCache.values());
            const activeHosts = allHosts.filter(host => host.isActive);
            const totalRating = activeHosts.reduce((sum, host) => sum + host.rating, 0);
            const totalPrice = activeHosts.reduce((sum, host) => sum + parseFloat(host.defaultPrice), 0);
            const totalMeetings = activeHosts.reduce((sum, host) => sum + host.totalMeetings, 0);
            const specialtyCount = new Map();
            activeHosts.forEach(host => {
                host.specialties.forEach(specialty => {
                    specialtyCount.set(specialty, (specialtyCount.get(specialty) || 0) + 1);
                });
            });
            const topSpecialties = Array.from(specialtyCount.entries())
                .map(([specialty, count]) => ({ specialty, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const priceDistribution = this.calculatePriceDistribution(activeHosts);
            const ratingDistribution = this.calculateRatingDistribution(activeHosts);
            return {
                totalHosts: allHosts.length,
                activeHosts: activeHosts.length,
                averageRating: activeHosts.length > 0 ? totalRating / activeHosts.length : 0,
                averagePrice: activeHosts.length > 0 ? totalPrice / activeHosts.length : 0,
                totalMeetings,
                topSpecialties,
                priceDistribution,
                ratingDistribution
            };
        }
        catch (error) {
            console.error('Error getting marketplace analytics:', error);
            throw error;
        }
    }
    // Host Verification and Quality Control
    async verifyHost(hostAddress, verificationData) {
        try {
            // In a real implementation, this would involve external verification services
            const verificationScore = Object.values(verificationData).filter(Boolean).length;
            const isVerified = verificationScore >= 3; // Require at least 3 out of 4 verifications
            // Update host profile in database
            const currentProfile = await this.sessionManager.getHostProfile(hostAddress);
            if (currentProfile) {
                await this.sessionManager.createOrUpdateHostProfile(hostAddress, {
                    ...currentProfile,
                    metadata: {
                        ...currentProfile.metadata,
                        verified: isVerified,
                        verificationScore
                    }
                });
            }
            // Update cache
            const cachedHost = this.hostCache.get(hostAddress);
            if (cachedHost) {
                cachedHost.metadata.verified = isVerified;
                this.hostCache.set(hostAddress, cachedHost);
            }
            return isVerified;
        }
        catch (error) {
            console.error('Error verifying host:', error);
            return false;
        }
    }
    async reportHost(hostAddress, reporterAddress, reason, description) {
        try {
            // Store report in database
            const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // In a real implementation, this would be stored in a dedicated reports table
            await this.sessionManager.addMessage(`report_${reportId}`, 'system', JSON.stringify({
                type: 'host_report',
                reportId,
                hostAddress,
                reporterAddress,
                reason,
                description,
                timestamp: new Date().toISOString()
            }), reporterAddress);
            return reportId;
        }
        catch (error) {
            console.error('Error reporting host:', error);
            throw error;
        }
    }
    // Private helper methods
    async refreshHostCache() {
        if (Date.now() - this.lastCacheUpdate < this.cacheValidityPeriod) {
            return; // Cache is still valid
        }
        try {
            // In a real implementation, we would query the smart contract for all registered hosts
            // For now, we'll simulate this by checking known hosts from the database
            // This is a simplified implementation - in reality, you'd need to:
            // 1. Query the smart contract for all registered hosts
            // 2. Fetch their profiles from both contract and database
            // 3. Calculate availability and other metrics
            this.lastCacheUpdate = Date.now();
        }
        catch (error) {
            console.error('Error refreshing host cache:', error);
        }
    }
    async buildHostProfile(hostAddress, contractInfo, dbProfile) {
        // Get availability information
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const weekAfter = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const slotsThisWeek = await this.smartContract.getAvailableSlots(hostAddress, now, nextWeek);
        const slotsNextWeek = await this.smartContract.getAvailableSlots(hostAddress, nextWeek, weekAfter);
        const nextAvailable = slotsThisWeek.length > 0 ? slotsThisWeek[0].startTime :
            slotsNextWeek.length > 0 ? slotsNextWeek[0].startTime : null;
        return {
            address: hostAddress,
            displayName: dbProfile?.displayName || `Host ${hostAddress.slice(-8)}`,
            bio: dbProfile?.bio || '',
            profileImageUrl: dbProfile?.profileImageUrl,
            defaultPrice: contractInfo.defaultPrice,
            pricingModel: contractInfo.pricingModel,
            totalEarnings: contractInfo.totalEarnings,
            totalMeetings: contractInfo.totalMeetings,
            rating: contractInfo.rating,
            ratingCount: contractInfo.ratingCount,
            isActive: contractInfo.isActive,
            specialties: this.parseSpecialties(dbProfile?.metadata?.specialties || ''),
            languages: this.parseLanguages(dbProfile?.metadata?.languages || 'English'),
            timezone: dbProfile?.timezone || 'UTC',
            responseTime: dbProfile?.responseDelaySeconds || 60,
            availability: {
                nextAvailable,
                slotsThisWeek: slotsThisWeek.length,
                slotsNextWeek: slotsNextWeek.length
            },
            metadata: {
                verified: dbProfile?.metadata?.verified || false,
                premiumHost: dbProfile?.metadata?.premiumHost || false,
                instantBooking: dbProfile?.autoConfirmMeetings || false,
                autoConfirm: dbProfile?.autoConfirmMeetings || false
            }
        };
    }
    applyFilters(hosts, filters) {
        return hosts.filter(host => {
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
            // Specialties filter
            if (filters.specialties && filters.specialties.length > 0) {
                const hasSpecialty = filters.specialties.some(specialty => host.specialties.includes(specialty));
                if (!hasSpecialty) {
                    return false;
                }
            }
            // Languages filter
            if (filters.languages && filters.languages.length > 0) {
                const hasLanguage = filters.languages.some(language => host.languages.includes(language));
                if (!hasLanguage) {
                    return false;
                }
            }
            // Timezone filter
            if (filters.timezone && host.timezone !== filters.timezone) {
                return false;
            }
            // Instant booking filter
            if (filters.instantBooking && !host.metadata.instantBooking) {
                return false;
            }
            // Verified filter
            if (filters.verified && !host.metadata.verified) {
                return false;
            }
            // Premium only filter
            if (filters.premiumOnly && !host.metadata.premiumHost) {
                return false;
            }
            // Availability filter
            if (filters.availability?.date) {
                // This would require checking actual availability slots
                // Simplified check: if they have slots this week or next week
                if (host.availability.slotsThisWeek === 0 && host.availability.slotsNextWeek === 0) {
                    return false;
                }
            }
            return true;
        });
    }
    sortHosts(hosts, sortBy) {
        return hosts.sort((a, b) => {
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
                    return b.rating - a.rating;
            }
        });
    }
    analyzeUserHistory(sessions) {
        // Analyze user's previous sessions to understand preferences
        const preferences = {};
        if (sessions.length > 0) {
            // Calculate average budget
            const prices = sessions
                .filter(session => session.meetingPrice)
                .map(session => parseFloat(session.meetingPrice));
            if (prices.length > 0) {
                preferences.budget = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            }
            // Extract common patterns (simplified)
            // In a real implementation, this would be more sophisticated
        }
        return preferences;
    }
    findOverlap(items) {
        const counts = new Map();
        items.forEach(item => {
            counts.set(item, (counts.get(item) || 0) + 1);
        });
        return Array.from(counts.entries())
            .filter(([_, count]) => count > 1)
            .map(([item, _]) => item);
    }
    calculatePriceDistribution(hosts) {
        const ranges = [
            { range: '0-0.01 ETH', min: 0, max: 0.01 },
            { range: '0.01-0.05 ETH', min: 0.01, max: 0.05 },
            { range: '0.05-0.1 ETH', min: 0.05, max: 0.1 },
            { range: '0.1-0.5 ETH', min: 0.1, max: 0.5 },
            { range: '0.5+ ETH', min: 0.5, max: Infinity }
        ];
        return ranges.map(range => ({
            range: range.range,
            count: hosts.filter(host => {
                const price = parseFloat(host.defaultPrice);
                return price >= range.min && price < range.max;
            }).length
        }));
    }
    calculateRatingDistribution(hosts) {
        const ranges = [
            { range: '9.0-10.0', min: 9.0, max: 10.0 },
            { range: '8.0-8.9', min: 8.0, max: 8.9 },
            { range: '7.0-7.9', min: 7.0, max: 7.9 },
            { range: '6.0-6.9', min: 6.0, max: 6.9 },
            { range: 'Below 6.0', min: 0, max: 6.0 }
        ];
        return ranges.map(range => ({
            range: range.range,
            count: hosts.filter(host => host.rating >= range.min && host.rating < range.max).length
        }));
    }
    parseSpecialties(specialtiesStr) {
        if (!specialtiesStr)
            return ['General Consultation'];
        return specialtiesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    parseLanguages(languagesStr) {
        if (!languagesStr)
            return ['English'];
        return languagesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Public utility methods
    async getHostCount() {
        await this.refreshHostCache();
        return this.hostCache.size;
    }
    async getActiveHostCount() {
        await this.refreshHostCache();
        return Array.from(this.hostCache.values()).filter(host => host.isActive).length;
    }
    async clearCache() {
        this.hostCache.clear();
        this.lastCacheUpdate = 0;
    }
}
exports.default = MultiHostManager;
