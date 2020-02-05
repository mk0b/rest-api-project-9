const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { User } = require('../models').models;

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
    await User.create(req.body);
    res.status(201).location('/').end();

}));

module.exports = router;