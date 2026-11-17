export type RealtimeEvent =
  | {
      type: 'sync:init';
      buildHash: string;
      biologyStatus: {
        unlocked: boolean;
        scheduledOpen: boolean;
        earlyUnlocked: boolean;
      };
    }
  | {
      type: 'biology:status';
      unlocked: boolean;
      scheduledOpen: boolean;
      earlyUnlocked: boolean;
    }
  | {
      type: 'lock:updated';
      email: string | null;
      locked: boolean;
    }
  | {
      type: 'submissions:updated';
      email: string | null;
      locked: boolean;
    };

type RealtimeListener = (event: RealtimeEvent) => void;

const listeners = new Set<RealtimeListener>();
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectDelayMs = 1000;
let initialBuildHash: string | null = null;
let reloadingForUpdate = false;
let initializedOnlineListener = false;

function scheduleReconnect(): void {
  if (reconnectTimer !== null || listeners.size === 0 || reloadingForUpdate) {
    return;
  }
  const delay = reconnectDelayMs;
  reconnectDelayMs = Math.min(reconnectDelayMs * 2, 10000);
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectSocket();
  }, delay);
}

function connectSocket(): void {
  if (typeof window === 'undefined' || reloadingForUpdate) return;
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  try {
    socket = new WebSocket(wsUrl);
  } catch {
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectDelayMs = 1000;
  };

  socket.onmessage = (msg) => {
    try {
      const event = JSON.parse(String(msg.data)) as RealtimeEvent;
      if (event.type === 'sync:init') {
        if (initialBuildHash === null) {
          initialBuildHash = event.buildHash;
        } else if (event.buildHash && event.buildHash !== initialBuildHash) {
          reloadingForUpdate = true;
          window.location.reload();
          return;
        }
      }
      for (const listener of listeners) {
        listener(event);
      }
    } catch {
      // Ignore malformed messages
    }
  };

  socket.onclose = () => {
    socket = null;
    if (listeners.size > 0) {
      scheduleReconnect();
    }
  };

  socket.onerror = () => {
    socket?.close();
  };
}

export function subscribeRealtime(listener: RealtimeListener): () => void {
  listeners.add(listener);

  if (typeof window !== 'undefined' && !initializedOnlineListener) {
    initializedOnlineListener = true;
    window.addEventListener('online', () => {
      if (listeners.size > 0) {
        reconnectDelayMs = 1000;
        connectSocket();
      }
    });
  }

  connectSocket();

  return () => {
    listeners.delete(listener);
  };
}
