const express = require('express')
const mongoose = require('mongoose')
const app =express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()
//routes
const authRoute = require('./routes/auth')
const productRoute = require('./routes/productRoutes')
const userRoute = require('./routes/userRoutes')
const orderRoute = require('./routes/orderRoutes')
const categoryRoute = require('./routes/categoryRoutes')

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'https://mern-front-nine.vercel.app',
    credentials: true
}))
app.use('/',authRoute)
app.use('/',productRoute)
app.use('/',userRoute)
app.use('/',orderRoute)
app.use('/',categoryRoute)


app.get('/',async function(req,res){
    res.send('hello')
})


//mongoose connection
mongoose.connect(process.env.MONGODB_URI).then(function(){
    console.log('connected to database')
    app.listen(process.env.PORT,function(){
        console.log('connected to port 4000')
    })
}).catch(function(error){
    console.log(error)
})



