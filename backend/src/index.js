import dotenv from 'dotenv';
import { connectToDB } from './db/index.js';
import { app } from './app.js';

// load all envs
dotenv.config();

// connect to databse
connectToDB().then(() => {
  app.on('error', () => {
    console.log('Error occured while starting the server ', error.message);
    process.exit(1);
  });

  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on PORT ${process.env.PORT || 8000}`);
  });
});
