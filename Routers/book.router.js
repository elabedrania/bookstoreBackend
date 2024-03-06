const express = require('express');
const router = express.Router();
const multer = require('multer');
const bookController = require('../Controllers/book.controller');
const book = require('../Models/book');
//route.post('/addBook', upload.any('image'), bookController.addBook);


filename='';
const myStorage = multer.diskStorage({
    destination : './upload',
    filename: (req, file , redirection)=>{
        let fl = Date.now()+ '.' + file.mimetype.split('/')[1];
        filename=fl;
        redirection(null, fl);

    }
})

const upload = multer({storage: myStorage});

router.post('/addBook',upload.any('image'), (req,res)=>{
    let data = req.body;
    let emp = new book(data);
    emp.image = filename
    emp.save()
        .then(
            (result)=>{
                filename = '';
                res.send(result);
            }
        )
        .catch(
            (err)=>{
                res.send(err);
            }
        )
})





router.get('/getAllBooks', bookController.getAllBooks);

router.delete('/deleteBook/:id', (req,res)=>{
    let myId = req.params.id;

    book.findByIdAndDelete({ _id: myId})
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

router.get('/getById/:id', (req,res)=>{
    let id = req.params.id;
    book.findOne({_id : id})
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

router.put('/updateBook/:id', upload.any('image'), (req,res)=>{
    let id = req.params.id;
    let newData = req.body;

    if(filename.length>0){
        newData.image = filename;
    }

    book.findByIdAndUpdate({_id : id} , newData)
    .then(
        (result)=>{
            filename = '';
            res.send(result);
        }
    )
    .catch(
        (err)=>{
            res.send(err);
            console.log(err);
        }
    )
})

module.exports = router;