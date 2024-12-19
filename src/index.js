import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { Db_Name } from './constant';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB();











// import express from 'express';
// const app = express();

// //connect to db

// ;( async ()=> {
//     try {
//         await mongoose.connect(`${procee.env.MONGODB_URI}/
//             ${Db_Name}`)
//             app.on("error", (error)=> {
//                 console.log("Error")
//                 throw error;
//             })

//             app.listen(process.env.PORT, ()=> {
//                 console.log(`app is listingni on port: ${process.env.PORT}`)
//             })
//     }

//     catch(error) {
//         console.error('Error:', error);
//         throw error;
//     }
// })()