import mongoose from 'mongoose';
import { DATABASE_NAME } from '../constant.js';

export async function connectToDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DATABASE_NAME}`
    );
    console.log(
      'Connected to database : DB HOST ',
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log('Failed to connect to database ', error);
    process.exit(1);
  }
}
