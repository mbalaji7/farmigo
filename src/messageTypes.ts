export type ChatMessage = {
  id: string;
  sender: "you" | "owner";
  body: string;
  createdAt: string;
};
export type Conversation = {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  owner: string;
  participantId?: string;
  messages: ChatMessage[];
  unread: number;
  createdAt: string;
};
