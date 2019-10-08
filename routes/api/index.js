const router = require('express').Router();
const winston = require(`${__basedir}/config/winston`);


router.get('/', function(req, res, next) {
  winston.debug("API CALL")
  res.render('index', { title: 'Express' });
});


module.exports = router;