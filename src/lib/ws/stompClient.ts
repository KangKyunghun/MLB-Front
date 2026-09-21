import { Client } from "@stomp/stompjs";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// http(s):// → ws(s):// 로 변환 후 STOMP 엔드포인트 붙임
// 백엔드 WebSocketConfig가 withSockJS() 없이 순수 WebSocket 엔드포인트(/ws)를 쓰고 있어서
// SockJS 대신 @stomp/stompjs의 네이티브 brokerURL 방식을 사용합니다.
const wsURL = baseURL.replace(/^http/, "ws") + "/ws";

export function createStompClient(token: string | null): Client {
  return new Client({
    brokerURL: wsURL,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
}