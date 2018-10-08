var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
<<<<<<< HEAD
  res.render('index', { title: 'EasyDrive API' });
=======
  res.render('index', { title: 'Express' });
>>>>>>> 1868b969b31524618c986b64397002e04f625627
});

module.exports = router;
