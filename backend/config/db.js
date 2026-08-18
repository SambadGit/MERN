const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_demo';

    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully.');
      return;
    } catch (primaryError) {
      console.warn('Primary MongoDB connection failed, trying in-memory MongoDB fallback:', primaryError.message);
    }

    memoryServer = await MongoMemoryServer.create();
    const fallbackUri = memoryServer.getUri();
    await mongoose.connect(fallbackUri, {
      dbName: 'mern_demo',
    });

    console.log('MongoDB connected successfully using in-memory MongoDB.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
