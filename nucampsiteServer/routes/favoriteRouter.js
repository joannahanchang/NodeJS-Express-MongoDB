const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const user = require('../models/user');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user', 'campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const campsitesToCreate = req.body;
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(!favorite) {
            Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
                res.status(200).json(favorite);
            });
        }
        const campsiteIdsToAdd = req.body
            .map((campsite) => campsite._id) 
            .filter((campsiteId) => !favorite.campsites.includes(campsiteId));

        favorites.campsites = [...favorite.campsites, ...campsiteIdsToAdd];

        favorite.save((error, favorite) => {
            if (error) {
                res.status(400).json(error);
                return;
            }
            res.status(200).json(favorite);
        });
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    });
        res.setHeader('Content-Type', 'text/plain');
        res.end(`You do not have any favorites to delete.`);
});
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(!favorites.campsites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }
        res.setHeader('Content-Type', 'text/plain');
        res.end(`The campsite is already in the list of favorites!.`);
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    res.setHeader('Content-Type', 'text/plain');
    res.end(`There are no favorites to delete.`);
});

module.exports = favoriteRouter;