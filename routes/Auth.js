const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = process.env.JWT_SECRET


// Route 1: Create user using: POST "/api/auth/createuser". No Login required
router.post('/createuser', [
    body('name').isLength({ min: 3 }),
    body('email', "Please enter valid Email").isEmail(),
    body('password', "Please enter a valid Password").isLength({ min: 5 }),
    body('gender').not().isEmpty()],
    async (req, res) => {
        let success = false;
        //If there are errors then return Bad request and return error message in response 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        try {
            // Check whether the user with this email exist already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success, error: "User Already Exist" });
            }

            success = true;
            const salt = await bcrypt.genSalt(10);
            const secpass = await bcrypt.hash(req.body.password, salt);

            // Creating new user using Mongoose userSchema Model
            let newUser = await User.create({
                name: req.body.name,
                gender: req.body.gender,
                email: req.body.email,
                password: secpass
            })

            // Sending JWT to user for authentication
            const data = { id: newUser.id }
            const authToken = jwt.sign(data, JWT_SECRET)
            res.json({ success, authToken });

        }

        catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Internal Server Error" })
        }

    }
)


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {

    let success = false;
    //If there are errors then return Bad request and return error message in response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    // Validating the user by comparing the email and password provided with email and password stored in database 
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        let passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        success = true;
        // If credentials match correctly, then sending JWT using user-ID and JWT_SECRET
        const data = { id: user.id }
        const authToken = jwt.sign(data, JWT_SECRET)
        // res.cookie("authToken", authToken);
        res.json({ success, authToken });
    }

    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})


//ROUTE 3: Get logged-in User details using: POST "/api/auth/getuser".login required
router.get('/getuser', fetchuser, async (req, res) => {
    let success = false;
    try {
        const userID = req.user.id;
        const user = await User.findById(userID).select("-password");
        res.json(user)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success,error:"Internal Server Error, Please Login again !"})
    }
})



module.exports = router;