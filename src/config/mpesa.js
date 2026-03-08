const axios = require('axios');
const logger = require('../utils/logger');

const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';
const PROD_BASE    = 'https://api.safaricom.co.ke';

const BASE_URL = process.env.MPESA_ENVIRONMENT === 'production' ? PROD_BASE : SANDBOX_BASE;

// ─────────────────────────────────────────────
//  Get OAuth access token
//  Tokens expire after 1 hour — in production use
//  Redis to cache this token.
// ─────────────────────────────────────────────

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (error) {
    logger.error('M-Pesa token fetch failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

// ─────────────────────────────────────────────
//  Generate STK Push password
// ─────────────────────────────────────────────

function generatePassword(timestamp) {
  const raw = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

function getTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

// ─────────────────────────────────────────────
//  STK Push  (Lipa Na M-Pesa Online)
//  Sends a payment prompt to the customer's phone.
// ─────────────────────────────────────────────

/**
 * @param {string} phone    - Customer phone in format 2547XXXXXXXX
 * @param {number} amount   - Amount in KES (integer)
 * @param {string} orderId  - Your internal order ID
 * @returns {Object}        - Safaricom response with CheckoutRequestID
 */
async function initiateSTKPush({ phone, amount, orderId }) {
  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = generatePassword(timestamp);

  // Normalize phone number to 2547XXXXXXXX format
  const normalizedPhone = phone.replace(/^(\+254|0)/, '254');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.ceil(amount),   // M-Pesa requires integer
    PartyA:            normalizedPhone,
    PartyB:            process.env.MPESA_SHORTCODE,
    PhoneNumber:       normalizedPhone,
    CallBackURL:       process.env.MPESA_CALLBACK_URL,
    AccountReference:  `ORD-${orderId}`.slice(0, 12), // Max 12 chars
    TransactionDesc:   'Purchase on Marketplace',
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    logger.info(`STK Push initiated for order ${orderId}:`, response.data.CheckoutRequestID);
    return response.data;
  } catch (error) {
    logger.error('STK Push failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'M-Pesa payment initiation failed');
  }
}

// ─────────────────────────────────────────────
//  Query STK Push status
//  Use this if callback is delayed (poll after 30s)
// ─────────────────────────────────────────────

async function querySTKStatus(checkoutRequestId) {
  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = generatePassword(timestamp);

  try {
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password:          password,
        Timestamp:         timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    logger.error('STK query failed:', error.response?.data || error.message);
    throw new Error('Failed to query M-Pesa transaction status');
  }
}

// ─────────────────────────────────────────────
//  Parse STK callback from Safaricom
//  Returns a normalized result object
// ─────────────────────────────────────────────

function parseSTKCallback(callbackBody) {
  const body       = callbackBody.Body?.stkCallback;
  const resultCode = body?.ResultCode;
  const resultDesc = body?.ResultDesc;
  const checkoutId = body?.CheckoutRequestID;

  if (resultCode !== 0) {
    // Payment failed or was cancelled
    return { success: false, checkoutId, resultCode, resultDesc };
  }

  // Extract M-Pesa receipt from CallbackMetadata
  const metadata = body?.CallbackMetadata?.Item || [];
  const get = (name) => metadata.find((i) => i.Name === name)?.Value;

  return {
    success: true,
    checkoutId,
    resultCode,
    resultDesc,
    mpesaReceiptNo: get('MpesaReceiptNumber'),
    amount:         get('Amount'),
    phoneNumber:    get('PhoneNumber'),
    transactionDate: get('TransactionDate'),
  };
}

module.exports = { initiateSTKPush, querySTKStatus, parseSTKCallback };