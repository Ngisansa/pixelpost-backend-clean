/**
 * Firebase Cloud Messaging helper.
 * Requires a service account JSON file path set in FCM_SERVICE_ACCOUNT_PATH env var.
 */

const admin = require('firebase-admin');
const path = require('path');

let app;
function init(){
  if(app) return app;
  const saPath = process.env.FCM_SERVICE_ACCOUNT_PATH;
  if(!saPath) throw new Error('FCM_SERVICE_ACCOUNT_PATH not set');
  const serviceAccount = require(path.resolve(saPath));
  app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return app;
}

async function sendToToken(token, payload){
  init();
  return admin.messaging().sendToDevice(token, { notification: payload });
}

async function sendToTopic(topic, payload){
  init();
  return admin.messaging().sendToTopic(topic, { notification: payload });
}

module.exports = { init, sendToToken, sendToTopic };
