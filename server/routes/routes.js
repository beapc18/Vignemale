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
    app.set('keymaps', config.keymaps);

    // Not the movie transporter!
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vignemaleSTW@gmail.com', // Your email id
            pass: app.get('pass') // Your password
        }
    });

    var googleMapsClient = require('@google/maps').createClient({
        key: app.get('keymaps')
    });

    var jwtOptions = {};
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
    jwtOptions.secretOrKey = app.get('secret'); //config.js

    var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        //console.log('checking token');

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

    //Verify if the id from user request is the same id that is in the token, or is ADMIN! Change it
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
                    console.log("Creado tokenId de usuario " + tokenId);

                    //update last access when user access and jwt
                    mongo.users.update({_id: data[0]._id}, {lastAccess: new Date(), token: tokenId}, function (err) {
                        if (err) {
                            response = {"message": "Error adding data"};
                            res.status(500).json(response);
                        } else {
                            if (email === "vignemaleSTW@gmail.com") { //es admin ->indicarlo
                                response = {"message": "admin"};
                            }
                            else {
                                response = {"message": data[0]._id};
                            }
                            res.setHeader("Authorization", token);
                            res.status(200).json(response);
                        }
                        //console.log("Respuesta enviada:" + response);
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
                        mongo.users.update({_id: data[0]._id}, {lastAccess: new Date()}, function (err) {
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

    router.get('/getIdFromToken', passport.authenticate('jwt', {session: false}), function (req, res) {
        var payload = jwt.decode(req.headers.authorization.split(" ")[1]);
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
        });
    });

    //Return data of user with :id
    router.get("/users/:id", function (req, res) {
        console.log("get user");

        //if (verifyIds(req.params.id, req.headers.authorization)) {
        database.getInfoUser(mongo, req.params.id, function (response) {
            res.status(response.status).json(response.res);
        });
        /*} else {
         res.status(403).json({"message": "Access blocked"});
         }*/
    });

    //change removed attribute for removing user
    router.delete("/users/:id", passport.authenticate('jwt', {session: false}), function (req, res) {
        //Cuando quiere borrar el administrador, no es igual su id que el que quiere borrar!
        //if (verifyIds(req.params.id, req.headers.authorization)) {
        console.log("delete user " + req.params.id);
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
        /*} else {
         res.status(403).json({"message": "Access blocked"});
         }*/
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

    //get fav pois from user
    router.get("/users/:id/favs", function (req, res) {
        console.log("GET favs from user " + req.params.id);
        database.getFavs(mongo, req.params.id, function (response) {
            var favsNames = [];
            bucleForPOIs(response.res.message[0].favs, 0, favsNames, function (arrayIds, arrayNames) {
                response = {"status": 200, "message": {"favsNames": arrayNames, "favsIds": arrayIds}}; //devolver solo la lista de seguidores
                res.status(response.status).json(response.message);

            });
        });
    });

    //add poi to fav to a user
    router.post("/users/:id/favs", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("POST " + req.body.idPoi + " poi to " + req.params.id + " user");
        //if(verifyIds())
        database.addFav(mongo, req.params.id, req.body.idPoi, function (response) {
            res.status(response.status).json(response.res);
        });
    });

    //add poi to fav to a user
    router.delete("/users/:id/favs", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("DELETE " + req.body.idPoi + " poi to " + req.params.id + " user");
        database.deleteFav(mongo, req.params.id, req.body.idPoi, function (response) {
            res.status(response.status).json(response.res);
        });
    });

    //Follow user, updating field "following"
    router.post("/users/:id/follow", passport.authenticate('jwt', {session: false}), function (req, res) {
        var idUser = jwt.decode(req.headers.authorization.split(" ")[1]).id;
        console.log("Follow user " + req.params.id + " from " + idUser);
        //if/verifyIds
        database.addFollowing(mongo, idUser, req.params.id, function (response) {
            console.log(response);
            res.status(response.status).json(response.res);
        });
    });

    //Unfollow user, updating field "following"
    router.post("/users/:id/unfollow", passport.authenticate('jwt', {session: false}), function (req, res) {
        var idUser = jwt.decode(req.headers.authorization.split(" ")[1]).id;
        console.log("Unfollow user " + req.params.id + " from " + idUser);
        //if/verifyIds
        database.removeFollowing(mongo, idUser, req.params.id, function (response) {
            console.log(response);
            res.status(response.status).json(response.res);
        });
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
        .post(passport.authenticate('jwt', {session: false}), function (req, res) {
            console.log("POST pois");
            var db = new mongo.pois;
            var response = {};


            console.log(req.body);

            db.name = req.body.name;
            db.description = req.body.description;
            console.log(req.body.keywords.split(","));
            db.keywords = req.body.keywords.split(","); //separate by comma, save in array
            db.lat = req.body.lat;
            db.lng = req.body.lng;
            db.image = req.body.image;
            db.rating = req.body.rating;
            db.creator = req.body.creator;
            db.numRec = 0; //nº recomendaciones

            if ("undefined" === typeof req.body.idDuplicate || "undefined" === typeof req.body.originCreator) {

            } else {
                db.idDuplicate = req.body.idDuplicate;
                db.originCreator = req.body.originCreator;

                console.log(req.body.idDuplicate);
                console.log(req.body.originCreator);
            }

            //Collect data to statistics of country and city
            googleMapsClient.reverseGeocode({
                latlng: [req.body.lat, req.body.lng]
            }, function (err, response) {
                if (!err) {
                    for(i=0; i<response.json.results[0].address_components.length; i++){
                        if(response.json.results[0].address_components[i].types.includes("locality")){
                            db.city = response.json.results[0].address_components[i].long_name;
                        } else if(response.json.results[0].address_components[i].types.includes("country")){
                            db.country = response.json.results[0].address_components[i].long_name;
                            break;
                        }
                    }

                    db.save(function (err, data) {
                        if (err) {
                            response = {"status": 500, "message": "Error creatting POI"};
                            res.status(response.status).json(response);
                        } else {
                            var poiId = data._id;
                            database.saveRating(mongo, req.body.creator, poiId, req.body.rating, function (data) {
                                if (data.status === 500) {
                                    response = {"status": 500, "message": "Error creatting POI"};
                                    res.status(response.status).json(response);
                                } else {
                                    var shorturls = new mongo.shorturls;

                                    shorturls.url = req.body.shortURL;

                                    if (req.body.shortURL != "") {
                                        shorturls.save(function (err, data) {
                                            if (err) {
                                                response = {
                                                    "status": 500,
                                                    "message": "Error creatting POI"
                                                };
                                                res.status(response.status).json(response);
                                            } else {
                                                mongo.pois.update({_id: poiId}, {shortURL: "http://localhost:8888/short/" + data._id}, function (err) {
                                                    if (err) {
                                                        response = {
                                                            "status": 500,
                                                            "message": "Error creatting POI"
                                                        };
                                                        res.status(response.status).json(response);
                                                    } else {
                                                        //update last access when user access and jwt
                                                        mongo.pois.update({_id: poiId}, {shorturl: data._id}, function (err) {
                                                            if (err) {
                                                                response = {
                                                                    "status": 500,
                                                                    "message": "Error creatting POI"
                                                                };
                                                            } else {
                                                                response = {
                                                                    "status": 201,
                                                                    "message": "POI has been created successfully"
                                                                };
                                                            }
                                                            res.status(response.status).json(response);
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        response = {
                                            "status": 201,
                                            "message": "POI has been created successfully"
                                        };
                                        res.status(response.status).json(response);
                                    }
                                }
                            });
                        }
                    })
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
                    response = {"status": 200, "message": data[0]};
                }
                res.status(response.status).json(response.message);
            });
        })
        .put(passport.authenticate('jwt', {session: false}), function (req, res) {
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
                        image: req.body.image
                    };


                    if (req.body.shortURL != "") {

                        var url = req.body.shortURL;

                        mongo.pois.update({_id: req.params.id}, updateInfo, function (err, data) {
                            if (err) {
                                response = {"status": 500, "message": "Error updating data"};
                            } else {
                                if (url != data.shortURL) {
                                    var shorturls = new mongo.shorturls;

                                    shorturls.url = url;
                                    shorturls.save(function (err, data) {
                                        if (err) {
                                            response = {"status": 500, "message": "Error updating data"};
                                            res.status(response.status).json(response);
                                        } else {
                                            //update last access when user access and jwt
                                            mongo.pois.update({_id: req.params.id}, {shortURL: "http://localhost:8888/short/" + data._id}, function (err) {
                                                if (err) {
                                                    response = {"status": 500, "message": "Error updating data"};
                                                } else {
                                                    response = {"status": 201, "message": "POI updated successfully"};
                                                }
                                                res.status(response.status).json(response);
                                            });
                                        }
                                    });

                                } else {
                                    response = {"status": 200, "message": "POI updated successfully"};
                                    res.status(response.status).json(response);
                                }

                            }
                        })
                    } else {
                        response = {"status": 200, "message": "POI updated successfully"};
                        res.status(response.status).json(response);
                    }
                }
            });
        })
        .delete(passport.authenticate('jwt', {session: false}), function (req, res) {
            console.log("DELETE pois/" + req.params.id);

            //delete pois in favs of another users asynchronous
            database.removePoisFromFavs(mongo, req.params.id);

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
                                "message": "POI deleted successfully"
                            };
                        }
                        res.status(response.status).json(response);
                    });
                }
            });
        });

    //post user rating
    router.post("/pois/:id/rating", passport.authenticate('jwt', {session: false}), function (req, res) {
        var idPoi = req.params.id;
        console.log("post poi " + idPoi + " rating");
        var idUser = jwt.decode(req.headers.authorization.split(" ")[1]).id;
        database.ratePoi(mongo, idUser, idPoi, req.body.rating, function (response) {
            console.log(response.res);
            res.status(response.status).json(response.res);
        });
    });

    //search if this poi is my fav list to this user
    router.get("/pois/:id/isfav", passport.authenticate('jwt', {session: false}), function (req, res) {
        var idPoi = req.params.id;
        var idUser = jwt.decode(req.headers.authorization.split(" ")[1]).id;
        console.log("GET if poi " + idPoi + " is fav from user " + idUser);
        mongo.users.find({_id: idUser, favs: idPoi}, function (err, data) {
            if (err) {
                console.log("Error getting isfav");
                response = {"status": 500, "message": "Error getting isfav"};
            } else {
                response = {"status": 200, "message": (data.length !== 0)};
            }
            res.status(response.status).json(response.message);
        })
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

    var bucleForPOIs = function (arrayIds, i, arrayNames, callback) {
        if (i < arrayIds.length) {
            database.getNamePOI(mongo, arrayIds[i], function (response) {
                var index = arrayIds.indexOf(arrayIds[0]);
                if (index !== -1) {
                    arrayNames[i] = response.message[0].name;
                }
                i++;
                bucleForPOIs(arrayIds, i, arrayNames, callback);
            });
        }
        else {
            callback(arrayIds, arrayNames);
        }
    };

    //Juntar el poi con su creador para mas info?
    var bucleForPOIscreator = function (idNameFollowing, i, arrayNames, ratings, callback) {
        if (i < idNameFollowing.length) {
            //database.getNamePOIcreator(mongo, idNameFollowing[i].id, function (response) {
            mongo.pois.find({creator: idNameFollowing[i]._id}, {name: 1, rating: 1, _id: 0}, function (err, data) {
                console.log("data" + data);
                //var index = arrayIds.indexOf(arrayIds[0]);
                for (j = 0; j < data.length; j++) {
                    ratings.push({"x": data[j].name, "y": idNameFollowing[i].name, "r": data[j].rating});
                }
                /*if (index !== -1) {
                 for (j = 0; j < response.message.length; j++) {
                 for(k = 0; k < response.message.length; k++) {
                 ratings.push({"x": response.message[j].name});
                 }
                 }*/

                /*for(i = 0; i<data.pois.length; i++){
                 for(j = 0; j<data.names.length; j++) {
                 if(String(data.pois[i]._id) == String(data.names[j]._id)){
                 bubbles.push({"x": data.names[j].name, "y": data.pois[i].y, "r": data.pois[i].r});*/
                i++;
                bucleForPOIscreator(idNameFollowing, i, arrayNames, ratings, callback);
            });
        }
        else {
            console.log(ratings);
            callback(idNameFollowing, ratings);
        }
    };


    var bucleForUserNames = function (arrayIds, i, arrayNames, callback) {
        if (i < arrayIds.length) {

            database.getNameUser(mongo, arrayIds[i], function (response) {
                var index = arrayIds.indexOf(arrayIds[0]);
                if (index !== -1) {
                    arrayNames[i] = response.message[0].name;
                }
                i++;
                bucleForUserNames(arrayIds, i, arrayNames, callback);
            });
        }
        else {
            callback(arrayIds, arrayNames);
        }
    };

    var bucleForUser = function (arrayIds, i, arrayUsers, callback) {
        if (i < arrayIds.length) {


            mongo.users.find({_id: arrayIds[i]}, function (err, data) {
                if (err) {
                } else {
                    var index = arrayIds.indexOf(arrayIds[0]);
                    if (index !== -1) {
                        arrayUsers[i] = data[0];
                    }
                    i++;
                    bucleForUser(arrayIds, i, arrayUsers, callback);
                }

            });
        }
        else {
            callback(arrayIds, arrayUsers);
        }
    };


//get user follows
    router.get("/users/:id/following", function (req, res) {
        var userId = req.params.id;
        console.log("Get follows");
        mongo.users.find({_id: userId}, {following: 1, _id: 0}, function (err, data) {
            if (err) {
                console.log("Error getting follows");
                response = {"status": 500, "message": "Error getting follows"};
                res.status(response.status).json(response.message);
            } else {
                var followingNames = [];
                bucleForUserNames(data[0].following, 0, followingNames, function (arrayIds, arrayNames) {
                    response = {
                        "status": 200, "message": {
                            "followingNames": arrayNames
                            , "followingIds": arrayIds
                        }
                    }; //devolver solo la lista de seguidores
                    res.status(response.status).json(response.message);
                });
            }
        })
    });

//return true if the user is followed, false in other case
    router.get("/users/:id/isfollowed", passport.authenticate('jwt', {session: false}), function (req, res) {
        var idUserFollowed = req.params.id;
        var idUserFollowing = jwt.decode(req.headers.authorization.split(" ")[1]).id;
        console.log("Get user " + idUserFollowed + " is followed by" + idUserFollowing);
        mongo.users.find({_id: idUserFollowing, following: idUserFollowed}, function (err, data) {
            if (err) {
                console.log("Error getting isfollow");
                response = {"status": 500, "message": "Error getting follows"};
            } else {
                response = {"status": 200, "message": (data.length !== 0)};
            }
            res.status(response.status).json(response.message);
        })
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
                res.status(response.status).json(response);
            });
        })
        .post(passport.authenticate('jwt', {session: false}), function (req, res) {
            console.log("POST routes");
            var db = new mongo.routes;
            var response = {};

            var name = req.body.name;
            var pois = req.body.pois;


            var array = [];

            for (i = 0; i < pois.length; i++) {
                array.push(JSON.parse(pois[i]));
            }

            var creator = req.body.creator;


            db.name = name;
            db.numRecommendations = 0;

            db.pois = array;
            db.creator = creator;


            db.save(function (err) {
                // save() will run insert() command of MongoDB.
                // it will add new data in collection.
                if (err) {
                    response = {"status": 500, "message": "Error adding data"};
                } else {
                    response = {"status": 200, "message": "Route created successfully"};
                }
                res.status(response.status).json(response);
            });
        });


    router.route("/routes/:id").get(function (req, res) {
        console.log("GET routes/" + req.params.id);
        var response = {};
        mongo.routes.find({_id: req.params.id}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                response = {"status": 200, "message": data[0]};
            }
            res.status(response.status).json(response.message);
        });
    });

    router.route("/routes/:id").delete(passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("DELETE routes/" + req.params.id);
        var response = {};
        mongo.routes.remove({_id: req.params.id}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                response = {"status": 200, "message": "Route removed succesfully"};
            }
            res.status(response.status).json(response);
        });
    });

    router.get("/short/:id", function (req, res) {

        console.log("redirect");
        mongo.shorturls.find({_id: req.params.id}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching data"};
            } else {
                res.redirect(data[0].url);
            }
        });
    });

    router.route("/search/pois/:words")
        .get(function (req, res) {
            console.log("GET /search/pois/" + req.params.words);
            var response = {};
            //find similar results using an index
            mongo.pois.find({$text: {$search: req.params.words}}, function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching pois"};
                } else {
                    response = {"status": 200, "message": data};
                }
                res.status(response.status).json(response.message);
            });
        });

    router.route("/share")
        .post(function (req, res) {
            console.log("POST /share");

            var response = {};
            //find similar results using an index

            console.log(req.body.isPoi);
            var url;

            var db = new mongo.shares;

            if (req.body.isPoi == "true") {


                mongo.pois.find({_id: req.body.idPoiRoute}, function (err, data) {
                    if (err) {
                        response = {"status": 500, "message": "Error fetching data"};
                    } else {
                        db.idPoiRoute = req.body.idPoiRoute;
                        db.idUser = req.body.idOrigin;
                        db.namePoiRoute = data[0].name;
                        db.save(function (err) {
                        });
                    }
                });


                url = 'http://localhost:8888/#/pois/' + req.body.idPoiRoute;
            } else {

                mongo.routes.find({_id: req.body.idPoiRoute}, function (err, data) {
                    if (err) {
                        response = {"status": 500, "message": "Error fetching data"};
                    } else {
                        db.idPoiRoute = req.body.idPoiRoute;
                        db.idUser = req.body.idOrigin;
                        db.namePoiRoute = data[0].name;
                        db.save(function (err) {
                        });
                    }
                });

                url = 'http://localhost:8888/#/routes/' + req.body.idPoiRoute;
            }

            var text = req.body.message + '\n' +
                'Click the link bellow to watch your recommendation from ' + req.body.userNameOrigin +
                ' ' + req.body.userLastNameOrigin + '.\n'
                + url + '\n';

            var mailOptions = {
                from: 'vignemaleSTW@gmail.com', // sender address
                to: req.body.email, // list of receivers
                subject: 'Recommendation', // Subject line
                text: text //, // plaintext body
                // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
            };


            transporter.sendMail(mailOptions);

            response = {"status": 200, "message": "Message sent"};

            res.status(response.status).json(response.message);

        });
    router.route("/search/users/:words")
        .get(function (req, res) {
            console.log("GET /search/users/" + req.params.words);
            var response = {};
            //find similar results using an index
            mongo.users.find({$text: {$search: req.params.words}}, function (err, data) {
                if (err) {
                    response = {"status": 500, "message": "Error fetching users"};
                } else {
                    response = {"status": 200, "message": data};
                }
                res.status(response.status).json(response.message);
            });
        });


    router.get("/admin/usersList", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("Management list...");

        mongo.users.find({$and: [{email: {$ne: "vignemaleSTW@gmail.com"}}, {removed: {$ne: "true"}}]}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error returning all users"};
            } else {
                response = {"status": 200, "message": data};
            }

            res.status(response.status).json(response.message);
        })

    });

    router.post("/sendMail/:email", passport.authenticate('jwt', {session: false}), function (req, res) {
        console.log("Sending mail from admin to " + req.params.email);
        var text = "This is a warning from the Admin";
        var email = req.params.email;

        var mailOptions = {
            from: 'vignemaleSTW@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'Warning!', // Subject line
            text: text //, // plaintext body
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                response = {"status": 500, "message": "Error sending mail"}
            }
            else {
                console.log(info);
                response = {"status": 200, "message": "Email sent"}
            }
            res.status(response.status).json(response.message);
        });
    })


    router.get("/users/:id/statistics/1", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/1");

        mongo.users.find({_id: req.params.id}, function (err, data) {
            if (err) {
                console.log("Error getting follows");
                response = {"status": 500, "message": "Error getting follows"};
            } else {
                var userCreationDate = data[0].creationDate;

                var following = [];
                bucleForUser(data[0].following, 0, following, function (arrayIds, arrayUsers) {

                    var date = new Date();
                    var size = 12 * (date.getFullYear() - 2017) + (date.getMonth() - 1) + 1;
                    var names = new Array(size);

                    //names of the months
                    for (i = 0; i < size; i++) {
                        var year = 2017 + parseInt((i + 2) / 12);
                        var month = (i + 2) % 12;
                        names[i] = month + '/' + year;
                    }

                    var creations = new Array(size).fill(0);
                    var dateCreation;

                    //number of creation per month
                    for (i = 0; i < arrayUsers.length; i++) {
                        dateCreation = arrayUsers[i].creationDate;
                        creations[12 * (dateCreation.getFullYear() - 2017) + (dateCreation.getMonth() - 1)]++;
                    }

                    //add user to the list
                    creations[12 * (userCreationDate.getFullYear() - 2017) + (userCreationDate.getMonth() - 1)]++;

                    response = {
                        "status": 200, "message": {
                            "names": names
                            , "creations": creations
                        }
                    }; //devolver solo la lista de seguidores
                    res.status(response.status).json(response.message);
                });
            }
        });
    })


    router.get("/users/:id/statistics/2", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/2");

        mongo.users.find({_id: req.params.id}, function (err, data) {
            if (err) {
                console.log("Error getting follows");
                response = {"status": 500, "message": "Error getting follows"};
            } else {
                var userLastAccess = data[0].lastAccess;

                var following = [];
                bucleForUser(data[0].following, 0, following, function (arrayIds, arrayUsers) {

                    var date = new Date();
                    var size = 8;


                    var names = new Array(size);


                    names[0] = "Before";
                    //names of the months
                    for (i = 0; i < size - 1; i++) {

                        var dat = new Date();
                        dat.setDate(dat.getDate() - i);

                        names[size - (i + 1)] = getDateString(dat);
                    }


                    var lastAccessArray = new Array(size).fill(0);
                    var dateLastAccess;

                    arrayUsers.push({
                        lastAccess: userLastAccess
                    });

                    var added = false;
                    //number of creation per month
                    for (i = 0; i < arrayUsers.length; i++) {
                        dateLastAccess = arrayUsers[i].lastAccess;


                        for (j = 1; j < size; j++) {
                            if (names[j] == getDateString(dateLastAccess)) {
                                lastAccessArray[j]++;
                                added = true;
                            }
                        }

                        if (!added) {
                            lastAccessArray[0]++;
                        }
                        added = false;
                    }


                    //add user to the list
                    //creations[12*(userCreationDate.getFullYear() - 2017) + (userCreationDate.getMonth() - 1)]++;

                    response = {
                        "status": 200, "message": {
                            "names": names
                            , "lastAccessArray": lastAccessArray
                        }
                    }; //devolver solo la lista de seguidores
                    res.status(response.status).json(response.message);
                });
            }
        });

    })

    //user's pois by country
    router.get("/users/:id/statistics/6", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/6");
        database.getUserPoisByCountry(mongo, req.params.id, function (data) {
            if (data.status != 500) {
                var countries = [];
                var numPois = [];
                for (i = 0; i < data.array.length; i++) {
                    countries.push("% "+data.array[i]._id.country);
                    numPois.push(parseFloat((data.array[i].total/data.tot)*100).toFixed(2));
                }
                response = {"status": 200, "message": {"countries": countries, "numPois": numPois}};
            }
            res.status(response.status).json(response.message);
        })

    });

    //following's pois by country
    router.get("/users/:id/statistics/7", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/7");
        database.getFollowingPoisByCountry(mongo, req.params.id, function (data) {
            if (data.status != 500) {
                var countries = [];
                var numPois = [];
                for (i = 0; i < data.array.length; i++) {
                    countries.push("% "+data.array[i]._id.country);
                    numPois.push(parseFloat(data.array[i].total / data.tot * 100).toFixed(2)); //porcentaje
                }
                response = {"status": 200, "message": {"countries": countries, "numPois": numPois}};
            }
            res.status(response.status).json(response.message);
        })
    });

    //following users' activity depending on pois and age
    router.get("/users/:id/statistics/9", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/9");
        database.getUserInfo(mongo, req.params.id, function (data) {
            if (data.status != 500) {
                var users = [];
                var info = [];

                for (i = 0; i < data.follows.length; i++) {
                    users.push(data.follows[i].name);
                    for (j = 0; j < data.pois.length; j++) {
                        if (String(data.follows[i]._id) == String(data.pois[j]._id.creator)) {
                            info.push(data.pois[j].total);
                            data.pois.splice(j);
                            break;
                        }
                    }
                }
                response = {"status": 200, "message": {"users": users, "info": info}};
            }
            res.status(response.status).json(response.message);
        })
    });

    var getDateString = function (date) {
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }


    router.get("/users/:id/statistics/3", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/3");

        mongo.shares.aggregate([{$match: {idUser: req.params.id}}, {
            $group: {
                _id: {
                    id: "$idPoiRoute",
                    name: "$namePoiRoute"
                }, count: {$sum: 1}
            }
        }], function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching pois"};
            } else {
                response = {"status": 200, "message": data};
                var names = data.map(function (a) {
                    return a._id.name
                });
                var count = data.map(function (a) {
                    return a.count
                });

                response = {
                    "status": 200, "message": {
                        "names": names
                        , "count": count
                    }
                }; //devolver solo la lista de seguidores
            }
            res.status(response.status).json(response.message);
        });
    })


    router.get("/users/:id/statistics/4", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/4");

        mongo.pois.find({
            creator: req.params.id,
            idDuplicate: {$exists: true}
        }, {idDuplicate: true}, function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching pois"};
                res.status(response.status).json(response.message);
            } else {

                var count = [];

                bucleForShare(data.map(function (a) {
                    return a.idDuplicate
                }), 0, count, function (arrayIds, arrayCounts) {
                    var names = [];
                    bucleForPOIs(arrayIds, 0, names, function (arrayIds, arrayNames) {
                        response = {
                            "status": 200, "message": {
                                "names": names
                                , "count": count
                            }
                        };
                        res.status(response.status).json(response.message);
                    })
                })
            }

        });
    })

    var bucleForShare = function (arrayIds, i, arrayCounts, callback) {
        if (i < arrayIds.length) {
            mongo.shares.find({idPoiRoute: arrayIds[i]}, function (err, data) {
                if (err) {
                } else {
                    var index = arrayIds.indexOf(arrayIds[0]);

                    if (index !== -1) {
                        arrayCounts[i] = data.length;
                    }
                    i++;
                    bucleForShare(arrayIds, i, arrayCounts, callback);
                }
            });
        }
        else {
            callback(arrayIds, arrayCounts);
        }
    };


    router.get("/users/:id/statistics/5", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/5");

        mongo.pois.aggregate([{
            $match: {
                creator: req.params.id,
                originCreator: {$exists: true}
            }
        }, {$group: {_id: {originCreator: "$originCreator"}, count: {$sum: 1}}}], function (err, data) {
            if (err) {
                response = {"status": 500, "message": "Error fetching pois"};
                res.status(response.status).json(response.message);
            } else {
                var names = [];

                bucleForUser(data.map(function (a) {
                    return a._id.originCreator
                }), 0, names, function (arrayIds, arrayUsers) {
                    response = {
                        "status": 200, "message": {
                            "names": arrayUsers.map(function (a) {
                                return a.name;
                            }),
                            "count": data.map(function (a) {
                                return a.count;
                            })
                        }
                    };
                    res.status(response.status).json(response.message);
                })

            }
        });
    });


    router.get("/users/:id/statistics/8", function (req, res) {
        console.log("/user/" + req.params.id + "/statistics/8");

        mongo.users.find({_id: req.params.id}, function (err, data) {
            if (err) {
                console.log("Error getting follows");
                response = {"status": 500, "message": "Error getting follows"};
            } else {

                var myAge = data[0].birthDate;

                var following = [];
                bucleForUser(data[0].following, 0, following, function (arrayIds, arrayUsers) {

                    var date = new Date();
                    var size = 5;


                    var names = new Array(size);


                    names[0] = "Under 18";
                    names[1] = "18-30";
                    names[2] = "31-50";
                    names[3] = "Over 50";
                    names[4] = "Unknown";


                    var ages = new Array(size).fill(0);
                    var age;

                    arrayUsers.push({
                        birthDate: myAge
                    });

                    //number of creation per month
                    for (i = 0; i < arrayUsers.length; i++) {

                        if ("undefined" === typeof arrayUsers[i].birthDate) {
                            ages[4]++;
                        } else {
                            age = date.getFullYear() - arrayUsers[i].birthDate.getFullYear();
                            if (age < 18) {
                                ages[0]++;
                            } else if (age >= 18 && age <= 30) {
                                ages[1]++;
                            } else if (age >= 31 && age <= 50) {
                                ages[2]++;
                            } else {
                                ages[3]++;
                            }
                        }
                    }


                    //add user to the list
                    //creations[12*(userCreationDate.getFullYear() - 2017) + (userCreationDate.getMonth() - 1)]++;

                    response = {
                        "status": 200, "message": {
                            "names": names
                            , "ages": ages
                        }
                    }; //devolver solo la lista de seguidores
                    res.status(response.status).json(response.message);
                });
            }
        });

    });

    router.get("/users/:id/statistics/10", function (req, res) {
        console.log("Estadistica 10 del usuario " + req.params.id)
        mongo.users.find({_id: req.params.id}, function (err, data) {
            if (err) {
                console.log("Error getting follows");
                response = {"status": 500, "message": "Error getting follows"};
            } else {
                // var myAge = data[0].birthDate;

                var following = [];
                //var names = Array();
                var ratings = [];
                mongo.users.find({_id: data[0].following}, {name: 1}, function (err, IdNamefollowings) {
                    console.log("Following:" + IdNamefollowings);

                    //bucleForUser(data[0].following, 0, following, function (arrayIds, arrayUsers) {
                    bucleForPOIscreator(IdNamefollowings, 0, [], ratings, function (arrayIds, arrayPOIs) {
                        console.log("Array final de ratings: " + arrayPOIs);

                        response = {"status": 200, "message": {infoPois: arrayPOIs}};
                        res.status(response.status).json(response.message);
                    });
                    //});
                });
            }
        });
    });

    router.get("/admin/statistics/1", function (req, res) {
        console.log("/admin/statistics/1");
        mongo.users.find({isAdmin: {$ne: 1}}, function (err, data) {

            var date = new Date();
            var names = [];
            names[0] = "Under 18";
            names[1] = "18-30";
            names[2] = "31-50";
            names[3] = "Over 50";
            names[4] = "Unknown";

            //var ages = [];
            var ages = new Array(5).fill(0);
            var percent = new Array(5).fill(0);
            //number of creation per month
            for (i = 0; i < data.length; i++) {
                if ("undefined" === typeof data[i].birthDate) {
                    ages[4]++;
                } else {
                    age = date.getFullYear() - data[i].birthDate.getFullYear();
                    if (age < 18) {
                        ages[0]++;
                    } else if (age >= 18 && age <= 30) {
                        ages[1]++;
                    } else if (age >= 31 && age <= 50) {
                        ages[2]++;
                    } else {
                        ages[3]++;
                    }
                }
            }
            for(k = 0; k < data.length; k++) {
                percent[k] = (ages[k] / data.length*100).toFixed(1);
            }

            response = {
                "status": 200, "message": {
                    "names": names,
                    "ages": percent
                }
            };
            res.status(response.status).json(response.message);
        });
    });

    router.get("/admin/statistics/2", function (req, res) {
        console.log("/admin/statistics/2");
        database.getUsersByPlace(mongo, function (data) {

            var places = [];
            var counts = [];
            var percent = [];
            var sum = 0;
            for(i = 0; i < data.res.message.length; i++) {
                if(data.res.message[i]._id === null) places[i] = 'Unknown';
                else places[i] = data.res.message[i]._id;
            }
            for(j = 0; j < data.res.message.length; j++) {
                counts[j] = data.res.message[j].count;
                sum = sum + counts[j];
            }
            for(k = 0; k < data.res.message.length; k++) {
                percent[k] = (counts[k] / sum * 100).toFixed(1);
            }

            response = {
                "status": 200, "message": {
                    "places": places,
                    "counts": percent
                }
            };
            res.status(response.status).json(response.message);
        })
    });

    router.get("/admin/statistics/3", function (req, res) {
        console.log("/admin/statistics/3");
        mongo.users.find({isAdmin: {$ne: 1}}, function (err, data) {
            var totalUsers = data.length;
            var counts = Array(3).fill(0);
            var labels = [];
            var percent = [];
            labels[0] = "Inactive";
            labels[1] = "More than 0, less than 5 pois";
            labels[2] = "5 or more pois";

            mongo.pois.aggregate([{$group: {_id: "$creator", count: {$sum:1}}}], function (err, data) {
                /*var percentActive = (data.length / totalUsers * 100).toFixed(1);
                var percentInactive = 100 - percentActive;*/
                for(var i = 0; i < data.length; i++) {
                    if(data[i].count < 5) counts[1]++;
                    else if(data[i].count >= 5) counts[2]++;
                }
                for(k = 0; k < labels.length; k++) {
                    percent[k] = (counts[k] / totalUsers * 100).toFixed(1);
                }
                console.log(percent);

                response = {
                    "status": 200, "message": {
                        "labels": labels,
                        "counts": percent
                    }
                };
                res.status(response.status).json(response.message);
            })
        })
    });

    //pois by user and rating average
    router.get("/admin/statistics/4", function (req, res) {
        console.log("/admin/statistics/4");
        database.getPoisRatingByUser(mongo, function (data) {
            if (data.status != 500) {
                var bubbles = [];
                for (i = 0; i < data.pois.length; i++) {
                    for (j = 0; j < data.names.length; j++) {
                        if (String(data.pois[i]._id) == String(data.names[j]._id)) {
                            bubbles.push({"x": data.names[j].name, "y": data.pois[i].y, "r": data.pois[i].r});
                            break;
                        }
                    }
                }
                response = {"status": 200, "message": {"bubbles": bubbles}};
            }
            res.status(response.status).json(response.message);
        })

    });


    //users logged with googles/not
    router.get("/admin/statistics/5", function (req, res) {
        console.log("/admin/statistics/5");
        database.getGoogleUsers(mongo, function (data) {
            if (data.status != 500) {
                var label = [];
                var percentage = [];
                var sum = Number(data.google) + Number(data.notGoogle);
                label.push("% Logged with Google");
                label.push("% Not logged with Google");
                percentage.push(parseFloat(data.google / sum).toFixed(2) * 100);
                percentage.push(parseFloat(data.notGoogle / sum).toFixed(2) * 100);
                response = {"status": 200, "message": {"percentage": percentage, "label": label}};
            }
            res.status(response.status).json(response.message);
        })
    });


    router.get("/admin/statistics/7", function (req, res) {
        console.log("/admin/statistics/7");
        mongo.shares.aggregate([{$group : {_id: {id:"$idUser"}, count:{$sum:1}}}],function(err,data){
            if (err) {
                response = {"status": 500, "message": "Error fetching pois"};
            } else {
                var names = new Array(4);

                names[0] = "Under 5";
                names[1] = "5-9";
                names[2] = "10-15";
                names[3] = "Over 15";

                var count = new Array(4).fill(0);

                var counts = data.map(function(a){ return a.count});

                for(i=0;i<count.length;i++){
                    if(counts[i]<5){
                        count[0]++;
                    }else if(counts[i]>=5 && counts[i]<10){
                        counts[1]++;
                    }else if(counts[i]>=10 && counts[i]<=15){
                        count[2]++;
                    }else{
                        counts[3]++;
                    }
                }

                response = {
                    "status": 200, "message": {
                        "names": names
                        , "count": count
                    }
                }; //devolver solo la lista de seguidores
            }
            res.status(response.status).json(response.message);
        });

    });


    router.get("/admin/statistics/8", function (req, res) {
        console.log("/admin/statistics/8");

        mongo.pois.aggregate([{ $match: { originCreator:{$exists:true} } },{$group : {_id: {id:"$originCreator"}, count:{$sum:1}}}],function(err,data){
            if (err) {
                response = {"status": 500, "message": "Error fetching pois"};
            } else {

                var names = new Array(4);

                names[0] = "Under 5";
                names[1] = "5-9";
                names[2] = "10-15";
                names[3] = "Over 15";

                var count = new Array(4).fill(0);

                var counts = data.map(function(a){ return a.count});

                for(i=0;i<count.length;i++){
                    if(counts[i]<5){
                        count[0]++;
                    }else if(counts[i]>=5 && counts[i]<10){
                        counts[1]++;
                    }else if(counts[i]>=10 && counts[i]<=15){
                        count[2]++;
                    }else{
                        counts[3]++;
                    }
                }

                response = {
                    "status": 200, "message": {
                        "names": names
                        , "count": count
                    }
                }; //devolver solo la lista de seguidores
            }
            res.status(response.status).json(response.message);
        });
    });

};



module.exports = appRouter;