const router = require('express').Router();
const logger = require(`${__basedir}/lib/logger`);

router.get('/', (req, res, next) => {
  logger.debug("API CALL")
  res.render('index', { title: 'Express' });
});

module.exports = router;
