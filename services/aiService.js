const axios = require('axios');
const fs = require('fs');
const path = require('path');

const aiService = {
  async generateResponse(influencer, user, userPrompt) {
    try {
      const promptTemplate = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf8');
      const prompt = promptTemplate
        .replace('[Influencer full name]', influencer.name)
        .replace('[User first name]', user.name)
        .replace('[specific niche/topic]', influencer.niche)
        .replace('[characteristic trait]', influencer.characteristicTrait)
        .replace('[PROMPT_START]', '')
        .replace('[PROMPT_END]', '')
        .trim();

      const fullPrompt = `${prompt}\nFan: ${userPrompt}\n${influencer.name}:`;

      const response = await axios.post('https://api.openai.com/v1/completions', {
        model: 'gpt-3.5-turbo',
        prompt: fullPrompt,
        max_tokens: 150,
        stop: [`\n${user.name}:`, '\n'],
        temperature: 0.7,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error generating response', error);
      throw new Error('Failed to generate response');
    }
  },

  async fineTuneModel(username, filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = {
        model: 'gpt-3.5-turbo',
        prompt: `Based on the following text from ${username}, generate similar responses:\n\n${fileContent}`,
        max_tokens: 150
      };
      const response = await axios.post('https://api.openai.com/v1/fine-tunes', data, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      console.log('Fine-tuning response:', response.data);
    } catch (error) {
      console.error('Error fine-tuning model', error);
      throw new Error('Failed to fine-tune model');
    }
  }
};

module.exports = aiService;
