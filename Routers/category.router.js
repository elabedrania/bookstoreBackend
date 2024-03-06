const express = require('express');
const route = express.Router();
const category = require('../Models/category');

const categoryController = require('../Controllers/category.controller');

route.post('/addCategory', categoryController.addCategory);
route.get('/getAllCategories', categoryController.getAllCategories);


route.delete('/deleteCategory/:id', (req,res)=>{
    let myId = req.params.id;

    category.findByIdAndDelete({ _id: myId})
        .then(
            (result)=>{
                res.send(result);
            }
        )
        .catch(
            (err)=>{
                res.send(err);
            }
        )
})



module.exports = route;