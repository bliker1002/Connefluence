const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const twilio = require('twilio');
const stripe = require('stripe');
const passport = require('./config/passport'); // Adjust the path if necessary

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send a message via Twilio
const sendMessage = async (to, body) => {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Stripe setup
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Function to create a Stripe payment link
const createPaymentLink = async (amount, currency = 'usd') => {
  try {
    const paymentLink = await stripeClient.paymentLinks.create({
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: 'Message Pack',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
    });
    return paymentLink.url;
  } catch (error) {
    console.error('Error creating payment link:', error);
  }
};

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Influencer Routes
const influencerRoutes = require('./routes/influencer');
app.use('/api/influencer', influencerRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    console.log('Instagram strategy loaded');
  }
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    console.log('Twitter strategy loaded');
  }
  if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
    console.log('TikTok strategy loaded');
  }
  console.log('Google strategy loaded');
});
