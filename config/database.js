const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const isLocal = process.env.MONGODB_URI.includes('localhost');
    console.log(`✅ MongoDB ${isLocal ? 'Local' : 'Atlas'} connected - ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
