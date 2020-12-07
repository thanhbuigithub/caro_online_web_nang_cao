const express = require('express');
const router = express.Router();

// const requireSignin = expressJwt({
//     secret: '176168hdsd821ie1iKDW'
// });
const { requireSignin, requireAdmin } = require('../controllers/authUser.controller');
const { readController, updateController } = require('../controllers/user.controller');

router.get('/proflie', requireSignin, readController);
router.put('/update', requireSignin, requireAdmin, updateController);

module.exports = router;