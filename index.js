const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('./config/passport');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const twilio = require('twilio');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('./models/User');
const aiService = require('./services/aiService');

// Load environment variables at the beginning
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Ensure the port is 5000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use Helmet to set security headers, including CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://accounts.google.com", "https://www.googleapis.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
}));

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to match your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
}));

// Session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    sameSite: 'None', // Set SameSite attribute
    secure: true // Ensure cookies are only sent over HTTPS
  }
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

// Directories to create
const directories = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'data/influencers'),
  path.join(__dirname, 'data/users')
];

// Create directories if they don't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Influencer Routes
const influencerRoutes = require('./routes/influencer');
app.use('/api/influencer', influencerRoutes);

// User Routes
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

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

// Endpoint to handle incoming messages from Twilio
app.post('/webhook/twilio', async (req, res) => {
  const { From, Body } = req.body;

  try {
    const user = await User.findOne({ phone: From });
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    const influencer = await User.findById(user.influencerId);
    if (!influencer) {
      res.status(404).send('Influencer not found');
      return;
    }

    const response = await aiService.generateResponse(influencer, user, Body);
    await sendMessage(From, response);

    res.status(200).send('Message processed');
  } catch (error) {
    console.error('Error processing message', error);
    res.status(500).send('Server error');
  }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve the React frontend app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

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
