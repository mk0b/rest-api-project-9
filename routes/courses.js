const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { Course } = require('../models').models;

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
    //TODO: Once this is working include the User info as well.
    //.status(200) Might not have to add this I think it's the default ok code.
}));

//GET  /api/courses/:id - 200 - Returns the course (including
//the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    console.log(course);
    res.json(course);
}));

//POST  /api/courses - 201 - Creates a course, sets the Location header
//to the URI for the course, and returns no content.

//PUT  /api/courses/:id - 204 - Updates a course and returns no content

//DELETE  /api/courses/:id - 204 - Deletes a course and returns no content

module.exports = router;