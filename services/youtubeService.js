const { google } = require('googleapis');

const youtubeService = {
  async fetchProfileData(accessToken) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const response = await youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        mine: true
      });
      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching YouTube profile data', error);
      throw new Error('Failed to fetch YouTube profile data');
    }
  }
};

module.exports = youtubeService;
