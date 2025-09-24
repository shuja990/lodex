export interface ChatMessage {
  _id: string;
  loadId: string;
  senderId: string;
  message: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ChatMessageResponse {
  success: boolean;
  messages?: ChatMessage[];
  message?: string; // error or status message
  since?: string; // echo back since param
}
