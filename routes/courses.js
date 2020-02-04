const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');

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

//GET  /api/courses - 200 - Returns a list of courses 
//(including the user that owns each course)

//GET  /api/courses/:id - 200 - Returns the course (including
//the user that owns the course) for the provided course ID

//POST  /api/courses - 201 - Creates a course, sets the Location header
//to the URI for the course, and returns no content.

//PUT  /api/courses/:id - 204 - Updates a course and returns no content

//DELETE  /api/courses/:id - 204 - Deletes a course and returns no content