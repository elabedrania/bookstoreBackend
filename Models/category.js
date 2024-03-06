const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name : String,
    description: { type: String },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = mongoose.model('categories', categorySchema);