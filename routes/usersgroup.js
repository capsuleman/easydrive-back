var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var User = require('../models/User');
var UsersGroup = require('../models/UsersGroup');
var VerifyToken = require('../middleware/VerifyToken');


// GET ALL USERSGROUPS
// Access only granted to admin team.
router.get('/', VerifyToken, function(req, res, next) {
    User.findById(req.userId, function(err, user) {
        if (!user.admin) return res.status(401).send('You must have admin rights.');
        UsersGroup.find(function (err, groups) {
            if (err) return res.status(500).send('There was a problem getting the groups.');
            res.status(200).json(groups);
        });
    });
});

// GET AN USERSGROUP WITH ID
// Access only granted to admins of the group and admin team.
router.get('/:id', VerifyToken, function(req, res, next) {
    User.findById(req.userId, function(err, user) {
        if (err) return res.status(500).send('There was a problem getting the group.');
        UsersGroup.findById(req.params.id, function (err, group) {
            if (err) return res.status(500).send('There was a problem getting the group.');
            if (!group) return res.status(404).send('This group does not exist.');
            if (!(user.admin || group.listAdmin.indexOf(req.userId) > -1)) return res.status(401).send('You must be admin of the group.');
            res.status(200).json(group);
        });
    });
});

// CREATION OF AN USERSGROUP
// Anybody can create a group.
// It has to provide a JSON with name, type and emails of the users. 
// Creator is automaticly added to the group with admin rights.
router.post('/', VerifyToken, function(req, res, next) {
    User.find({email : {$in : req.body.emails}}, function (err, users) {
        if (err) return res.status(500).send('There was a problem registering the group.');
        var listUser = users.map(x => String(x._id));
        if (listUser.indexOf(req.userId) === -1) listUser.push(req.userId);
        listUser = listUser.filter(function(item, pos) {return listUser.indexOf(item) == pos});
        UsersGroup.create({
            name: req.body.name,
            type: req.body.type,
            listUser: listUser,
            listAdmin: [req.userId],
            listRide: [],
            listVehicule: []
        },
        async function(err, group) {
            if (err) return next(err);
            if (err) return res.status(500).send('There was a problem registering the group.');
            var proms = Promise.all(listUser.map(id => {
                return new Promise((resolve, reject) => {
                    User.findById(id, function (err, user) {
                        if (err) reject();
                        user.listUsersGroup.push(group._id);
                        User.findByIdAndUpdate(id, user, function (err, res) {
                            if (err) reject();
                            resolve();
                        });
                    });
    
                })
            }));
            proms
            .then(res.status(201).json({id: group._id, nbUsers: listUser.length, listUser: listUser}))
            .catch(res.status(500).send('There was a problem registering the group.'))
        });
    });
});

// ADD NEW MEMBERS TO AN USERSGROUP
// Only admin of a group or admin team can do this.
// It has to provide an emails list.
router.post('/:id/adduser', VerifyToken, function(req, res, next) {
    User.findById(req.userId, function(err, user) {
        if (err) return res.status(500).send('There was a problem adding users.');
        UsersGroup.findById(req.params.id, async function (err, group) {
            if (err) return res.status(500).send('There was a problem adding users.');
            if (!group) return res.status(404).send('This group does not exist.');
            var cpt = 0;
            if (!(user.admin || group.listAdmin.indexOf(req.userId) > -1)) return res.status(401).send('You must be admin of the group.');
            const proms = Promise.all(req.body.emails.map(email => {
                return new Promise((resolve, reject) => {
                    User.findOne({email: email}, function (err, newuser) {
                        if (err) reject(err);
                        if (newuser && newuser.listUsersGroup.indexOf(group._id) == -1) {
                            cpt++;
                            newuser.listUsersGroup.push(group._id);
                            User.findByIdAndUpdate(newuser.id, newuser, function (err, newuser) {
                                if (err) reject(err);
                                group.listUser.push(newuser._id);
                                resolve();
                            });
                        }
                        else resolve();
                    });    
                })
            }));
            proms
            .catch(_ => {return res.status(500).send('There was a problem adding users.')})
            .then(_ => {
                group.listUser = group.listUser.filter(function(item, pos) {return group.listUser.indexOf(item) == pos});
                UsersGroup.findByIdAndUpdate(group._id, group, function (err, newgroup) {
                    if (err) return res.status(500).send('There was a problem adding users.');
                    UsersGroup.findById(newgroup._id, function (err, group) {
                        if (err) return res.status(500).send('There was a problem adding users.');
                        res.status(200).json({id: group._id, modified: cpt, newListUser: group.listUser});
                    })
                });
            });
        });
    });
});


module.exports = router;