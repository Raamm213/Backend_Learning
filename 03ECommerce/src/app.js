import express from 'express';
import cors from 'cors';
// import router from './routes/healthcheck.routes.js';
import { healthcheck } from './controllers/healthcheck.controller.js';
import cookieParser from 'cookie-parser';
import routerUser from './routes/user.routes.js';
// import { registerUser } from './controllers/user.controller.js';
import routerComment from './routes/comment.routes.js';
import routerLike from './routes/like.routes.js';
import routerPlaylist from './routes/playlist.routes.js';
import routerSubscription from './routes/subscription.routes.js';

const app = express();

app.get(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());



// health check api groups
app.get('/api/v1/healthcheck', healthcheck);
// user activity api groups
app.use('/api/v1/users', routerUser);
//comment api groups
app.use('/api/v1/comments', routerComment);
//like api groups
app.use('/api/v1/likes', routerLike);
//playlist api groups
app.use('/api/v1/playlists', routerPlaylist);
//subscriptions api group 
app.use('/api/v1/subscriptions', routerSubscription);



export { app };
