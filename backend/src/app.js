import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const app = express();

// Global Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes

import adminRouter from './routes/admin.routes.js';
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
  <body>
  
  <h2>ALL IS WELL</h2>
  <img src="https://ramcsays.wordpress.com/files/2009/12/3-idiots-music-album-cover.jpg?w=300" alt="Flowers in Chania" width="460" height="345">
  
  </body>
  </html>`);
});
import userRouter from './routes/user.routes.js';

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);
