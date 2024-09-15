const jwt = require('jsonwebtoken')
// const secretKey = '123456'
const User = require('../models/userModel')
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')


//multer
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads')
    },
    filename: function(req,file,cb){
        const fn = crypto.randomBytes(8).toString('hex')+path.extname(file.originalname)
        cb(null, fn)
    }
})
const upload = multer({storage:storage})



//authentication
const authenticate = async function(req,res,next){
    try{
        const token = req.cookies.token
        if(!token){
            return res.status(400).json('No cookies Found')
        }
        const decoded = jwt.verify(token,process.env.SECRET_KEY)
        if(!decoded){
            return res.status(400).json('cookies are incorrect')
        }
        req.userId = decoded.id
        next()
    }
    catch(error){
        return res.status(400).json(error)
    }
}


//Admin
const adminCheck = async function(req,res,next){
    try{
        const currentUser = await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('Current User not found')
        }
        if(currentUser.role !== "admin"){
            return res.status(400).json('Admin is not found')
        }
        next()
    }
    catch(error){
        return res.status(400).json(error)
    }
}



module.exports = {authenticate, adminCheck,upload}