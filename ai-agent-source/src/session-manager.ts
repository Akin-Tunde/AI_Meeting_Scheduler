export interface MeetingSession {
  id: string;
  requesterAddress: string;
  hostAddress: string;
  dateTime: string;
  duration: number; // in minutes
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

// In-memory storage for demo purposes
// In production, this would be a database
const sessions: MeetingSession[] = [];

export function createMeetingSession(
  requesterAddress: string,
  hostAddress: string,
  dateTime: string,
  duration: number,
  amount: number,
  currency: string
): MeetingSession {
  const session: MeetingSession = {
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

export function getMeetingSession(id: string): MeetingSession | undefined {
  return sessions.find(session => session.id === id);
}

export function updateMeetingSessionStatus(id: string, status: MeetingSession['status']): boolean {
  const session = sessions.find(session => session.id === id);
  if (session) {
    session.status = status;
    return true;
  }
  return false;
}

export function getUserSessions(userAddress: string): MeetingSession[] {
  return sessions.filter(session => 
    session.requesterAddress === userAddress || session.hostAddress === userAddress
  );
}

