const axios = require('axios');

const twitterService = {
  async fetchProfileData(accessToken, accessTokenSecret) {
    try {
      const response = await axios.get(`https://api.twitter.com/1.1/account/verify_credentials.json`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Twitter profile data', error);
      throw new Error('Failed to fetch Twitter profile data');
    }
  }
};

module.exports = twitterService;
