require('dotenv').config();
const mongoose = require('mongoose');

const db = mongoose.connect(process.env.DB_URL)
.then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log("Database couldn't be connected");
    console.log(err.message);
})

module.exports = db;