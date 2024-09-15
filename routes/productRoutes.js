const express = require('express');
const router = express.Router();
const Product = require('../models/productModel')
const User = require('../models/userModel')
const { authenticate } = require('../middlewares/middleware')
const { adminCheck } = require('../middlewares/middleware')
const { upload } = require('../middlewares/middleware')



//createProduct
// router.post('/create', authenticate, upload.array('pic', 5), async function (req, res) {
//     try {
//         const currentUser = await User.findById(req.userId)
//         if (!currentUser) {
//             return res.status(400).json('Current user not found')
//         }
//         if (!req.files) {
//             return res.status(400).json('Img not found')

//         }
//         const createProduct = await Product.create({
//             user: req.userId,
//             name: req.body.name,
//             des: req.body.des,
//             price: req.body.price,
//             images: req.files.map(file => file.path), // Collect paths of the uploaded images
//             category: req.body.category.split(',')
//         })
//         res.status(200).json(createProduct)
//     }
//     catch (error) {
//         return res.status(500).json({ error: "Server error" })
//     }
// })

router.post('/createProduct', authenticate, upload.single('pic'), async function (req, res) {
    try {
        const currentUser = await User.findById(req.userId)
        if (!currentUser) {
            return res.status(400).json('Current user not found')
        }
        if(!req.file){
            return res.status(400).json('img not found')

        }
        const createProduct = await Product.create({
            user: req.userId,
            name: req.body.name,
            des: req.body.des,
            price: req.body.price,
            image: req.file.path, 
            category: req.body.category
        })
        res.status(200).json(createProduct)
    }
    catch (error) {
        return res.status(500).json({ error: "Server error" })
    }
})

//allProducts
router.get('/allProducts', async function (req, res) {
    try {
        const allProducts = await Product.find()
        res.status(200).json(allProducts)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})


//singleProduct
router.get('/single/:productId', async function (req, res) {
    try {
        const single = await Product.findById(req.params.productId)
        res.status(200).json(single)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})


//updateProduct
router.patch('/update/:productId', upload.array('pic', 5), async function (req, res) {
    try {
        if (!req.files) {
            return res.status(400).json('Img not found')

        }
        const update = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                name: req.body.name,
                des: req.body.des,
                price: req.body.price,
                images: req.files.map(file => file.path), // Collect paths of the uploaded images
                category: req.body.category.split(',')
            },
            { new: true })
        res.status(200).json(update)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})



//deleteProduct
router.delete('/delete/:productId', async function (req, res) {
    try {
        const deleteProduct = await Product.findByIdAndDelete(
            req.params.productId)
        res.status(200).json(deleteProduct)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})


//review
router.post('/review/:id', authenticate, async function (req, res) {
    try {
        const currentUser = await User.findById(req.userId)
        if (!currentUser) {
            return res.status(400).json('Current user not found')
        }
        const productCheck = await Product.findById(req.params.id)
        if (!productCheck) {
            return res.status(400).json('Product not found')
        }
        const checkCommentIndex = productCheck.reviews.findIndex(review => review.user.toString() === req.userId)
        if (checkCommentIndex !== -1) {
            productCheck.reviews[checkCommentIndex] = { user: req.userId, rating: req.body.rating, comment: req.body.comment }
        }
        else {
            productCheck.reviews.push({ user: req.userId, rating: req.body.rating, comment: req.body.comment })
            productCheck.numOfReviews += 1
        }
        let avg = 0
        productCheck.reviews.forEach((rev) => avg += rev.rating)
        productCheck.rating = avg / productCheck.reviews.length
        await productCheck.save()

        res.status(200).json(productCheck)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})


//delete review
router.post('/reviewDelete/:id/:reviewId', authenticate, async function (req, res) {
    try {
        const currentUser = await User.findById(req.userId)
        if (!currentUser) {
            return res.status(400).json('Current user not found')
        }
        const productCheck = await Product.findById(req.params.id)
        if (!productCheck) {
            return res.status(400).json('Product not found')
        }
        const deleteComment = productCheck.reviews.id(req.params.reviewId)
        if (!deleteComment) {
            return res.status(400).json('Review not found')
        }
        productCheck.reviews = productCheck.reviews.filter(review => review.id.toString() !== req.params.reviewId)
        productCheck.numOfReviews -= 1

        let avg = 0
        productCheck.reviews.forEach((rev) => avg += rev.rating)
        productCheck.rating = avg / productCheck.reviews.length
        await productCheck.save()

        res.status(200).json(productCheck)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})

//filter by name, category and price
router.get('/category', async function (req, res) {
    try {
        const category = req.query.category.split(',')
        const filterCategory = await Product.find({ category: { $in: category } })
        res.status(200).json(filterCategory)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})

router.get('/name', async function (req, res) {
    try {
        const name = req.query.name
        const filterName = await Product.find({ name: { $regex: new RegExp(name, 'i') } })
        res.status(200).json(filterName)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})

router.get('/price', async function (req, res) {
    try {
        const price = req.query.price
        const filterPrice = await Product.find({ price: { $gt: price } })
        res.status(200).json(filterPrice)
    }
    catch (error) {
        return res.status(400).json(error)
    }
})


router.get('/filter', async function (req, res) {
    try {
        const { category, name, price } = req.query;
        const filter = {}
        if (category) {
            const categories = category.split(',')
            filter.category = { $in: categories }
        }
        if (name) {
            filter.name = { $regex: RegExp(name, 'i') }
        }
        if (price) {
            filter.price = { $gt: price }
        }
        const filterProducts = await Product.find(filter)
        res.status(200).json(filterProducts)
    }
    catch (error) {
        return res.status(400).json({ error: error.message })
    }
})


module.exports = router
