const axios = require('axios');
const NodeCache = require('node-cache');

// Tạo cache với thời gian sống 5 phút
const cache = new NodeCache({ stdTTL: 300 });

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
            },
            // Thêm dữ liệu mẫu khác nếu cần
        ],
        "ios": [
            // Dữ liệu mẫu iOS
        ],
        // Các danh mục khác
    };
}

module.exports = async (req, res) => {
    // Cấu hình CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        // Kiểm tra cache trước
        const cachedData = cache.get('executors');
        if (cachedData) {
            return res.json(cachedData);
        }

        const response = await axios.get('http://67.220.85.146:6175/api/all', {
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
};