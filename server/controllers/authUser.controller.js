const User = require('../models/user.model');
const expressJwt = require('express-jwt');
const fetch = require('node-fetch');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandle');
const sgMail = require('@sendgrid/mail');
const client = new OAuth2Client(process.env.GOOGLE_KEY);

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
        const isUserExist = await User.findOne({ email: email });
        if (isUserExist) {
            return res.status(400).json({
                errors: 'The Email already exists',
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
                    errors: 'Liên kết đã hết hạn ! Đăng kí lại'
                })
            } else {
                const { name, email, password } = jwt.decode(token);
                const user = new User({
                    email,
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
                            success: true,
                            user,
                            message: 'Đăng kí tài khoản thành công'
                        });
                    }
                });
            }
        })
    } else {
        return res.json({
            message: 'Xảy ra lỗi ! Vui lòng đăng kí lại',
        });
    }
}

exports.forgotPasswordController = (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            error: firstError
        });
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    errors: 'Tài khoản email không tồn tại'
                });
            }
            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_RESET_PASSWORD,
                {
                    expiresIn: '25m'
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

            return (
                user.updateOne({ resetPassWordLink: token }, (err, user) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Không thể kết nối tới DataBase để Reset PassWord'
                        });
                    } else {
                        sgMail.send(emailMessage).then(sent => {
                            return res.json({
                                message: `Link Reset PassWord đã được gửi tới ${email} `
                            });
                        }).catch(err => {
                            return res.status(400).json({
                                message: err.message
                            });
                        });
                    }
                }
                )
            );

        });
    }
}
exports.resetPasswordController = (req, res) => {
    const { newPassWord, resetPassWordLink } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            errors: firstError
        });
    } else {
        if (resetPassWordLink) {
            jwt.verify(resetPassWordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Liên kết đã hết hạn ! Thử lại'
                    });
                }
                User.findOne({
                    resetPassWordLink
                }).exec((err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: 'Hệ thống có lỗi ! Vui lòng thử lại'
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
                                message: 'Lỗi Reset PassWord'
                            });
                        } else {
                            return res.json({
                                message: 'Đổi mật khẩu thành công'
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
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            errors: firstError
        });
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    errors: 'Tài khoản email chưa đăng kí'
                });
            }
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    errors: 'Email hoặc mật khẩu không trùng khớp'
                });
            }

            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '30d'
                }
            );
            const { _id, name, email, listBoardId } = user;
            return res.json({
                token,
                user: {
                    _id,
                    name,
                    email,
                    listBoardId
                }
            });
            // const { _id, name, email } = user;
            // const listBoardId = user.listBoardId;
            // let resultlistBoard = [];
            // listBoardId.forEach((element, index) => {
            //     Board.findById(element).exec((err, board) => {
            //         if (err || !board) {
            //             return res.json({
            //                 token,
            //                 user: {
            //                     _id,
            //                     name,
            //                     email,
            //                     listBoardId: user.listBoardId,
            //                     resultlistBoard: []
            //                 }
            //             });
            //         } else {
            //             resultlistBoard.push(board);
            //             if (index === listBoardId.length - 1) {
            //                 return res.json({
            //                     token,
            //                     user: {
            //                         _id,
            //                         name,
            //                         email,
            //                         listBoardId: user.listBoardId,
            //                         resultlistBoard: resultlistBoard
            //                     }
            //                 });
            //             }
            //         }

            //     });
            // });

        });
    }
}

exports.googleLoginController = (req, res) => {
    const { idToken } = req.body;

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_KEY }).then(response => {
        const { email_verified, name, email } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    const token = jwt.sign({
                        _id: user._id
                    }, process.env.JWT_SECRET, {
                        expiresIn: '20d'
                    });
                    const { _id, email, name, listBoardId } = user;

                    // const listBoardId = user.listBoardId;
                    // let resultlistBoard = [];
                    // listBoardId.forEach((element, index) => {
                    //     Board.findById(element).exec((err, board) => {
                    //         if (err || !board) {
                    //             return res.json({
                    //                 token,
                    //                 user: {
                    //                     _id,
                    //                     name,
                    //                     email,
                    //                     listBoardId: user.listBoardId,
                    //                     resultlistBoard: []
                    //                 }
                    //             });
                    //         } else {
                    //             resultlistBoard.push(board);
                    //             if (index === listBoardId.length - 1) {
                    //                 return res.json({
                    //                     token,
                    //                     user: {
                    //                         _id,
                    //                         name,
                    //                         email,
                    //                         listBoardId: user.listBoardId,
                    //                         resultlistBoard: resultlistBoard
                    //                     }
                    //                 });
                    //             }
                    //         }

                    //     });
                    // });

                    return res.json({
                        token,
                        user: { _id, email, name, listBoardId }
                    });
                } else {
                    let password = email + process.env.JWT_SECRET;
                    user = new User({ name, email, password });
                    user.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        const token = jwt.sign(
                            { _id: data._id }, process.env.JWT_SECRET, { expiresIn: '20d' }
                        );
                        const { _id, email, name, listBoardId } = data;
                        // const listBoardId = user.listBoardId;

                        // if (!listBoardId || listBoardId.length === 0) {
                        //     return res.json({
                        //         token,
                        //         user: {
                        //             _id,
                        //             name,
                        //             email,
                        //             listBoardId: data.listBoardId,
                        //             resultlistBoard: []
                        //         }
                        //     });
                        // }

                        // let resultlistBoard = [];
                        // listBoardId.forEach((element, index) => {
                        //     Board.findById(element).exec((err, board) => {
                        //         if (err || !board) {
                        //             return res.json({
                        //                 token,
                        //                 user: {
                        //                     _id,
                        //                     name,
                        //                     email,
                        //                     listBoardId: user.listBoardId,
                        //                     resultlistBoard: []
                        //                 }
                        //             });
                        //         } else {
                        //             resultlistBoard.push(board);
                        //             if (index === listBoardId.length - 1) {
                        //                 return res.json({
                        //                     token,
                        //                     user: {
                        //                         _id,
                        //                         name,
                        //                         email,
                        //                         listBoardId: user.listBoardId,
                        //                         resultlistBoard: resultlistBoard
                        //                     }
                        //                 });
                        //             }
                        //         }

                        //     });
                        // });
                        return res.json({
                            token,
                            user: {
                                _id, email, name, listBoardId,
                            }
                        });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Đăng nhập Google thất bại'
            });
        }
    });

}

exports.facebookLoginController = (req, res) => {
    const { userID, accessToken } = req.body;
    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    return (
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then(response => {
            const { email, name } = response;
            User.findOne({ email }).exec((err, user) => {
                if (err) {
                    return response.status(400).json({
                        error: 'Đăng nhập Facebook xảy ra lỗi'
                    })
                } else {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                            expiresIn: '20d'
                        });
                        const { _id, email, name, listBoardId } = user;
                        // const listBoardId = user.listBoardId;
                        // let resultlistBoard = [];
                        // listBoardId.forEach((element, index) => {
                        //     Board.findById(element).exec((err, board) => {
                        //         if (err || !board) {
                        //             return res.json({
                        //                 token,
                        //                 user: {
                        //                     _id,
                        //                     name,
                        //                     email,
                        //                     listBoardId: user.listBoardId,
                        //                     resultlistBoard: []
                        //                 }
                        //             });
                        //         } else {
                        //             resultlistBoard.push(board);
                        //             if (index === listBoardId.length - 1) {
                        //                 return res.json({
                        //                     token,
                        //                     user: {
                        //                         _id,
                        //                         name,
                        //                         email,
                        //                         listBoardId: user.listBoardId,
                        //                         resultlistBoard: resultlistBoard
                        //                     }
                        //                 });
                        //             }
                        //         }

                        //     });
                        // });
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
                            // const listBoardId = user.listBoardId;
                            // let resultlistBoard = [];
                            // if (!listBoardId || listBoardId.length === 0) {
                            //     return res.json({
                            //         token,
                            //         user: {
                            //             _id,
                            //             name,
                            //             email,
                            //             listBoardId: user.listBoardId,
                            //             resultlistBoard: []
                            //         }
                            //     });
                            // }
                            // listBoardId.forEach((element, index) => {
                            //     Board.findById(element).exec((err, board) => {
                            //         if (err || !board) {
                            //             return res.json({
                            //                 token,
                            //                 user: {
                            //                     _id,
                            //                     name,
                            //                     email,
                            //                     listBoardId: user.listBoardId,
                            //                     resultlistBoard: []
                            //                 }
                            //             });
                            //         } else {
                            //             resultlistBoard.push(board);
                            //             if (index === listBoardId.length - 1) {
                            //                 return res.json({
                            //                     token,
                            //                     user: {
                            //                         _id,
                            //                         name,
                            //                         email,
                            //                         listBoardId: user.listBoardId,
                            //                         resultlistBoard: resultlistBoard
                            //                     }
                            //                 });
                            //             }
                            //         }

                            //     });
                            // });
                            return res.json({
                                token,
                                user: {
                                    _id, email, name, listBoardId
                                }
                            });
                        });
                    }
                }

            });
        }).catch(error => {
            res.json({
                error: 'Đăng nhập Facebook không thành công ! Thử lại'
            });
        })
    );
}

// exports.requireSignin = expressJwt({
//     secret: '176168hdsd821ie1iKDW'
// });

