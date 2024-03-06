const express = require('express');
require('dotenv').config();
const app = express();

const mongoose = require('mongoose');
const cors = require("cors");
app.use(express.json());


const categoryRouter = require('./Routers/category.router');
app.use('/categories', categoryRouter);
const bookRouter = require('./Routers/book.router');
app.use('/books', bookRouter);
const userRouter = require("./Routers/authRoute");
app.use('/auth', userRouter);


mongoose.connect(process.env.CONNECTION_STRING , {
    useNewUrlParser : true,
    useUnifiedTopology : true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error :"));
db.once("open", function(){
    console.log("Database connected successfully ...");
})






app.listen(process.env.PORT , ()=>{
    console.log(`app listening on port ${process.env.PORT}`);
})