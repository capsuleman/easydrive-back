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
router.get('/', VerifyToken, function(req, res) {
    User.findById(req.userId).exec()
    .then(user => {
        if (!user.admin) return res.status(401).send('You must have admin rights.');
        return UsersGroup.find().exec()
    })
    .then(groups => {return res.status(200).json(groups)})
    .catch(_ => {return res.status(500).send('There was a problem getting the groups.')})
});

// GET AN USERSGROUP WITH ID
// Access only granted to admins of the group and admin team.
router.get('/:id', VerifyToken, function(req, res) {
    Promise.all([
        User.findById(req.userId).exec(),
        UsersGroup.findById(req.params.id).exec()
    ])
    .catch(_ => {return res.status(404).send('This group does not exist.')})
    .then(result => {
        [user, group] = result;
        if (!(user.admin || group.listAdmin.indexOf(req.userId) > -1)) return res.status(401).send('You must be admin of the group.');
            res.status(200).json(group);
    })
    .catch(_ => {return res.status(500).send('There was a problem getting the group.')})
});

// CREATION OF AN USERSGROUP
// Anybody can create a group.
// It has to provide a JSON with name, type and emails of the users. 
// Creator is automaticly added to the group with admin rights.
router.post('/', VerifyToken, function(req, res) {
    User.find({email : {$in : req.body.emails}}).exec()
    .then(users => {
        var listUser = users.map(x => String(x._id));
        if (listUser.indexOf(req.userId) === -1) listUser.push(req.userId);
        listUser = listUser.filter(function(item, pos) {return listUser.indexOf(item) == pos});
        return UsersGroup.create({
            name: req.body.name,
            type: req.body.type,
            listUser: listUser,
            listAdmin: [req.userId],
            listRide: [],
            listVehicule: []
        })
        .then(group => {return [listUser, group]});
    })
    .then(result => {
        [listUser, group] = result;
        res.status(201).json({id: group._id, nbUsers: listUser.length, listUser: listUser})
        return Promise.all(listUser.map(id => {
            return User.findById(id).exec()
            .then(user => {
                user.listUsersGroup.push(group._id);
                return user.save()
            })
        }))
    })
    .catch(_ => {return res.status(500).send('There was a problem registering the group.')});
});


// ADD NEW MEMBERS TO AN USERSGROUP
// Only admin of a group or admin team can do this.
// It has to provide an emails list.
router.post('/:id/addusers', VerifyToken, function(req, res) {
    Promise.all([
        User.findById(req.userId).exec(),
        UsersGroup.findById(req.params.id).exec()
    ])
    .then(result => {
        [user, group] = result;
        if (!group) return res.status(404).send('This group does not exist.');
        if (!(user.admin || group.listAdmin.indexOf(req.userId) > -1)) return res.status(401).send('You must be admin of the group.');
        return Promise.all(req.body.emails.map(email => {
            return User.findOne({email: email}).exec()
            .then(newuser => {
                if (newuser) {
                    if (newuser.listUsersGroup.indexOf(group._id) == -1) {
                        newuser.listUsersGroup.push(group._id);
                        return newuser.save();
                    } else {
                        return newuser;
                    }
                }
            })
            .catch(_ => {return res.status(500).send('There was a problem adding users.')});
        }));
    })
    .then(result => {
        const filteredResult = result.filter(x => x && x._id).map(x => String(x._id));
        const cpt = filteredResult.length - group.listUser.length;
        group.listUser = group.listUser.concat(filteredResult);
        group.listUser = group.listUser.filter(function(item, pos) {return group.listUser.indexOf(item) == pos});
        return group.save().then(newgroup => {return [newgroup, cpt]});
    })
    .then(result => {
        [newgroup, cpt] = result;
        return res.status(200).json({id: newgroup._id, modified: cpt, newListUser: newgroup.listUser});
    })
    .catch(_ => {return res.status(500).send('There was a problem adding users.')});
});


module.exports = router;