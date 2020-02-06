const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { User } = require('../models').models;
//bcryptjs for hashing password
const bcryptjs = require('bcryptjs');
//for user authentication
const auth = require('basic-auth');

//TODO: The POST /api/users route validates that the provided email 
//address is a valid email address and isn't already associated with 
//an existing user

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
    console.log('Credentials: ', credentials);
    let message;

    //if user creds are available
    if (credentials) {
        //try to retrieve username from the db
        const user = await User.findOne({ where: { emailAddress: credentials.name }});
        console.log('User: ', user);
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
        return false;
    } else {
        return true;
    }
};

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
        console.log('Regex validation: ', isValidEmail(user.emailAddress));
        console.log('Existing Email Validation: ', isExistingEmail(user.emailAddress));
        //TODO: Why is existing email validation not returning true or false?
        //hashing the password before it gets stored.
        user.password = bcryptjs.hashSync(user.password);
        await User.create(user);
        res.status(201).location('/').end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors;
            res.status(400).json(errors);
        } else {
            throw error;
        }
    }
}));

module.exports = router;