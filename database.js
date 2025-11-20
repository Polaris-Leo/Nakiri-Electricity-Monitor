import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db; // 单例数据库连接

// 初始化数据库连接并创建表
export async function initDatabase() {
  db = await open({
    filename: './electricity.db', // 数据库文件名
    driver: sqlite3.Database
  });

  // ‼️ 更改：添加了 room_id 字段，并设置了复合主键
  await db.exec(`
    CREATE TABLE IF NOT EXISTS electricity (
      timestamp TEXT,
      room_id TEXT,
      kWh REAL,
      PRIMARY KEY (timestamp, room_id)
    );
  `);
  console.log('Database initialized (multi-room).');
}

// 获取数据库连接实例
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}