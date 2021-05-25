import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import filesRouter from './src/routes/filesRoute.js';
import favoritesRouter from './src/routes/favoritesRoute.js';
import shareRouter from './src/routes/shareRoute.js';

const app = express();
const __dirname = path.resolve();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/files', filesRouter);
app.use('/favorites', favoritesRouter);
app.use('/share', shareRouter);

export default app;
