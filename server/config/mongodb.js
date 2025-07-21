import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("✅ Database connected."));

    await mongoose.connect(process.env.MONGODB_URI, {
      // Add these options for Node.js v22+
      ssl: true,
      tlsAllowInvalidCertificates: true, // ⚠️ For development only
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
