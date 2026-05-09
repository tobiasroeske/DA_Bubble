export interface Channel {
  id?: string;
  title: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  createdAt: number;
}
