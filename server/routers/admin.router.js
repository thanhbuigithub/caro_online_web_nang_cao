const express = require("express");
const router = express.Router();

const { loginController } = require("../controllers/authAdmin.controller");
const { validatorSignIn } = require("../helpers/validator");
const verifyToken = require("../helpers/verifyToken");

router.post("/login", validatorSignIn, loginController);

module.exports = router;
