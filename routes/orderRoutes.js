const express = require('express');
const router = express.Router();
const Product = require('../models/productModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel')

const { authenticate } = require('../middlewares/middleware')
const { adminCheck } = require('../middlewares/middleware')
const { upload } = require('../middlewares/middleware')


//create order
router.post('/order',authenticate,async function(req,res){
    try{
        const createOrder = await Order.create({
            user: req.userId,
            shippingInfo: req.body.shippingInfo,
            orderItems: req.body.orderItems,
            paymentInfo: req.body.paymentInfo,
            itemsPrice: req.body.itemsPrice,
            taxPrice: req.body.taxPrice,
            shippingPrice: req.body.shippingPrice,
            totalPrice: req.body.totalPrice,
        })
        res.status(200).json(createOrder)
    }
    catch(error){
        return res.status(500).json({ error: error.message })

    }
})



//get specific order
router.get('/order/:id',authenticate,async function(req,res){
    try{
        const getOrder = await Order.findById(req.params.id).populate('user')
        res.status(200).json(getOrder)
    }
    catch(error){
        return res.status(500).json({ error: error.message })

    }
})

// //update specific order
// router.get('/order/:id',authenticate,async function(req,res){
//     try{
//         const getOrder = await Order.findById(req.params.id).populate('user')
//         res.status(200).json(getOrder)
//     }
//     catch(error){
//         return res.status(500).json({ error: error.message })

//     }
// })


module.exports = router