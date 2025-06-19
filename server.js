const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('.'));

app.get('/api/executors', async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


