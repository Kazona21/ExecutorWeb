const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const NodeCache = require('node-cache');

// Tạo cache với thời gian sống 5 phút
const cache = new NodeCache({ stdTTL: 300 });

// Cấu hình CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static('.'));
app.use(express.json());

// API endpoint
app.get('/api/executors', async (req, res) => {
    try {
        // Kiểm tra cache trước
        const cachedData = cache.get('executors');
        if (cachedData) {
            return res.json(cachedData);
        }

        const response = await axios.get('http://node1.lunes.host:2287/api/all', {
            timeout: 5000 // 5 second timeout
        });
        
        if (!response.data || Object.keys(response.data).length === 0) {
            const sampleData = getSampleData();
            cache.set('executors', sampleData);
            return res.json(sampleData);
        }
        
        // Lưu vào cache
        cache.set('executors', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        const sampleData = getSampleData();
        cache.set('executors', sampleData);
        res.json(sampleData);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Trang chủ
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Hàm lấy dữ liệu mẫu
function getSampleData() {
    return {
        "android": [
            {
                "name": "Executor1",
                "title": "Android Executor 1",
                "status": "Online",
                "VNGversion": "1.2.3",
                "image_url": "https://via.placeholder.com/100",
                "download_url": "https://example.com/download",
                "download_text": "Download Free",
                "discord_url": "https://discord.com",
                "category": "android"
            }
        ],
        "ios": [
            {
                "name": "Executor2",
                "title": "iOS Executor 1",
                "status": "Online",
                "VNGversion": "1.0.0",
                "image_url": "https://via.placeholder.com/100",
                "download_url": "https://example.com/download",
                "download_text": "Download Free",
                "discord_url": "https://discord.com",
                "category": "ios"
            }
        ]
    };
}

// Đảm bảo server hoạt động trên môi trường local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Xuất app cho Vercel
module.exports = app;


