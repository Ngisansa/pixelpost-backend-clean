const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { initializePayment, verifyPayment } = require('../payments/paystack');
const { createOrder, captureOrder } = require('../payments/paypal');

/**
 * =================================================
 * PAYSTACK — KENYA (KES)
 * =================================================
 * Frontend sends:
 * {
 *   email: string,
 *   amount: number (KES, human-readable e.g. 500)
 * }
 */
router.post('/paystack/init', async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || amount === undefined) {
      return res.status(400).json({
        error: 'Email and amount are required',
      });
    }

    // ✅ Convert ONCE: KES → Kobo-like unit
    const amountInKobo = Math.round(Number(amount) * 100);

    const reference =
      'ps_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    // ✅ initializePayment expects:
    // (reference, email, amountInKobo)
    const data = await initializePayment(
      reference,
      email,
      amountInKobo
    );

    return res.json({
      reference: data.reference,
      checkoutUrl: data.authorization_url,
    });
  } catch (err) {
    console.error('Paystack init error:', err);
    return res.status(400).json({
      error: err.message || 'Paystack initialization failed',
    });
  }
});

/**
 * Verify Paystack transaction
 */
router.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const data = await verifyPayment(req.params.reference);
    return res.json(data);
  } catch (err) {
    console.error('Paystack verify error:', err);
    return res.status(400).json({
      error: err.message || 'Paystack verification failed',
    });
  }
});

/**
 * Paystack webhook (recommended for production)
 */
router.post(
  '/paystack/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    const signature = req.headers['x-paystack-signature'];

    if (secret) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(req.body)
        .digest('hex');

      if (hash !== signature) {
        return res.status(400).send('Invalid Paystack signature');
      }
    }

    const payload = JSON.parse(req.body.toString());
    console.log('Paystack webhook event:', payload.event);

    // TODO: activate subscription / credit user
    res.sendStatus(200);
  }
);

/**
 * =================================================
 * PAYPAL — USD ONLY
 * =================================================
 * PayPal does NOT support KES
 */
router.post('/paypal/create', async (req, res) => {
  try {
    const { amount, return_url, cancel_url } = req.body;

    if (!amount || !return_url || !cancel_url) {
      return res.status(400).json({
        error: 'Missing PayPal parameters',
      });
    }

    const data = await createOrder(
      Number(amount),
      'USD',
      return_url,
      cancel_url
    );

    return res.json(data);
  } catch (err) {
    console.error('PayPal create error:', err);
    return res.status(400).json({
      error: err.message || 'PayPal create failed',
    });
  }
});

/**
 * Capture PayPal order
 */
router.post('/paypal/capture', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'orderId is required',
      });
    }

    const data = await captureOrder(orderId);
    return res.json(data);
  } catch (err) {
    console.error('PayPal capture error:', err);
    return res.status(400).json({
      error: err.message || 'PayPal capture failed',
    });
  }
});

module.exports = router;

