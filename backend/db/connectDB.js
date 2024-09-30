//import mongoose package
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("monoDb_uri:", process.env.MONGO_URL);
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`mongooeDb connected :${conn.connection.host}`);
  } catch (error) {
    console.log("error connection to mongoDB, ", error.message);
    process.exit(1); //1 is failure, 0 status code is sucess
  }
};
