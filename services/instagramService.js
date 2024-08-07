const axios = require('axios');

const instagramService = {
  async fetchProfileData(accessToken) {
    try {
      const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram profile data', error);
      throw new Error('Failed to fetch Instagram profile data');
    }
  }
};

module.exports = instagramService;
