const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const messagesFile = path.join(__dirname, '../messages.json');

// Helper function to save messages to JSON file
function saveMessageToFile(data) {
    try {
        let messages = [];
        if (fs.existsSync(messagesFile)) {
            const content = fs.readFileSync(messagesFile, 'utf-8');
            messages = JSON.parse(content);
        }
        messages.push({ ...data, timestamp: new Date() });
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving to file:', error.message);
        return false;
    }
}

// POST route for contact form submissions
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const data = { name, email, message };

        // Try to save to MongoDB if available
        try {
            const Message = require('../model');
            await Message.create(data);
            res.json({ 
                success: true, 
                message: 'Message saved to MongoDB ✅',
                data 
            });
        } catch (dbError) {
            // Fallback: save to JSON file
            if (saveMessageToFile(data)) {
                res.json({ 
                    success: true, 
                    message: 'Message saved locally (MongoDB unavailable)',
                    data 
                });
            } else {
                throw new Error('Failed to save message');
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
