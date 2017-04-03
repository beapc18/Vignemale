var appRouter = function(router, mongo) {

    // router.get("/starter", function(req, res) {
    //     res.json({"error" : false,"message" : "Hello World"});
    // });

    router.get("/signIn", function (req, res) {
        console.log("signIn user");

        var response = {};
        var email = req.headers.email;
        var password = req.headers.password;

        //check if some value is empty
        if (!email || !password) {
            response = {"error": true, "message": "Empty value"};
            res.json(response);
        } else {
            mongo.users.find({email: email}, function (err, data) {
                if (err) {
                    response = {"error": true,"message": "Error fetching data"};
                } else {
                    response = {"error": false, "message": data};
                    //update last access when user access
                    //mirar formato yyyy-mm-dd
                    mongo.users.update({_id: data[0]._id}, {lastAccess: new Date()}, function (err) {
                        if (err) {
                            response = {"error": true,"message": "Error adding data"};
                        } else {
                            response = {"error": false,"message": "Data added"};
                        }
                        console.log(response);
                    });
                }
                res.json(response);
            });
        }
    });


    router.post("/signUp", function (req, res) {
        console.log("signUp user");

        var db = new mongo.users;
        var response = {};

        var name = req.body.name;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var birthDate = req.body.birthDate;
        var place = req.body.place;

        //check if some value is empty
        if (!name || !lastName || !email || !birthDate || !place) {
            response = {"error": true, "message": "Empty value"};
            res.json(response);
        } else {
            // fetch email and password from REST request.
            db.name = name;
            db.lastName = lastName;
            db.email = email;
            db.birthDate = birthDate;
            db.place = place;
            db.creationDate = new Date(); //no esta en formato yyyy-mm-dd

            // Hash the password using SHA1 algorithm.
            /*db.userPassword =  require('crypto')
             .createHash('sha1')
             .update(req.body.password)
             .digest('base64');*/

            //save only if doesn't exist any user with the same email
            mongo.users.find({email: email}, function (err, data) {
                if (err) {
                    response = {"error": true,"message": "Error fetching data"};
                } else {
                    if (data.length != 0) {
                        response = {"error": true,"message": "email exists"};
                        res.json(response);
                    } else {
                        db.save(function (err) {
                            if (err) {
                                response = {
                                    "error": true,
                                    "message": "Error adding data"
                                };
                            } else {
                                response = {
                                    "error": false,
                                    "message": "Data added"
                                };
                            }
                            res.json(response);
                        });
                    }}
            });
        }
    });
};

module.exports = appRouter;