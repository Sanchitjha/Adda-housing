/**
 * Firebase Admin Configuration
 * Push Notifications Setup
 */

const admin = require('firebase-admin');
const logger = require('../utils/logger');

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    logger.info('Firebase Admin initialized successfully');
  }
  return admin;
};

// Send push notification to specific device
const sendNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      token
    };
    
    const response = await admin.messaging().send(message);
    logger.info(`Notification sent: ${response}`);
    return response;
  } catch (error) {
    logger.error('Error sending notification:', error.message);
    throw error;
  }
};

// Send notification to multiple devices
const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      tokens
    };
    
    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info(`Multicast sent: ${response.successCount} successful, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    logger.error('Error sending multicast:', error.message);
    throw error;
  }
};

// Send notification to topic
const sendTopicNotification = async (topic, title, body, data = {}) => {
  try {
    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      topic
    };
    
    const response = await admin.messaging().send(message);
    logger.info(`Topic notification sent: ${response}`);
    return response;
  } catch (error) {
    logger.error('Error sending topic notification:', error.message);
    throw error;
  }
};

module.exports = { 
  initializeFirebase, 
  sendNotification, 
  sendMulticastNotification, 
  sendTopicNotification 
};
