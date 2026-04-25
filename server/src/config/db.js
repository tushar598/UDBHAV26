import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected succesfully");
  } catch (err) {
    console.error("MongoDB connnection failed:", err.massage);
    process.exit(1);
  }
};

export default connectDB;
