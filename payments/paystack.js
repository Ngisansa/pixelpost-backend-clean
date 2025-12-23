const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET) {
  console.warn('⚠️ PAYSTACK_SECRET_KEY not set');
}

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize Paystack payment (KES)
 * NOTE: amount MUST already be in kobo (KES * 100)
 */
async function initializePayment(reference, email, amountKobo) {
  try {
    const res = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        reference,
        email,
        amount: amountKobo,
        currency: 'KES',
        channels: ['card', 'bank', 'ussd'], // ✅ SAFE channels
        metadata: {
          custom_fields: [
            {
              display_name: 'Platform',
              variable_name: 'platform',
              value: 'PixelPost Scheduler',
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.data.data;
  } catch (err) {
    console.error(
      '❌ Paystack RAW error:',
      err.response?.data || err.message
    );
    throw new Error('Paystack rejected the request');
  }
}

async function verifyPayment(reference) {
  const res = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    }
  );

  return res.data.data;
}

module.exports = {
  initializePayment,
  verifyPayment,
};
