const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Course = require('../models').Course;

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

//GET  /api/courses - 200 - Returns a list of courses 
//(including the user that owns each course)
router.get('/courses', asyncHelper(async(req, res) => {
    const courses = await Course.findAll();
    console.log(courses);
    res.json(courses);
    //.status(200)
}));

//GET  /api/courses/:id - 200 - Returns the course (including
//the user that owns the course) for the provided course ID

//POST  /api/courses - 201 - Creates a course, sets the Location header
//to the URI for the course, and returns no content.

//PUT  /api/courses/:id - 204 - Updates a course and returns no content

//DELETE  /api/courses/:id - 204 - Deletes a course and returns no content

module.exports = router;