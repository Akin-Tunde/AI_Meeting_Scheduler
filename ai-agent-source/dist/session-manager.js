"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeetingSession = createMeetingSession;
exports.getMeetingSession = getMeetingSession;
exports.updateMeetingSessionStatus = updateMeetingSessionStatus;
exports.getUserSessions = getUserSessions;
// In-memory storage for demo purposes
// In production, this would be a database
const sessions = [];
function createMeetingSession(requesterAddress, hostAddress, dateTime, duration, amount, currency) {
    const session = {
        id: `session_${Date.now()}`,
        requesterAddress,
        hostAddress,
        dateTime,
        duration,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date()
    };
    sessions.push(session);
    return session;
}
function getMeetingSession(id) {
    return sessions.find(session => session.id === id);
}
function updateMeetingSessionStatus(id, status) {
    const session = sessions.find(session => session.id === id);
    if (session) {
        session.status = status;
        return true;
    }
    return false;
}
function getUserSessions(userAddress) {
    return sessions.filter(session => session.requesterAddress === userAddress || session.hostAddress === userAddress);
}
