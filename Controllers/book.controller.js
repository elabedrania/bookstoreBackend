const express = require('express');
const book = require('../Models/book');


exports.getAllBooks = (req, res) => {
    book.find()
        .then(
            (books)=>{
                res.send(books);
                console.log(books);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
            }
        )
}