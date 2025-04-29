// server/ws.ts
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { ee } from '@/server/trpc/routers/chatRouter'; // EventEmitter
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ─ Redis Pub/Sub クライアント設定 ───────────────────────────────────────
const sub = createClient({ url: REDIS_URL });
sub.connect();
sub.subscribe('msg:*', (message, channel) => {
  // channel 例: "msg:roomId"
  const roomId = channel.split(':')[1];
  const payload = JSON.parse(message);
  // ローカル EventEmitter も発火しておくので必要に応じて省略可
  ee.emit(`msg:${roomId}`, payload);
});

// ─ HTTP サーバー＋WebSocketサーバー設定 ─────────────────────────────────
const server = createServer();
const wss    = new WebSocketServer({ server });

// クライアントごとに購読ルームを管理
wss.on('connection', (ws: WebSocket) => {
  let subscribedRoom: string | null = null;

  // クライアントから { type: 'subscribe', roomId: 'xxx' } を受け取る想定
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'subscribe' && typeof msg.roomId === 'string') {
        subscribedRoom = msg.roomId;

        // EventEmitter 側の購読
        const handler = (payload: any) => {
          ws.send(JSON.stringify({ type: 'message', data: payload }));
        };
        ee.on(`msg:${subscribedRoom}`, handler);

        // クローズ時はリスナー解除
        ws.on('close', () => {
          ee.off(`msg:${subscribedRoom}`, handler);
        });
      }
    } catch (e) {
      console.error('WS message parse error:', e);
    }
  });
});

// サーバー起動
const PORT = parseInt(process.env.WS_PORT || '4001', 10);
server.listen(PORT, () => {
  console.log(`▶ WebSocket server listening on ws://localhost:${PORT}`);
});
