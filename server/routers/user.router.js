const express = require("express");
const router = express.Router();

// const requireSignin = expressJwt({
//     secret: '176168hdsd821ie1iKDW'
// });
const {
  requireSignin,
  requireAdmin,
} = require("../controllers/authUser.controller");
const {
  readController,
  updateController,
} = require("../controllers/user.controller");
const verifyToken = require("../helpers/verifyToken");

router.get("/profile", requireSignin, verifyToken, readController);
router.put(
  "/update",
  requireSignin,
  requireAdmin,
  verifyToken,
  updateController
);

module.exports = router;
