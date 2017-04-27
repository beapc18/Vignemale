var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var passport  = require('passport');
var passportJWT  = require('passport-jwt');
var GoogleAuth = require('google-auth-library');

//https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;



var appRouter = function(router, mongo, app, config, database) {

    //secret variable JWT
    app.set('secret', config.secret);
    app.set('pass', config.pass);

    // Not the movie transporter!
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vignemaleSTW@gmail.com', // Your email id
            pass: app.get('pass') // Your password
        }
    });

    var jwtOptions = {};
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
    jwtOptions.secretOrKey = app.get('secret'); //config.js

    var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        console.log('checking token');

        //comprueba si el id de la cabecera corresponde con alguno de la bbdd
        database.isValidToken(mongo, jwt_payload.id, jwt_payload.tokenId, function (response) {
            if (response.status === 200) {
                next(null, response);
            } else {
                //redirect to login
                next(null, false);
            }
        });
    });
    passport.use(strategy);

    //Verify if the id from user request is the same id that is in the token
    var verifyIds = function (id, token) {
        var idToken = jwt.decode(token.split(" ")[1]).id;
        return id === idToken;
    };


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
                    response = {"message": "You must change your password", id: data[0]._id, email: data[0].email};
                    console.log(response);
                    res.status(403).json(response);
                } else {
                    //Generate id for token
                    var tokenId = Math.random().toString(36).slice(-10);
                    var payload = {id: data[0]._id, tokenId: tokenId};
                    var token = jwt.sign(payload, jwtOptions.secretOrKey);
                    //next(null, false); //(null, {id: user.id})
                    /*var token = jwt.sign(data[0], app.get('secret'), {
                     expiresIn: 1440 // expires in 24 hours
                     });*/
                    console.log("Creado tokenId de usuario " + tokenId);

                    //update last access when user access and jwt
                    mongo.users.update({_id: data[0]._id}, {lastAccess: new Date(), token: tokenId}, function (err) {
                        if (err) {
                            response = {"message": "Error adding data"};
                            res.status(500).json(response);
                        } else {
                            response = {"message": data[0]._id};   //send user id or link to profile??
                            res.setHeader("Authorization", token);
                            res.status(200).json(response);
                        }
                        console.log("Respuesta enviada:" + response);
                    });
                }
            });
        }
    });
    router.post("/googleSignIn", function (req, res) {

        console.log("googleSignIn user");

        var response = {"error": false, "message": "bien"};
        var token = req.body.token;
        var CLIENT_ID = "967845224095-uak23gbthvsno7j7g2ulothjbeg2k0ob.apps.googleusercontent.com";

        var auth = new GoogleAuth;
        var client = new auth.OAuth2(CLIENT_ID, '', '');

        client.verifyIdToken(token, CLIENT_ID, function (e, login) {
            if (e) {
                console.log("error");
            } else {

                var payload = login.getPayload();
                var userid = payload['sub'];

                var name = payload['given_name'];
                var lastName = payload['family_name'];
                var email = payload['email'];


                //save only if doesn't exist any user with the same email
                mongo.users.find({email: email}, function (err, data) {
                    if (err) {
                        response = {"message": "Error fetching data"};
                        res.status(500).json(response);
                    } else if (data.length !== 0) {

                        response = {"message": "Email exists"};
                        console.log(response);

                        //update last access when user access and jwt
                        mongo.users.update({_id: data[0]._id}, {google: true}, function (err) {
                        });


                        //Generate id for token
                        var tokenId = Math.random().toString(36).slice(-10);
                        var payload = {id: data[0]._id, tokenId: tokenId};
                        var token = jwt.sign(payload, jwtOptions.secretOrKey);

                        console.log("Creado tokenId de usuario " + tokenId);


                        response = {"message": data[0]._id};   //send user id or link to profile??

                        res.setHeader("Authorization", token);
                        res.status(200).json(response);

                    } else {

                        var db = new mongo.users;

                        db.name = name;
                        db.lastName = lastName;
                        db.email = email;
                        db.creationDate = new Date(); //no esta en formato yyyy-mm-dd
                        db.lastAccess = new Date();
                        db.isVerified = false;
                        db.firstLogin = true;
                        db.removed = false;
                        db.google = true;


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

                                        idUser = data[0]._id;
                                        //enviar mail usuario

                                        var url = 'http://localhost:8888/#/users/' + idUser + '/verifyAccount';
                                        var text = 'Welcome to POIManager.' +
                                            ' please, click the link bellow to confirm yout password.\n'
                                            + url + '\n';

                                        var mailOptions = {
                                            from: 'vignemaleSTW@gmail.com', // sender address
                                            to: email, // list of receivers
                                            subject: 'Confirmation', // Subject line
                                            text: text //, // plaintext body
                                            // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                        };

                                        transporter.sendMail(mailOptions);

                                        //Generate id for token
                                        var tokenId = Math.random().toString(36).slice(-10);
                                        var payload = {id: data[0]._id, tokenId: tokenId};
                                        var token = jwt.sign(payload, jwtOptions.secretOrKey);

                                        console.log("Creado tokenId de usuario " + tokenId);


                                        response = {"message": data[0]._id};   //send user id or link to profile??
                                        res.setHeader("Authorization", token);
                                        res.status(200).json(response)
                                    }
                                });
                            }
                            console.log(response);
                        });

                    }
                });
            }
        });
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
            db.google = false;
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


                                    var url = 'http://localhost:8888/#/users/' + idUser + '/verifyAccount';
                                    var text = 'Welcome to POIManager.' +
                                        ' please, click the link bellow to confirm yout password.\n'
                                        + url + '\n';

                                    var mailOptions = {
                                        from: 'vignemaleSTW@gmail.com', // sender address
                                        to: email, // list of receivers
                                        subject: 'Confirmation', // Subject line
                                        text: text //, // plaintext body
                                        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                                    };

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            console.log(error);
                                            res.json({yo: 'error'});
                                        } else {
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

    //no llega a hacer este metodo (sin razon)--> problema para ir al home
    router.get('/getIdFromToken', passport.authenticate('jwt', {session: false}), function (req, res) {
        var payload = jwt.decode(req.headers.authorization.split(" ")[1]);
        console.log("ID DEL TOKEN " + payload.id)
        res.status(200).json({"message": payload.id});
    });

    router.post('/resetPassword', function (req, res) {
        database.getInfoUserByEmail(mongo, req.body.email, function (response) {
            if (response.message === "Error searching user") {
                console.log("Error searching user");
                res.response.status(500).json(response.message);
            }
            else if (response.message === "Found user") {
                console.log("Found user");

                var pass = Math.random().toString(36).slice(-10);
                var hashNewPassword = require('crypto').createHash('sha1').update(pass).digest('base64');

                //send mail
                var mailOptions = {
                    from: 'vignemaleSTW@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'New password', // Subject line
                    text: "Your new password is " + pass //, // plaintext body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.status(500).json({yo: 'error'});
                    }
                });

                //change in db
                database.updatePassword(mongo, response.id, hashNewPassword, function () {
                });
            }
            response = {"message": "A message has been sent to change your password"};
            res.status(200).json(response);

        })
    });

    router.get('/users/:id/verifyAccount', function (req, res) {
        console.log("verify user");

        //Generate random number, Convert to base-36 and Cut off last 10 chars
        var pass = Math.random().toString(36).slice(-10);
        // Hash the password using SHA1 algorithm.
        var hashPassword = require('crypto').createHash('sha1').update(pass).digest('base64');

        mongo.users.update({_id: req.params.id}, {isVerified: true, password: hashPassword}, function (err) {
            if (err) {
                response = {"message": "Error updating data"};
                res.status(500).json(response);
            } else {

                mongo.users.findById(req.params.id, function (err, data) {
                    if (err) {

                    } else {
                        var text = 'Your password is ' + pass;

                        var mailOptions = {
                            from: 'vignemaleSTW@gmail.com', // sender address
                            to: data.email, // list of receivers
                            subject: 'Password', // Subject line
                            text: text //, // plaintext body
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                res.json({yo: 'error'});
                            } else {
                                console.log('Message sent: ' + info.response);
                                response = {"message": "Account has been verified, you will receive an email with your password"};
                                res.status(200).json(response);
                            }
                            ;
                        });
                    }
                });
            }
        });
    });


    router.put("/users/:id/password", function (req, res) {
        console.log("change user password");

        //create the hash to save in db   --> cifrar en cliente
        var hashPassword = require('crypto')
            .createHash('sha1')
            .update(req.body.password)
            .digest('base64');

        mongo.users.update({_id: req.body.id}, {password: hashPassword, firstLogin: false}, function (err) {
            if (err) {
                response = {"message": "Error updating data"};
                res.status(500).json(response);
            } else {
                mongo.users.find({_id: req.body.id}, function (err, data) {
                    if (err) {
                        response = {"message": "Error fetching data"};
                        //console.log(response);
                        res.status(500).json(response);
                    }
                    else {
                        response = {
                            "message": "Password changed successfully",
                            email: data[0].email,
                            password: req.body.password
                        };
                        res.status(200).json(response);
                    }
                })
            }
            console.log(response);
        });
    });

    //Return data of user with :id
    router.get("/users/:id", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("get user");

        if (verifyIds(req.params.id, req.headers.authorization)) {
            database.getInfoUser(mongo, req.params.id, function (response) {
                res.status(response.status).json(response.res);
            });
        } else {
            res.status(403).json({"message": "Access blocked"});
        }
    });

    //change removed attribute for removing user
    router.delete("/users/:id", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("delete user");

        if (verifyIds(req.params.id, req.headers.authorization)) {
            //search the user avoiding return params which are not necessary
            mongo.users.update({_id: req.params.id}, {removed: true}, function (err, user) {
                if (err) {
                    response = {"message": "Error deleting user"};
                    res.status(500).json(response);
                } else {
                    response = {"message": "User deleted succesfully"};
                    res.status(200).json(response);
                }
            });
        } else {
            res.status(403).json({"message": "Access blocked"});
        }
    });

    //change password checking old password
    router.put("/users/:id", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("update user");
        var response = {};
        if (verifyIds(req.params.id, req.headers.authorization)) {
            if (req.body.newPassword === req.body.newRePassword) {
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
                    console.log(response);

                });
            } else {
                response = {"message": "Password don't match"};
                res.status(500).json(response);
                console.log(response);
            }
        } else {
            res.status(403).json({"message": "Access blocked"});
        }
    });

    //get user pois
    router.get("/users/:id/pois", function (req, res) {
        var userId = req.params.id;
        console.log("get user " + userId + " pois");
        var response = {};
        mongo.pois.find({creator: userId}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                response = {"status": 201, "message": data};
            }
            res.json(response);
        });
    });


    router.route("/pois")
        .get(function (req, res) {
            console.log("GET pois");
            var response = {};
            mongo.pois.find(function (err, data) {
                if (err) {
                    response = {"error": true, "message": "Error fetching data"};
                } else {
                    response = {"error": false, "message": data};
                }
                res.json(response);
            });
        })
        .post(function (req, res) {
            console.log("POST pois");
            var db = new mongo.pois;
            var response = {};

            db.name = req.body.name;
            db.description = req.body.description;
            //db.keywords = req.body.keywords.split(","); //separate by comma, save in array
            db.lat = req.body.lat;
            db.lng = req.body.lng;
            db.image = req.body.image;
            db.valoration = req.body.valoration;
            var city = req.body.city;       //hacefalta??
            db.creator = req.body.creator;
            db.numRec = 0;                   //nº recomendaciones

            db.save(function (err,data) {
                if (err) {
                    response = {"status": 500, "message": "Error creatting POI"};
                    res.status(response.status).json(response);
                } else {
                    var poiId = data._id;

                    var shorturls = new mongo.shorturls;

                    shorturls.poi = poiId;

                    shorturls.save(function (err,data) {
                        if (err) {
                            response = {"status": 500, "message": "Error creatting POI"};
                            res.status(response.status).json(response);
                        }else{

                            //update last access when user access and jwt
                            mongo.pois.update({_id: poiId}, {shorturl: data._id}, function (err) {
                                if (err) {
                                    response = {"status": 500, "message": "Error creatting POI"};
                                } else {
                                    response = {"status": 201, "message": "POI has been created successfully"};
                                }
                                res.status(response.status).json(response);
                            });
                        }
                    });

                }
            });
        });


    router.route("/pois/:id")
        .get(function (req, res) {
            console.log("GET pois/" + req.params.id);
            var response = {};
            mongo.pois.find({_id: req.params.id}, function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching data"};
                } else {
                    console.log(data[0].image);
                    response = {"status": 200, "message": data[0]};
                }
                res.status(response.status).json(response.message);
            });
        })
        .put(function (req, res) {
            console.log("PUT pois/" + req.params.id);

            mongo.pois.find({_id: req.params.id}, function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching data"};
                } else {
                    var db = new mongo.pois;
                    var updateInfo = {
                        name: req.body.name,
                        description: req.body.description,
                        keywords: req.body.keywords,
                        lat: req.body.lat,
                        lng: req.body.lng,
                        shorturl: req.body.shortURL,
                        valoration: req.body.valoration,
                        image: req.body.image
                    };

                    mongo.pois.update({_id: req.params.id}, updateInfo, function (err) {
                        if (err) {
                            response = {"status": 500, "message": "Error updating data"};
                        } else {
                            response = {"status": 200,  "message": "Data is updated for " + req.params.id};
                        }
                        res.status(response.status).json(response);
                    })
                }
            });
        })
        .delete(function (req, res) {
            console.log("DELETE pois/" + req.params.id);

            mongo.pois.find({_id: req.params.id}, function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching data"};
                } else {
                    //data exists, remove
                    mongo.pois.remove({_id: req.params.id}, function (err, data) {

                        if (err) {
                            response = {"status": 500, "message": "Error deleting data"};
                        } else {
                            response = {
                                "status": 200,
                                "message": "Data associated with " + req.params.id + " is deleted",
                                //"idUser": creator
                            };
                        }
                        res.status(response.status).json(response);
                    });
                }
            });
        });


    //get user routes
    router.get("/users/:id/routes", function (req, res) {
        var userId = req.params.id;
        console.log("get user " + userId + " routes");
        var response = {};
        mongo.routes.find({creator: userId}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                response = {"status": 200, "message": data};
            }
            res.status(response.status).json(response.message);
        });
    });


    router.route("/routes")
        .get(function (req, res) {
            console.log("GET routes");
            var response = {};
            mongo.routes.find(function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching data"};
                } else {
                    response = {"status": 200, "message": data};
                }
                res.status(response.status).json(response.message);
            });
        })
        .post(function (req, res) {
            console.log("POST routes");
            var db = new mongo.routes;
            var response = {};

            var name = req.body.name;
            var pois = req.body.pois;
            var creator = req.body.creator;


            db.name = name;
            db.numRecommendations = 0;
            db.pois = pois;
            db.creator = creator;


            db.save(function (err) {
                // save() will run insert() command of MongoDB.
                // it will add new data in collection.
                if (err) {
                    response = {"status": 500, "message": "Error adding data"};
                } else {
                    response = {"status": 200, "message": "Data added"};
                }
                res.status(response.status).json(response.messag);
            });
        });

    router.get("/short/:id", function (req, res) {

        console.log("redirect");
        mongo.shorturls.find({_id: req.params.id},function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                console.log("redirect to "+"/pois/"+data[0].poi);
                res.redirect("/pois/"+data[0].poi);
            }
        });
    });

};

module.exports = appRouter;