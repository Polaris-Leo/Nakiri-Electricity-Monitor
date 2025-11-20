import express from 'express';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, getDb } from './database.js';
import { runScraper } from './scraper.js';

// --- 初始化 ---
const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化数据库
await initDatabase();

// --- API 接口 ---
app.get('/api/data', async (req, res) => {
  try {
    const db = await getDb();
    const results = await db.all(
      "SELECT * FROM electricity WHERE timestamp > datetime('now', '-30 days') ORDER BY timestamp ASC"
    );
    res.json(results);
  } catch (e) {
    console.error("Database error:", e);
    res.status(500).json({ error: e.message });
  }
});

// --- 静态文件服务 ---
app.use(express.static(path.join(__dirname, 'dist')));

// --- 兜底路由 (解决 ENOENT 报错) ---
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexFile = path.join(__dirname, 'dist', 'index.html');
    
    // 检查文件是否存在，防止开发模式下报错
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.type('text/html');
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>Nakiri Backend Running</h1>
            <p>Frontend build not found in 'dist'.</p>
            <p>For development, use: <b><a href="http://localhost:5173">http://localhost:5173</a></b></p>
        </div>
      `);
    }
  }
});

// --- 定时任务 (Cron) ---
cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Cron job running...`);
  try {
    await runScraper();
  } catch (e) {
    console.error('Cron job failed:', e);
  }
});

// --- 启动服务器 ---
app.listen(port, '0.0.0.0', async () => {
  console.log(`
  🚀 Nakiri Monitor Server is running!
  ---------------------------------------
  Local:   http://localhost:${port}
  Network: http://<Your-IP>:${port}
  ---------------------------------------
  `);
  
  console.log('Initializing data scrape on startup...');
  await runScraper();
});