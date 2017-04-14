var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var passport  = require('passport');
var passportJWT  = require('passport-jwt');

//https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


// Not the movie transporter!
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vignemaleSTW@gmail.com', // Your email id
        pass: 'vignemale2017' // Your password
    }
});

var appRouter = function(router, mongo, app, config, database) {

    //secret variable JWT
    app.set('secret', config.secret);

    var jwtOptions = {};
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
    jwtOptions.secretOrKey = app.get('secret'); //config.js

    var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
        console.log('payload received', jwt_payload);
        console.log('id', jwt_payload.id);

        //comprueba si el id de la cabecera corresponde con alguno de la bbdd
        mongo.users.find({_id: jwt_payload.id}, function (err, data) {
            if (err) {
                console.log(response);
                next(null,false);
            }
            else {
                next(null,data);
            }
        });
    });
    passport.use(strategy);
    console.log("Hecho passport");


    router.post("/signIn", function (req, res) {
        console.log("signIn user");

        var response = {};
        var email = req.body.email;
        var password = req.body.password;

        //check if some value is empty
        if (!email || !password) {
            response = {"message": "Empty value"};
            console.log(response);
            res.status(400).json(response);
        } else {
            //create the hash to compare with password in db   --> mriar para cifrar en cliente
            var hashPassword = require('crypto')
                .createHash('sha1')
                .update(password)
                .digest('base64');

            mongo.users.find({email: email, password: hashPassword}, function (err, data) {
                //id: jwt_payload.id
                if (err) {
                    response = {"message": "Error fetching user"};
                    console.log(response);
                    res.status(500).json(response);
                } else if (!data[0] || data[0].removed === true) {
                    response = {"message": "Invalid email or password"};
                    console.log(response);
                    res.status(400).json(response);
                }
                //check if the user has verify its account
                else if (data[0].isVerified === false) {
                    response = {"message": "You must verify your account"};
                    console.log(response);
                    res.status(403).json(response);
                }
                //check if is the first time that user sign in
                else if (data[0].firstLogin === true) {
                    response = {"message": "You must change your password", id: data[0]._id};
                    console.log(response);
                    res.status(403).json(response);
                } else {

                    var payload = {id: data[0]._id};
                    var token = jwt.sign(payload, jwtOptions.secretOrKey);
                    //res.json({message: "ok", token: token});

                    //next(null, false); //(null, {id: user.id})

                    /*var token = jwt.sign(data[0], app.get('secret'), {
                     expiresIn: 1440 // expires in 24 hours
                     });*/
                    console.log("Creado token de usuario " + token);

                    //update last access when user access
                    //mirar formato yyyy-mm-dd
                    mongo.users.update({_id: data[0]._id}, {lastAccess: new Date()}, function (err) {
                        if (err) {
                            response = {"message": "Error adding data"}; //token:token};
                            res.status(500).json(response);
                        } else {
                            response = {"message": data[0]._id, token: token};   //send user id or link to profile??
                            res.status(200).json(response);
                        }
                        console.log("Respuesta enviada:" + response);
                    });
                }
            });
        }
    });


    router.post("/signUp", function (req, res) {
        console.log("signUp user");

        var db = new mongo.users;
        var response = {};
        var idUser = "";

        var name = req.body.name;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var birthDate = req.body.birthDate;
        var place = req.body.place;

        //check if some value is empty
        if (!name || !lastName || !email || !birthDate || !place) {
            response = {"message": "Empty value"};
            console.log(response);
            res.status(400).json(response);
        } else {
            // fetch email and password from REST request.
            db.name = name;
            db.lastName = lastName;
            db.email = email;
            db.birthDate = birthDate;
            db.place = place;
            db.creationDate = new Date(); //no esta en formato yyyy-mm-dd
            db.lastAccess = new Date();
            db.isVerified = false;
            db.firstLogin = true;
            db.removed = false;

            //save only if doesn't exist any user with the same email
            mongo.users.find({email: email}, function (err, data) {
                if (err) {
                    response = {"message": "Error fetching data"};
                    //console.log(response);
                    res.status(500).json(response);
                } else if (data.length !== 0) {
                    response = {"message": "Email exists"};
                    console.log(response);
                    res.status(409).json(response);
                } else {
                    db.save(function (err) {
                        if (err) {
                            response = {"message": "Error adding user"};
                            console.log(response);
                            res.status(500).json(response);
                        } else {
                            mongo.users.find({email: email}, function (err, data) {
                                if (err) {
                                    response = {"message": "Error fetching data"};
                                    res.status(500).json(response);
                                } else {
                                    response = {"message": "You will receive a verification mail"};
                                    res.status(201).json(response);

                                    idUser = data[0]._id;
                                    //enviar mail usuario


                                    var url = 'http://localhost:8888/users/'+idUser+'/verifyAccount';
                                    var text = 'Welcome to POIManager.'+
                                        ' please, click the link bellow to confirm yout password.\n'
                                        +url+'\n';



                                    var mailOptions = {
                                        from: 'vignemaleSTW@gmail.com', // sender address
                                        to: email, // list of receivers
                                        subject: 'Confirmation', // Subject line
                                        text: text //, // plaintext body
                                        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                    };

                                    transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            console.log(error);
                                            res.json({yo: 'error'});
                                        }else{
                                            console.log('Message sent: ' + info.response);
                                            res.json({yo: info.response});
                                        }
                                    });

                                }
                            });
                        }
                        console.log(response);
                    });
                }
            });
        }
    });

    router.get('/users/:id/verifyAccount', function (req, res) {
        console.log("verify user");

        //Generate random number, Convert to base-36 and Cut off last 10 chars
        var pass = Math.random().toString(36).slice(-10);
        console.log(pass);
        // Hash the password using SHA1 algorithm.
        var hashPassword= require('crypto').createHash('sha1').update(pass).digest('base64');

        mongo.users.update({_id: req.params.id}, {isVerified: true, password: hashPassword}, function (err) {
            if (err) {
                response = {"message": "Error updating data"};
                res.status(500).json(response);
            } else {

                mongo.users.findById(req.params.id, function (err,data) {
                    if (err) {

                    }else{
                        var text = 'Your password is ' + pass;

                        console.log(data._id);
                        var mailOptions = {
                            from: 'vignemaleSTW@gmail.com', // sender address
                            to: data.email, // list of receivers
                            subject: 'Password', // Subject line
                            text: text //, // plaintext body
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                                res.json({yo: 'error'});
                            }else{
                                console.log('Message sent: ' + info.response);
                                response = {"message": "Account has been verified, you will receive an email with your password"};
                                res.status(200).json(response);
                            };
                        });
                    }
                });
            }
        });
    });



    router.post("/users/:id/changePassword", function (req, res) {
        console.log("change user password");

        //create the hash to save in db   --> cifrar en cliente
        var hashPassword =  require('crypto')
            .createHash('sha1')
            .update(req.body.password)
            .digest('base64');

        mongo.users.update({_id: req.body.id}, {password: hashPassword, firstLogin: false}, function (err) {
            if (err) {
                response = {"message": "Error updating data"};
                res.status(500).json(response);
            } else {
                response = {"message": "Password changed successfully"};
                res.status(200).json(response);
            }
            console.log(response);
        });
    });

// route middleware to verify a token
    /* router.use(function (req, res, next) {
     console.log("Territorio comanche");
     // check header or url parameters or post parameters for token
     var token = req.body.token || req.query.token || req.headers['x-access-token'];

     // decode token
     if (token) {
     // verifies secret and checks exp
     jwt.verify(token, app.get('secret'), function(err, decoded) {
     if (err) {
     console.log("Todo fue mal");
     return res.json({ success: false, message: 'Failed to authenticate token.' });
     } else {
     console.log("Todo fue bien");
     // if everything is good, save to request for use in other routes
     req.decoded = decoded;
     next();
     }
     });
     }
     else {
     console.log("error token");

     // if there is no token
     // return an error
     return res.status(403).send({
     success: false,
     message: 'No token provided.'
     });
     }
     });*/

    //endpoint de prueba que necesita autenticación y solo accede a el si se ha llamado con token(con Postman)
    router.get("/secret", passport.authenticate('jwt', { session:false}), function (req, res) {
        console.log("llamado a secret");
        res.json("Success! You can not see this without token");
    });

    //Return data of user with :id
    router.get("/users/:id", function (req, res) {
        console.log("get user");

        database.getInfoUser(mongo, req.params.id, function (response) {
            console.log(response.status);
            console.log(response.res);
            res.status(response.status).json(response.res);
        });

    });

    //change removed attribute for removing user
    router.delete("/users/:id", function (req, res) {
        console.log("delete user");

        //search the user avoiding return params which are not necessary
        mongo.users.update({_id: req.params.id}, {removed: true}, function (err, user) {
            if (err) {
                response = {"message": "Error deleting user"};
                res.status(500).json(response);
            } else {
                console.log(user);
                response = {"message": user};
                res.status(200).json(response);
            }
        });
    });

    //change password checking old password
    router.put("/users/:id", function (req, res) {
        console.log("update user");
        var response = {};

        if(req.body.newPassword === req.body.newRePassword) {
            //create the hash to compare with password in db
            var hashOldPassword = require('crypto').createHash('sha1')
                .update(req.body.oldPassword).digest('base64');

            //check if oldPassword is the same
            database.findUserByPassword(mongo, req.params.id, hashOldPassword, function (response) {
                if (response.status === 200) {
                    var hashNewPassword = require('crypto').createHash('sha1')
                        .update(req.body.newPassword).digest('base64');

                    //if the old password match, update the new password
                    database.updatePassword(mongo, req.params.id, hashNewPassword, function (response) {
                        res.status(response.status).json(response.res);
                    });
                } else {
                    res.status(response.status).json(response.res);
                }
            });
        } else{
            response = {"message": "Password don't match"};
            res.status(500).json(response);
        }
    });
};

module.exports = appRouter;