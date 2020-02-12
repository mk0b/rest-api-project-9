const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { Course, User } = require('../models').models;
//bcryptjs for hashing password
const bcryptjs = require('bcryptjs');
//for user authentication
const auth = require('basic-auth');

/* HELPER FUNCTIONS */

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
    let message;

    //if user creds are available
    if (credentials) {
        //try to retrieve username from the db
        const user = await User.findOne({ where: { emailAddress: credentials.name }});

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
router.post('/courses', authenticateUser, asyncHelper(async(req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).location(`/api/courses/${course.id}`).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json(errors);
        } else {
            throw error;
        }
    }
}));

//PUT updates a course and returns no content
router.put('/courses/:id', authenticateUser, asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);

    //wrapping everything in an if to check and make sure title and desc exist in request.
    if (req.body.title && req.body.description) {
        //comparing the current user ID with the user owner of the course's id.
        if (req.currentUser.id === course.userId) {
            try {
                await course.update(req.body);
                res.status(204).end();
            } catch (error) {
                if (error.name === 'SequelizeValidationError') {
                    const errors = error.errors.map(err => err.message);
                    res.status(400).json(errors);
                } else {
                    throw error;
                }
            }
        } else {
            //if it does not match, access denied
            res.status(403).json('Access Denied. This user does not own this course.');
        }
    } else {
        res.status(400).json('Title & Description are required.');
    }
}));

//DELETE deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHelper(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
    
        //comparing the current user ID with the user owner of the course's id.
        if (req.currentUser.id === course.userId) {
                await course.destroy();
                res.status(204).end();
        } else {
            //if it does not match, access denied
            res.status(403).json('Access Denied. This user does not own this course.');
        }
}));

module.exports = router;