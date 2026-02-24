/**
 * AWS S3 Configuration
 * File Upload/Download Management
 */

const AWS = require('aws-sdk');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'adda-housing-uploads';

// Upload file to S3
const uploadFile = async (file, folder = 'general') => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const data = await s3Client.upload(params).promise();
    logger.info(`File uploaded successfully: ${data.Location}`);
    
    return {
      url: data.Location,
      key: data.Key,
      bucket: BUCKET_NAME
    };
  } catch (error) {
    logger.error('S3 Upload Error:', error.message);
    throw error;
  }
};

// Upload base64 image to S3
const uploadBase64Image = async (base64String, folder = 'general') => {
  try {
    const base64Data = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const matches = base64String.match(/^data:image\/(\w+);base64,/);
    const imageType = matches ? matches[1] : 'jpg';
    const key = `${folder}/${uuidv4()}.${imageType}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: base64Data,
      ContentType: `image/${imageType}`,
      ACL: 'public-read'
    };

    const data = await s3Client.upload(params).promise();
    logger.info(`Base64 image uploaded: ${data.Location}`);
    
    return {
      url: data.Location,
      key: data.Key,
      bucket: BUCKET_NAME
    };
  } catch (error) {
    logger.error('S3 Base64 Upload Error:', error.message);
    throw error;
  }
};

// Delete file from S3
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3Client.deleteObject(params).promise();
    logger.info(`File deleted: ${key}`);
    
    return true;
  } catch (error) {
    logger.error('S3 Delete Error:', error.message);
    throw error;
  }
};

// Get signed URL for private files
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3Client.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    logger.error('S3 Signed URL Error:', error.message);
    throw error;
  }
};

module.exports = {
  s3Client,
  uploadFile,
  uploadBase64Image,
  deleteFile,
  getSignedUrl,
  BUCKET_NAME
};
