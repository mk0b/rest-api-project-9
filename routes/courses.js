const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { Course, User } = require('../models').models;
//bcryptjs for hashing password
const bcryptjs = require('bcryptjs');
//for user authentication
const auth = require('basic-auth');

/* HELPER FUNCTIONS */

//TODO: The PUT /api/courses/:id and DELETE /api/courses/:id routes 
//return a 403 status code if the current user doesn't own the 
//requested course

//compare currentUser to the userID associated with the course record.

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

/* ROUTES */

//GET returns a list of courses with the user for each course.
router.get('/courses', asyncHelper(async(req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'userInfo',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            }
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    });
    res.json(courses);
}));

//GET returns a course by ID as well as the User associated with the course.
router.get('/courses/:id', asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'userInfo',
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            }
        ],
        attributes: {
            exclude: [
                'createdAt',
                'updatedAt'
            ]
        }
    }); 
    res.json(course);
}));

//POST creates a course, sets the Location header to the URI for the course, and returns no content.
//TODO: Am I setting the location correctly? I don't see any change in postman.
router.post('/courses', authenticateUser, asyncHelper(async(req, res) => {
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
router.put('/courses/:id', authenticateUser, asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    console.log('currentUser ID: ', req.currentUser.id);
    console.log('userInfo ID: ', course.userInfo.id);

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

//DELETE deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
}));

module.exports = router;