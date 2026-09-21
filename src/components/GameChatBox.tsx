"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getChatRoomByGame,
  getRecentMessages,
  getMessagesBefore,
  ChatMessageResponse,
} from "@/lib/api/chat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useAuthStore } from "@/store/useAuthStore";

export default function GameChatBox({ gameId }: { gameId: number }) {
  const { isLoggedIn } = useAuthStore();

  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 요청 키가 바뀌면 자동으로 "로딩 중"이 되도록, 결과와 그 결과를 만든 키를 함께 저장
  // (effect 몸통에서 동기적으로 setLoading(true)를 호출하지 않기 위한 패턴 — DefenseBox와 동일)
  const requestKey = String(gameId);
  const [status, setStatus] = useState<{ key: string; state: "loading" | "error" | "ready" }>({
    key: "",
    state: "loading",
  });
  const loading = status.key !== requestKey || status.state === "loading";
  const error = status.key === requestKey && status.state === "error" ? "채팅방을 불러오지 못했습니다." : null;

  const listRef = useRef<HTMLDivElement>(null);
  const oldestIdRef = useRef<number | null>(null);

  // 채팅방 조회(없으면 자동 생성) + 최근 메시지 로드
  useEffect(() => {
    let cancelled = false;

    getChatRoomByGame(gameId)
      .then(async (room) => {
        if (cancelled) return;
        setChatRoomId(room.id);
        const recent = await getRecentMessages(room.id);
        if (cancelled) return;
        setMessages(recent);
        oldestIdRef.current = recent.length > 0 ? recent[0].id : null;
        setHasMore(recent.length >= 50);
        setStatus({ key: requestKey, state: "ready" });
      })
      .catch(() => {
        if (!cancelled) setStatus({ key: requestKey, state: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, requestKey]);

  const handleIncoming = useCallback((msg: ChatMessageResponse) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const { connected, sendMessage } = useChatSocket(chatRoomId, handleIncoming);

  // 새 메시지 도착 시 스크롤 하단 고정
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleLoadMore = async () => {
    if (!chatRoomId || oldestIdRef.current == null || loadingMore) return;
    setLoadingMore(true);
    try {
      const older = await getMessagesBefore(chatRoomId, oldestIdRef.current);
      if (older.length > 0) {
        oldestIdRef.current = older[0].id;
        setMessages((prev) => [...older, ...prev]);
      }
      setHasMore(older.length >= 20);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    sendMessage(input.trim());
    setInput("");
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-bg-primary p-6 text-center text-[13px] text-text-secondary">
        채팅방을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-bg-primary p-6 text-center text-[13px] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl bg-bg-primary">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border-tertiary px-4 py-3">
        <span className="text-[13px] font-semibold text-text-primary">경기 채팅</span>
        <span className={`text-[11px] ${connected ? "text-green-500" : "text-text-secondary"}`}>
          {connected ? "● 연결됨" : "○ 연결 중..."}
        </span>
      </div>

      {/* 메시지 리스트 */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="mb-3 w-full rounded-lg border border-border-tertiary py-1.5 text-[11px] text-text-secondary transition-colors hover:bg-bg-secondary disabled:opacity-40"
          >
            {loadingMore ? "불러오는 중..." : "이전 메시지 더 보기"}
          </button>
        )}

        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && (
            <p className="py-8 text-center text-[12px] text-text-secondary">
              아직 채팅이 없어요. 첫 메시지를 남겨보세요!
            </p>
          )}
          {messages.map((m) =>
            m.messageType === "SYSTEM" ? (
              <div key={m.id} className="text-center text-[11px] text-text-secondary">
                {m.content}
              </div>
            ) : (
              <div key={m.id} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] font-semibold text-text-primary">{m.nickname}</span>
                  <span className="text-[10px] text-text-secondary">
                    {new Date(m.createdAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="break-words text-[13px] text-text-primary">{m.content}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border-tertiary p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoggedIn ? "메시지를 입력하세요" : "로그인 후 채팅할 수 있습니다"}
          disabled={!isLoggedIn}
          maxLength={500}
          className="min-w-0 flex-1 rounded-lg border border-border-tertiary bg-bg-secondary px-3.5 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isLoggedIn || !connected || !input.trim()}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          전송
        </button>
      </form>
    </div>
  );
}