const { Configuration, OpenAIApi } = require('openai');

// Initialize the OpenAI configuration with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Function to generate a response from OpenAI
const generateResponse = async (prompt) => {
  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
    });
    return completion.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

module.exports = { generateResponse };
