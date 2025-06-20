const axios = require('axios');

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

module.exports = async (req, res) => {
    // Cấu hình CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        const response = await axios.get('http://67.220.85.146:6175/api/all', {
            timeout: 5000 // 5 second timeout
        });
        
        if (!response.data || Object.keys(response.data).length === 0) {
            return res.json(getSampleData());
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.json(getSampleData());
    }
};
