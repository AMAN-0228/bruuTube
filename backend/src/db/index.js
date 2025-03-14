import mongoose from 'mongoose'
import config from './config.js';
export const connectDB = async () => {
    try {
        const connectionString = config.getConnectionString();
        const DB_NAME = config.getDBName();
        console.log({connectionString, DB_NAME});
        
        const conn = await mongoose.connect(`${connectionString}/${DB_NAME}`);
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection failed",error)
        process.exit(1)
    }
}