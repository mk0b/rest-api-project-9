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
//TODO: Am I setting the location correctly? I don't see any change in postman.
router.post('/courses', asyncHelper(async(req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).location(`/api/courses/${course.id}`).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors;
            res.status(400).json(errors);
        } else {
            throw error;
        }
    }
}));

//PUT updates a course and returns no content
router.put('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    try {
        await course.update(req.body);
        res.status(204).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors;
            res.status(400).json(errors);
        } else {
            throw error;
        }
    }
}));

//DELETE  /api/courses/:id - 204 - Deletes a course and returns no content
router.delete('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
}));

module.exports = router;