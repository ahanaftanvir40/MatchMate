import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connect } from './config/db.js';
// import upload from './config/multer.config.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import matchRoutes from './routes/matchRoutes.js';


dotenv.config()
connect();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3001;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

const __dirname = path.resolve();
app.use('/public', express.static(path.join(__dirname, 'public')));


//routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

//MatchMaking-Discovery Routes
app.use('/api/match', matchRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});