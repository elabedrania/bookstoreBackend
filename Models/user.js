const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId : {type : String},
    username : {type : String, required : true, unique : true},
    email : {type : String, require : true, unique : true},
    password : {type : String, required : true},
    isAdmin : {type : Boolean, default : false},
    isActive : {type : Boolean, default : false},
    reservations : [{ type : mongoose.Schema.Types.ObjectId, ref : "reservations"}]
})

module.exports = mongoose.model('users', userSchema);