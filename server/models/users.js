
//Return data of user with id
var getInfoUser = function(mongo, id, callback){
    var response = {};

    //search the user avoiding return params which are not necessary
    mongo.users.find({_id: id}, { firstLogin: false, isVerified: false,
        lastAccess: false, creationDate: false, place: false, birthDate: false,
        email: false, password: false, removed: false}, function (err, user) {
        if (err) {
            response = {"status": 500, "res": {"message": "Error searching user"}};
        } else {
            console.log(user);
            response = {"status": 200, "res": {"message": user}};
        }
        callback(response);
    });
};

var getInfoUserByEmail = function(mongo, email, callback){
    var response = {};

    //search the user avoiding return params which are not necessary
    mongo.users.find({email: email}, function (err, user) {
        if (err) {
            response = {"status": 500, "message": "Error searching user"};
        } else if(!user[0]){
            response = {"status": 200, "message": "Not found user"};
        }
        else {
            response = {"status": 200, "message": "Found user", "id": user[0]._id};
        }
        callback(response);
    });
};


//check if exist some user with id and password
var findUserByPassword = function(mongo, id, password, callback){
    var response = {};

    mongo.users.find({_id: id, password: password}, function (err, data) {
        if (err) {
            response = {"status": 500, "res": {"message": "Error searching user"}};
        } else if (!data[0]) {
            response = {"status": 400, "res": {"message": "Invalid user or password"}};
        } else {
            response = {"status": 200, "res": {"message": data}};
        }
        callback(response);
    });
};

//update password for id user
var updatePassword = function(mongo, id, password, callback){
    var response = {};

    mongo.users.update({_id: id}, {password: password}, function (err, user) {
        if (err) {
            response = {"status": 500, "res": {"message": "Error updating password"}};
        } else {
            response = {"status": 200, "res": {"message": "Password updated"}};
        }
        callback(response);
    });
};

//Sin buscar el usuario, se puede validar la contraseña?
var validPassword = function (mongo, password) {
    var hashPassword =  require('crypto')
        .createHash('sha1')
        .update(password)
        .digest('base64');
    return hashPassword === o
};

//Return data of user with id
var isValidToken = function(mongo, id, tokenId, callback){
    var response = {};

    //console.log("id " + id + ", tokenId " + tokenId);
    //search the user avoiding return params which are not necessary
    mongo.users.find({_id: id},{token: tokenId}, function (err, user) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error searching user"}};
        } else if (!user[0]) {
            console.log("Invalid token");
            response = {"status": 400, "res": {"message": "Invalid token"}};
        } else {
            console.log("isValid user " + user + " con id " + id + " y tokenId " + tokenId);
            response = {"status": 200, "res": {"message": user}};
        }
        callback(response);
    });
};

var createAdmin = function (mongo, app) {
    console.log("");
    var db = new mongo.users;
    db.email = "vignemaleSTW@gmail.com";
    var hashPassword = require('crypto')
        .createHash('sha1')
        .update(app.get('pass'))
        .digest('base64');
    db.password = hashPassword;
    db.isAdmin = true;
    // mongo.users.find({email: email}, function (err, user) {
    //     if(err) {
    //         console.log
    //     }
    //
    // })
    getInfoUserByEmail(mongo, db.email, function (response) {
        if(response.message === "Not found user") {
            db.save(function (err) {
                if (err) {
                    console.log("Error database creating admin");
                }
                else {
                    console.log("Admin created");
                }
            });
        }
    });
};

var addFollowing = function (mongo, idUser, idFollow, callback) {
    mongo.users.update({_id: idUser}, {$addToSet: {following: idFollow}}, function (err, user) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error following user"}};
        }
        else {
            console.log("User " + idFollow + " followed succesfully");
            response = {"status": 200, "res": {"message": "User followed succesfully"}};
        }
        callback(response);
    })
};

var removeFollowing = function (mongo, idUser, idUnfollow, callback) {
    mongo.users.update({_id: idUser}, {$pull: {following: idUnfollow}}, function (err, user) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error unfollowing user"}};
        }
        else {
            console.log("User " + idUnfollow + " unfollowed succesfully");
            response = {"status": 200, "res": {"message": "User unfollowed succesfully"}};
        }
        callback(response);
    })
};


module.exports = {
    getInfoUser: getInfoUser,
    findUserByPassword: findUserByPassword,
    updatePassword: updatePassword,
    validPassword: validPassword,
    isValidToken: isValidToken,
    getInfoUserByEmail: getInfoUserByEmail,
    createAdmin: createAdmin,
    addFollowing: addFollowing,
    removeFollowing: removeFollowing
};
