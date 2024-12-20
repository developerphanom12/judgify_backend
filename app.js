import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import admin from './routes/adminRoutes.js'
import admins from './routes/routes.js'
import user from './routes/userRoutes.js'
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use(express.json());          

app.use(cors({ origin: true }));


const port = process.env.PORT || 6000;


app.use('/api/admin', admin)

app.use('/api/user',user)

app.use('/api/admins',admins)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on Port:${port}`);
});