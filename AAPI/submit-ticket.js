import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function generateTicketId() {
  return 'TOM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, department, urgency, issue } = req.body;

      if (!name || !department || !urgency || !issue) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      const ticketId = generateTicketId();
      const timestamp = new Date().toLocaleString();

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

      await sendTelegramMessage(telegramMessage);

      return res.status(200).json({
        success: true,
        ticketId,
        message: 'Ticket submitted successfully to IT team'
      });
    } catch (error) {
      console.error('Error submitting ticket:', error);
      return res.status(500).json({
        success: false,
        message: 'Error submitting ticket. Please try again later.'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}

