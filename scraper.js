import axios from 'axios';
import { getDb } from './database.js';

// 基础 URL
const BASE_URL = "https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult";
const BASE_PARAMS = "sysid=1&areaid=3&buildid=20"; // 固定的楼宇参数

// ‼️ 更新并排序后的房间配置
const ROOM_CONFIG = [
  {
    id: '506',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=506`
  },
  {
    id: '507',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=507`
  },
  {
    id: '509',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=509`
  },
  {
    id: '510',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=510`
  },
  {
    id: '537',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=537`
  },
  {
    id: '538',
    url: `${BASE_URL}?${BASE_PARAMS}&roomid=538`
  }
];

// 从你的 main.py 提取的 User-Agent
const headers = {
  "User-Agent": "Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; Chitanda/Akari) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/6.0.0.58_r884092.501 NetType/WIFI",
};

// 从你的 main.py 提取的正则表达式
const regex = /(-?\d+(\.\d+)?)度/;

// 单次抓取函数
async function scrapeRoom(room) {
  try {
    const response = await axios.get(room.url, { headers });
    const match = response.data.match(regex);

    if (match && match[1]) {
      const kwh = parseFloat(match[1]);
      const timestamp = new Date().toISOString();
      
      const db = await getDb();
      
      // 插入时包含 room_id
      await db.run(
        "INSERT OR IGNORE INTO electricity (timestamp, room_id, kWh) VALUES (?, ?, ?)",
        timestamp,
        room.id,
        kwh
      );
      
      console.log(`Scrape successful: Room ${room.id} - ${kwh} kWh`);
    } else {
      throw new Error(`Could not parse data for room ${room.id}.`);
    }
  } catch (e) {
    console.error(`Scraper failed for room ${room.id}:`, e.message);
  }
}

// 导出运行所有抓取任务的函数
export async function runScraper() {
  console.log('Running multi-room scraper...');
  // 并行抓取所有房间
  await Promise.all(ROOM_CONFIG.map(room => scrapeRoom(room)));
}
