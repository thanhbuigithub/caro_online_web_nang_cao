const User = require('../models/user.model');
const expressJwt = require('express-jwt');
const fetch = require('node-fetch');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandle');
const sgMail = require('@sendgrid/mail');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

sgMail.setApiKey(process.env.API_KEY);

exports.registerController = async (req, res) => {
    const { username, email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            error: firstError,
        })
    } else {
        const isUserEmailExist = await User.findOne({ email: email });
        if (isUserEmailExist) {
            return res.status(400).json({
                errors: 'The Email already exists',
            })
        }

        const isUsernameExist = await User.findOne({ username: username });
        if (isUsernameExist) {
            return res.status(400).json({
                errors: 'The Username already exists',
            })
        }

        const token = jwt.sign({
            username,
            email,
            name,
            password,
        }, process.env.JWT_USER_ACTIVE, { expiresIn: '10m' });

        const emailMessage = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Email kích hoạt tài khoản',
            html: `<h1>Nhấn vào link bên dưới để kích hoạt tài khoản !!!</h1>
            <p>${process.env.CLIENT_URL}/user/active/${token}</p>
            <hr />`
        }

        try {
            const emailSent = await sgMail.send(emailMessage);
            if (emailSent) {
                return res.json({
                    message: `Email kích hoạt tài khoản đã được gửi tới ${email}`
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: errorHandler(error)
            });
        }
    }
}

exports.activeUserController = (req, res) => {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.JWT_USER_ACTIVE, (err, decoded) => {
            if (err) {
                return res.status(404).json({
                    errors: 'Token Expired ! Signup Again'
                })
            } else {
                const { name, username, email, password } = jwt.decode(token);
                const user = new User({
                    email,
                    username,
                    name,
                    password,
                });
                user.save((err, user) => {
                    if (err) {
                        return res.status(401).json({
                            errors: errorHandler(err),
                        })
                    } else {
                        return res.json({
                            user,
                            message: 'Register successfully!'
                        });
                    }
                });
            }
        })
    } else {
        return res.json({
            message: 'Error something ! Register again',
        });
    }
}

exports.forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        const user = await User.findOne({ email: email });
        if (user) {
            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_RESET_PASSWORD,
                {
                    expiresIn: '10m'
                }
            );
            const emailMessage = {
                from: process.env.MAIL_FROM,
                to: email,
                subject: 'Email Reset Mật Khẩu',
                html: `<h1>Nhấn vào link bên dưới để reset mật khẩu</h1>
                <p>${process.env.CLIENT_URL}/user/password/reset/${token}</p>
                <hr />`
            }
            try {
                const userUpdate = await user.updateOne({ resetPassWordLink: token });
                sgMail.send(emailMessage).then(sent => {
                    return res.json({
                        message: `Link Reset PassWord đã được gửi tới ${email} `
                    });
                }).catch(err => {
                    return res.status(400).json({
                        message: err.message
                    });
                });
            } catch (error) {
                return res.status(400).json({
                    error: errorHandler(error),
                });
            }
        } else {
            return res.status(400).json({
                error: 'Tài khoản email không tồn tại'
            });
        }
    }
}

exports.resetPasswordController = (req, res) => {
    const { newPassWord, resetPassWordLink } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        if (resetPassWordLink) {
            jwt.verify(resetPassWordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Reset link expired ! Try again'
                    });
                }
                User.findOne({
                    resetPassWordLink
                }).exec((err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: 'Something is error ! Try again'
                        });
                    }
                    const passwordObject = {
                        password: newPassWord,
                        resetPassWordLink: ''
                    };
                    user = _.extend(user, passwordObject);
                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                message: 'Error Reset Password'
                            });
                        } else {
                            return res.json({
                                message: 'Change password successfully'
                            })
                        }

                    }
                    )
                });
            })
        }

    }
}

exports.loginController = (req, res) => {
    const { username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        User.findOne({
            username
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Username is wrong'
                });
            }
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: 'Password is wrong'
                });
            }

            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '30d' // Remember me
                }
            );
            const { _id, username, name, email, isAdmin } = user;
            return res.json({
                token,
                user: {
                    _id,
                    username,
                    name,
                    email,
                    isAdmin
                }
            });

        });
    }
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['RS256'], // or algorithms: ['HS256']
});

exports.requireAdmin = async (req, res, next) => {
    const user = await User.findById({ _id: req.user._id });
    if (user) {
        if (user.isAdmin === false) {
            return res.status(400).json({
                error: 'Admin access denied.'
            });
        };
        req.profile = user;
        next();
    } else {
        return res.status(400).json({
            error: 'User not found !'
        });
    }
}

exports.googleLoginController = async (req, res) => {
    const { id_token } = req.body;

    const google_client_res = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT,
    });
    const { email_verified, name, email } = google_client_res.payload;

    if (email_verified) {
        const user = await User.findOne({ email: email });

        if (user) {
            const token = jwt.sign({
                _id: user._id
            }, process.env.JWT_SECRET, {
                expiresIn: '20d'
            });
            const { _id, email, name, username } = user;

            return res.json({
                token,
                user: { _id, email, name, username, isAdmin }
            });
        } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({
                username: email,
                name: name,
                email: email,
                password: password
            });
            try {
                const savedUser = await user.save();
                const token = jwt.sign(
                    { _id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '20d' }
                );
                return res.json({
                    token,
                    user: {
                        _id,
                        email,
                        name,
                        username,
                        isAdmin
                    }
                });
            } catch (error) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
        }
    } else {
        return res.status(400).json({
            error: 'Google Login Error! Try again'
        });
    }

}

exports.facebookLoginController = (req, res) => {
    const { user_id, access_token } = req.body;
    const url = `https://graph.facebook.com/v2.11/${user_id}/?fields=id,name,email&access_token=${access_token}`;
    return (
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then(async (response) => {
            const { email, name } = response;
            const user = await User.findOne({ email: email });
            if (user) {
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                    expiresIn: '20d'
                });
                const { _id, email, name, listBoardId } = user;

                return res.json({
                    token,
                    user: {
                        _id, email, name, listBoardId
                    }
                });
            } else {
                let password = email + process.env.JWT_SECRET;
                user = new User({ name, email, password });
                user.save((err, data) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Đăng kí Facebook không thành công'
                        });
                    }
                    const token = jwt.sign(
                        { _id: data._id },
                        process.env.JWT_SECRET,
                        { expiresIn: '20d' }
                    );
                    const { _id, email, name, listBoardId } = data;

                    return res.json({
                        token,
                        user: {
                            _id, email, name, listBoardId
                        }
                    });
                });
            }
        }).catch(error => {
            res.json({
                error: 'Facebook Login Error! Try again'
            });
        })
    );
}

