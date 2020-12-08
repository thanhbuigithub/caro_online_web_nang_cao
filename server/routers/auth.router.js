const express = require('express');
const router = express.Router();

const { registerController, loginController, googleLoginController, facebookLoginController, activeUserController, forgotPasswordController, resetPasswordController } = require('../controllers/authUser.controller');
const { validatorSignUp, validatorSignIn, validatorForgotPassword, validatorResetPassword } = require('../helpers/validator');

router.post('/register', validatorSignUp, registerController);
router.post('/active', activeUserController);
router.post('/login', validatorSignIn, loginController);
router.post('/google_login', googleLoginController);
router.post('/facebook_login', facebookLoginController);
router.put('/forgot_password', validatorForgotPassword, forgotPasswordController);
router.put('/reset_password', validatorResetPassword, resetPasswordController);
module.exports = router;