"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { createStompClient } from "@/lib/ws/stompClient";
import { ChatMessageResponse } from "@/lib/api/chat";

/**
 * 경기 채팅방 하나에 대한 STOMP 연결을 관리하는 훅.
 * - chatRoomId가 바뀌면 기존 연결을 끊고 새로 연결합니다.
 * - onMessage는 ref로 보관해서, 콜백이 매 렌더마다 바뀌어도 재연결이 일어나지 않습니다.
 */
export function useChatSocket(
  chatRoomId: number | null,
  onMessage: (msg: ChatMessageResponse) => void
) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!chatRoomId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const client = createStompClient(token);

    client.onConnect = () => {
      setConnected(true);
      client.subscribe(`/topic/chat/${chatRoomId}`, (message: IMessage) => {
        try {
          const body: ChatMessageResponse = JSON.parse(message.body);
          onMessageRef.current(body);
        } catch {
          // 파싱 실패한 메시지는 무시
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("[STOMP ERROR]", frame.headers["message"], frame.body);
    };

    client.onWebSocketClose = () => setConnected(false);

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [chatRoomId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected || !chatRoomId) return;
      clientRef.current.publish({
        destination: `/app/chat/${chatRoomId}`,
        body: JSON.stringify({ content }),
      });
    },
    [chatRoomId]
  );

  return { connected, sendMessage };
}