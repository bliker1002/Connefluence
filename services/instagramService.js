const axios = require('axios');
const User = require('../models/User');

async function fetchInstagramData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.instagramAccessToken) {
      throw new Error('User not authenticated with Instagram');
    }

    const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${user.instagramAccessToken}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    throw error;
  }
}

module.exports = { fetchInstagramData };
