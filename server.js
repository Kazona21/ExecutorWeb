const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const NodeCache = require('node-cache');

// Tạo cache với thời gian sống 5 phút
const cache = new NodeCache({ stdTTL: 300 });

// Cấu hình CORS để chấp nhận tất cả các nguồn
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static('.'));
app.use(express.json());

// Thêm middleware compression để nén response
const compression = require('compression');
app.use(compression());

app.get('/api/executors', async (req, res) => {
    try {
        // Kiểm tra cache trước
        const cachedData = cache.get('executors');
        if (cachedData) {
            console.log('Serving from cache');
            return res.json(cachedData);
        }

        console.log('Fetching from API...');
        const response = await axios.get('http://67.220.85.146:6175/api/all', {
            timeout: 5000, // 5 second timeout
            headers: {
                'User-Agent': 'ExecutorWeb/1.0'
            }
        });
        
        if (!response.data || Object.keys(response.data).length === 0) {
            console.log('API returned empty data, using sample data');
            const sampleData = getSampleData();
            cache.set('executors', sampleData);
            return res.json(sampleData);
        }
        
        // Lưu vào cache
        console.log('Caching API response');
        cache.set('executors', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        const sampleData = getSampleData();
        cache.set('executors', sampleData);
        res.json(sampleData);
    }
});

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
            },
            {
                "name": "Executor2",
                "title": "Android Executor 2",
                "status": "Offline",
                "VNGversion": "2.0.1",
                "image_url": "https://via.placeholder.com/100",
                "download_url": "https://example.com/download",
                "download_text": "Get Now",
                "category": "android"
            }
        ],
        "ios": [
            {
                "name": "Executor3",
                "title": "iOS Executor 1",
                "status": "Online",
                "VNGversion": "3.1.0",
                "price": "19.99",
                "image_url": "https://via.placeholder.com/100",
                "purchase_url": "https://example.com/purchase",
                "purchase_text": "Buy Premium",
                "discord_url": "https://discord.com",
                "category": "ios"
            }
        ],
        "windows": [
            {
                "name": "Executor4",
                "title": "Windows Executor 1",
                "status": "Online",
                "VNGversion": "4.2.1",
                "image_url": "https://via.placeholder.com/100",
                "download_url": "https://example.com/download",
                "download_text": "Download v4.2.1",
                "vng_url": "https://example.com/vng",
                "category": "windows"
            }
        ],
        "macos": [
            {
                "name": "Executor5",
                "title": "macOS Executor 1",
                "status": "Offline",
                "VNGversion": "1.0.5",
                "price": "29.99",
                "image_url": "https://via.placeholder.com/100",
                "purchase_url": "https://example.com/purchase",
                "purchase_text": "Buy License",
                "category": "macos"
            }
        ],
        "external": [
            {
                "name": "Executor6",
                "title": "External Executor 1",
                "status": "Online",
                "VNGversion": "2.3.0",
                "image_url": "https://via.placeholder.com/100",
                "download_url": "https://example.com/download",
                "download_text": "Download Latest",
                "discord_url": "https://discord.com",
                "category": "external"
            }
        ]
    };
}

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Thêm route mặc định để xử lý tất cả các request khác
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

// Đảm bảo server hoạt động trên Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Xuất app cho Vercel
module.exports = app;

