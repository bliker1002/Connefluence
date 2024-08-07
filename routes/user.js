const express = require('express');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Generate Stripe Payment Link for Users to Buy Additional Texts
router.post('/buy-texts', ensureAuth, async (req, res) => {
  const { messageCount } = req.body;

  if (!messageCount || messageCount < 250) {
    return res.status(400).json({ error: 'Minimum purchase is 250 messages' });
  }

  try {
    const amount = messageCount * 2; // $0.02 per message

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Message Pack',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
    });

    res.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Webhook to handle Stripe payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent);
      // Fulfill the purchase...
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
