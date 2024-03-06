const mongoose = require('mongoose');
const category = require('./category');


const bookSchema = new mongoose.Schema({
    name : String,
    author : String,
    description : String,
    numberOfPages : Number,
    stock : {type: Number},
    image : String,
    
    categories : [{
        type : mongoose.Types.ObjectId,
        ref : 'Category',
        require : true
    }],
    categoryName : [{type : String}]
})

bookSchema.pre("save", async function (next) {
    try{
        if(this.isModified("categories") || this.isNew) {
            const populatedBook = await this.model("books").populate(this, {
                path: "categories",
            });
            this.categoryName = populatedBook.categories.map(
                (category) => category.name
            );
        }
        next();
    } catch (error){
        next(error);
        console.log();
    }
})

module.exports = mongoose.model('books', bookSchema);