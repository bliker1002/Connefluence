const axios = require('axios');
const User = require('../models/User');

async function fetchTikTokData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.tiktokAccessToken) {
      throw new Error('User not authenticated with TikTok');
    }

    const response = await axios.get(`https://open-api.tiktok.com/platform/oauth/userinfo/`, {
      headers: {
        'Authorization': `Bearer ${user.tiktokAccessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    throw error;
  }
}

module.exports = { fetchTikTokData };
