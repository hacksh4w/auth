const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')


//@desc Register new user
//@route POST api/users
//@access PUBLIC
const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password } = req.body 

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exists
    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error( 'user LAREADY EXISTS')
    }

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    if(user) {
        return res.status(201).json({
            _id: user.id, 
            name: user.name,
            email: user.email,
            token: generateToken(user._id), //here, becuz when u register automatically logged in aanu, so enthaylum JWT token venam sooo
        })
    } else  {
        res.status(400)
        throw new Error('Invalid User Data')
    }
})

//@desc Authenticate a user
//@route POST api/users/login
//@access PUBLIC
const loginUser = asyncHandler(async (req,res) => {
    const { email, password } = req.body

    //Check for user email
    const user = await User.findOne({ email })
    if(user && (await bcrypt.compare(password, user.password))){
        return res.json ({
            _id: user.id, 
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
         //needed for callbackfns to stop header file error
        
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

//@desc GET user data
//@route GET api/users/me
//@access PUBLIC
const getMe = asyncHandler(async (req,res) => {
    res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn : '30d',
    })
}

module.exports = {
    registerUser, 
    loginUser, 
    getMe
}