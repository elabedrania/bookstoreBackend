const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
    },
    items: [
        {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "books",
                required: true,
            },
            quantity: {type: Number, required: true},
        }
    ],
    status: {type: String, default: "pending"},
    fullName : {type : String, required : true},
    subtotal : {type: Number, required: true},
    total: {type: Number, required: true},
    phoneNumber: {type: String, required : true}
})

module.exports = mongoose.model('reservations', reservationSchema);