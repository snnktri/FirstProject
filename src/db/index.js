import mongoose from 'mongoose';
import { Db_Name } from '../constant.js';

const connectDB = async () => {
    try {
        const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URI}/
            ${Db_Name}`)

            console.log(`\n Mongo Db connected !! DB Host: ${connectionInstances.connection.host}`);
    }
    catch (error) {
        console.error(`Error during mongo db connect: ${error}`)
        process.exit(1);
    }
}

export default connectDB;