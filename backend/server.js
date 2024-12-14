import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { connect } from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


dotenv.config()
connect();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});