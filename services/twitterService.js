const axios = require('axios');
const User = require('../models/User');

async function fetchTwitterData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.twitterAccessToken) {
      throw new Error('User not authenticated with Twitter');
    }

    const response = await axios.get(`https://api.twitter.com/1.1/account/verify_credentials.json`, {
      headers: {
        'Authorization': `Bearer ${user.twitterAccessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
}

module.exports = { fetchTwitterData };
