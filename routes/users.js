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


//POST  /api/users - 201 - Creates a user, sets the Location header to "/",
//and returns no content.

module.exports = router;