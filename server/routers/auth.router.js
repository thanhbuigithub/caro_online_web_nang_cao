const express = require('express');
const router = express.Router();

const { registerController, loginController, googleLoginController, facebookLoginController, activeUserController, forgotPasswordController, resetPasswordController } = require('../controllers/authUser.controller');
const { validatorSignUp, validatorSignIn, validatorForgotPassword, validatorResetPassword } = require('../helpers/validator');

router.post('/register', validatorSignUp, registerController);

module.exports = router;