import mongoose from "mongoose"

const connectMongoDB = async () =>{
    // if (mongoose.connections[0].readyState) {
    //     // Use the existing database connection
    //     return;
    // }
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB",process.env.MONGODB_URI);

    } catch(error){
        console.log(error);
        // console.log("Not to MongoDB",process.env.MONGODB_URI);
    }
};

export default connectMongoDB;