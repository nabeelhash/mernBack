const express = require('express');
const router = express.Router();
const User = require('../models/userModel')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const secretKey = '123456'
const {body,validationResult} = require('express-validator');
const {authenticate} = require('../middlewares/middleware')
const {adminCheck} = require('../middlewares/middleware')


//register
const registerValidate = [
    body('name').isLength({min: 1}).withMessage('Type Full Name'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({min: 5}).withMessage('Password is short'),
]
router.post('/register',registerValidate,async function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        const checkUser =await User.findOne({email: req.body.email})
        if(checkUser){
            return res.status(400).json('User already exists')
        }
        if(!req.body.confirmPassword){
            return res.status(400).json('Confirm Password field not found')

        }
        if(req.body.password !== req.body.confirmPassword){
            return res.status(400).json('Password not match')
        }
        //brcypt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password,salt)

        const register =await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
        })
        res.status(200).json({message: "New user registered",register})
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})



//login
const loginValidate = [
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({min: 5}).withMessage('Password is short'),
]
router.post('/login',loginValidate,async function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        const checkUser =await User.findOne({email: req.body.email})
        if(!checkUser){
            return res.status(400).json('Email not found. Try another email')
        }
        
        const comparePassword =await bcrypt.compare(req.body.password,checkUser.password)
        if(!comparePassword){
            return res.status(400).json('Password is Incorrect')
        }
        const token = jwt.sign({id: checkUser._id},process.env.SECRET_KEY,{expiresIn: '5h'})
        res.cookie('token',token)
        res.status(200).json({message: "Login successful",checkUser,token})
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})


//logout
router.get('/logout',function(req,res){
    try{
        res.clearCookie('token')
        res.status(200).json('cookie removed')
    }
    catch(error){
        return res.status(400).json(error.message)
    }
    res.clearCookie('token')
    res.send('cookie removed')
})


//authenticate
router.get('/',function(req,res){
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json('No cookies Found')
        }
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        if(!decoded){
            return res.status(400).json('Token is invalid')
        }
        req.userId = decoded.id
        res.status(200).json(req.userId)
    }
    catch(error){
        return res.status(400).json(error)
    }
})


router.get('/check',authenticate, adminCheck,function(req,res){
    res.json(`Hello user ${req.userId}`)
    console.log('hello')
})

module.exports = router
