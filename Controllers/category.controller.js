const category = require('../Models/category');

exports.addCategory = (req, res) => {

    let data = req.body;
    let cat = new category(data);

    cat.save()
        .then(
            (savedCat)=>{
                res.send(savedCat);
                console.log(savedCat);
            }
        ).catch(
            (err)=>{
                console.log(err);
            }
        )
}

exports.getAllCategories = (req, res) => {
    category.find()
        .then(
            (categories)=>{
                res.send(categories);
                console.log(categories);
            }
        )
        .catch(
            (err)=>{
                console.log(err);
            }
        )
}



