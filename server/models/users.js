
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
            response = {"status": 500, "res": {"message": "Error searching user"}};
        } else if(!user[0]){
            response = {"status": 200, "res": {"message": "Not found user"}};
        }
        else {
            response = {"status": 200, "res": {"message": "Found user"}};
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


module.exports = {
    getInfoUser: getInfoUser,
    findUserByPassword: findUserByPassword,
    updatePassword: updatePassword,
    validPassword: validPassword,
    isValidToken: isValidToken,
    getInfoUserByEmail: getInfoUserByEmail
};
