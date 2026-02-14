import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // yha maine ek bug dekho jisme tha ki miane '' ye single quotes use kiye the to wo string ko read nhi kar pa rha tha, to maine `` ye backticks use kiye to wo string ko read kar pa rha hai, to aap bhi aise hi backticks use kijiye
    } catch (error) {
        console.log("MONGODB connection FAILED:", error);
        process.exit(1);
    }
}

export default connectDB;