import express from 'express';
import cors from 'cors';
import { healthcheck } from './controllers/healthckeck.js';
import dotenv from "dotenv/config"


const app = express();

app.get(
  cors({
    origin: process.env.CORS,
    credentials: true,
  })
);

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.static('public'));


app.get("/healthcheck", healthcheck)

export {app}