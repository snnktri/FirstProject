import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const connectDB = async () => {
    try {
        const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

            console.log(`\n Mongo Db connected !! DB Host: ${connectionInstances.connection.host}`);
    }
    catch (error) {
        console.error(`Error during mongo db connect: ${error}`)
        process.exit(1);
    }//netstat -ano | findstr :8000   and taskkill /PID <PID> /F

}

export default connectDB;