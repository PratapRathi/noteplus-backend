const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/Noteplus"


const connectToMongo = async(mongoURI)=>{
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB Successfully");
}

module.exports = connectToMongo;