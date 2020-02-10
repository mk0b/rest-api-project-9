const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { User } = require('../models').models;
//bcryptjs for hashing password
const bcryptjs = require('bcryptjs');
//for user authentication
const auth = require('basic-auth');

//TODO: Users route fix. Basically do an if check like do below and have the else check the mail stuff?

/* HELPER FUNCTIONS */

/* Helper function to cut down on code for each route to handle async requests.*/
function asyncHelper(callback){
    return async(req, res, next) => {
        try {
            await callback(req, res, next)
        } catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

//custom middleware to handle authentication
const authenticateUser = async(req, res, next) => {
    //parse user creds from the auth header
    const credentials = auth(req);
    let message;

    //if user creds are available
    if (credentials) {
        //try to retrieve username from the db
        const user = await User.findOne({ where: { emailAddress: credentials.name }});

        //if a user was succesfully found
        if (user) {
            //using bcryptjs to compare the hashed password with the credential password
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
            
            //if passwords match
            if (authenticated) {
                //store the found user data on the request object
                //so we have access to the user data in other places
                req.currentUser = user;
            } else {
                message = `Authentication for email address: ${user.emailAddress} `;
            }
        } else {
            message = `User not found for email address: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    //if user auth failed
    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access denied.' })
    } else {
        //if user auth succeeded
        next();
    }
};

//Helper function to use regex to test that the email entered is valid.
const isValidEmail = (emailField) => {
    return /^[^@]+@[^@.]+\.[a-z]+$/i.test(emailField);
};

//Helper function to check if the email already exists in the db.
const isExistingEmail = async(emailField) => {
    const email = await User.findOne({ where: { emailAddress: emailField }});
    if (email) {
        //email does already exist in db
        return true;
    } else {
        //email doesn't already exist in db
        return false;
    }
};

/* ROUTES */

//GET returns the currently authenticated user.
router.get('/users', authenticateUser, asyncHelper(async(req, res) => {
    const user = req.currentUser;
    res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    });
}));

//POST creates a user, sets the Location header to "/", and returns no content.
router.post('/users', asyncHelper(async(req, res) => {
    try {
        const user = req.body;
        let message;

        
        //check if email address if valid
        if (isValidEmail(user.emailAddress)) {
            //check if email already exists
            if (!await isExistingEmail(user.emailAddress)) {
                //create user
                if (user.password) {
                    //if real email address and does not exist in db.
                    //hashing the password before it gets stored.
                    user.password = bcryptjs.hashSync(user.password);
                    await User.create(user);
                    res.status(201).location('/').end();            
                    console.log('User created!');
                } else {
                    res.status(400).json({ errorMessage: 'Please enter a password.' });
                }
            } else {
                //error email already exists.
                message = `${user.emailAddress} already exists in the database.`;
            }
        } else {
            //error email needs to be a valid email format.
            message = 'Please enter an email with a valid email format. Example: megan@email.com.'
        }
        
        //if email validation failed
        if (message) {
            console.warn(message);
            res.status(401).json(message);
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json(errors);
        } else {
            throw error;
        }
    }
}));

module.exports = router;