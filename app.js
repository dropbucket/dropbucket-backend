import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import fileRouter from './src/routes/fileRoute.js';
import folderRouter from './src/routes/folderRoute.js';
import favoritesRouter from './src/routes/favoritesRoute.js';

const app = express();
const __dirname = path.resolve();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/file', fileRouter);
app.use('/folder', folderRouter);
app.use('/favorites', favoritesRouter);

export default app;