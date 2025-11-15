// Backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Your Telegram credentials (from environment variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Generate unique ticket ID
function generateTicketId() {
  return 'TOM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Send message to Telegram
async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }
    );
    return response.data;
  } catch (error) {
    console.error('Telegram API error:', error.response?.data || error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tomoca IT Support System is running!',
    status: 'active'
  });
});

// Submit ticket endpoint
app.post('/submit-ticket', async (req, res) => {
  try {
    const { name, department, urgency, issue } = req.body;

    // Basic validation
    if (!name || !department || !urgency || !issue) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const ticketId = generateTicketId();
    const timestamp = new Date().toLocaleString();

    // Format message for Telegram
    const telegramMessage = `
🆕 <b>NEW IT SUPPORT TICKET</b>

🎫 <b>Ticket ID:</b> <code>${ticketId}</code>
👤 <b>Name:</b> ${name}
🏢 <b>Department:</b> ${department}
🚨 <b>Urgency:</b> ${urgency}
📝 <b>Issue:</b>
${issue}

⏰ <b>Submitted:</b> ${timestamp}
    `.trim();

    // Send to Telegram
    await sendTelegramMessage(telegramMessage);

    res.json({
      success: true,
      ticketId: ticketId,
      message: 'Ticket submitted successfully to IT team'
    });

  } catch (error) {
    console.error('Error submitting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting ticket. Please try again or contact IT directly.'
    });
  }
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Tomoca Support Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}`);
  });
}