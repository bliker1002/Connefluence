const axios = require('axios');

const tiktokService = {
  async fetchProfileData(accessToken) {
    try {
      const response = await axios.get(`https://open-api.tiktok.com/user/info/?access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching TikTok profile data', error);
      throw new Error('Failed to fetch TikTok profile data');
    }
  }
};

module.exports = tiktokService;
