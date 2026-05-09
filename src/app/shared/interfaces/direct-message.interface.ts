export interface DirectMessage {
  id?: string;
  participantIds: string[];
  createdAt: number;
  lastMessageAt: number;
}
