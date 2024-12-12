import mongoose from "mongoose";

export async function connect() {
    try {
        mongoose.connect(process.env.MONGODB_URI)
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log('Database connected');
        })
        connection.on('error', (error) => {
            console.log('Error connecting to database', error);
        })
    } catch (error) {
        console.log('An error occurred: ', error);
    }
}