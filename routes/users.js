const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { User } = require('../models').models;
const bcryptjs = require('bcryptjs');

//TODO: Set validation

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

//GET  /api/users - 200 - Returns the currently authenticated user.
//TODO: Make it so I only get the currently authenticated user.
router.get('/users', asyncHelper(async(req, res) => {
    const users = await User.findAll();
    res.json(users);
}));

//POST  /api/users - 201 - Creates a user, sets the Location header to "/",
//and returns no content.
router.post('/users', asyncHelper(async(req, res) => {
    try {
        const user = req.body;
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