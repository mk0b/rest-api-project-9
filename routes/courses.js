const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { Course, User } = require('../models').models;

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

//GET returns a list of courses with the user for each course.
router.get('/courses', asyncHelper(async(req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'userInfo'
            }
        ]
    });
    res.json(courses);
}));

//GET returns a course by ID as well as the User associated with the course.
router.get('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'userInfo'
            }
        ]
    }); 
    res.json(course);
}));

//POST creates a course, sets the Location header to the URI for the course, and returns no content.
//TODO: "Set the location header to the URI for the course" Figure this out then
// remove redirect.
router.post('/courses', asyncHelper(async(req, res) => {
    const course = await Course.create(req.body);
    res.status(201).redirect(`/api/courses/${course.id}`);
}));

//PUT updates a course and returns no content
router.put('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.update(req.body);
    res.status(204).end();
}));

//DELETE  /api/courses/:id - 204 - Deletes a course and returns no content

module.exports = router;