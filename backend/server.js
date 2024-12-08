import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});