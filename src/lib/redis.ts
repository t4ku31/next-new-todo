// src/lib/redis.ts
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 単一のクライアントを発行し、pub/sub 用に duplicate する
const client = createClient({ url: REDIS_URL });

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Top‐level await が有効な場合
await client.connect();

// pub と sub をエクスポート
export const pub = client;
export const sub = client.duplicate();

// sub は別接続なので明示的に接続
await sub.connect();
