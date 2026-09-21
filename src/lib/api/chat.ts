import { api } from "./client";

export interface ChatRoomResponse {
  id: number;
  gameId: number;
  roomName: string;
  isActive: boolean;
}

export interface ChatMessageResponse {
  id: number;
  chatRoomId: number;
  userId: number | null;
  nickname: string;
  content: string;
  messageType: "CHAT" | "SYSTEM";
  createdAt: string;
}

// 경기별 채팅방 조회 (없으면 백엔드에서 자동 생성)
export const getChatRoomByGame = async (gamePk: number): Promise<ChatRoomResponse> => {
  const { data } = await api.get<ChatRoomResponse>(`/api/chat/rooms/game/${gamePk}`);
  return data;
};

// 입장 시 최근 메시지 50개 (오래된 순)
export const getRecentMessages = async (chatRoomId: number): Promise<ChatMessageResponse[]> => {
  const { data } = await api.get<ChatMessageResponse[]>(`/api/chat/rooms/${chatRoomId}/messages`);
  return data;
};

// 스크롤 업 시 cursorId 이전 메시지 20개 (오래된 순)
export const getMessagesBefore = async (
  chatRoomId: number,
  cursorId: number
): Promise<ChatMessageResponse[]> => {
  const { data } = await api.get<ChatMessageResponse[]>(`/api/chat/rooms/${chatRoomId}/messages`, {
    params: { cursorId },
  });
  return data;
};