const router = require('express').Router();

router.use('/auth',         require('./auth'));
router.use('/users',        require('./users'));
router.use('/skills',       require('./skills'));
router.use('/sessions',     require('./sessions'));
router.use('/achievements', require('./achievements'));
router.use('/leaderboard',  require('./leaderboard'));
router.use('/analytics',    require('./analytics'));
router.use('/capsule',      require('./capsule'));
router.use('/github',       require('./github'));

module.exports = router;
