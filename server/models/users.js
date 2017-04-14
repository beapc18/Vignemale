
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
}

//Se necesita el id?
var generateJWT = function (mongo, id, config) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        birthDate: this.birthDate,
        creationDate: this.creationDate,
        leavingDate: this.leavingDate,
        lastAccess: this.lastAccess,
        removed: this.removed,
        place: this.place,
        isAdmin: this.isAdmin,
        isVerified: this.isVerified,
        firstLogin: this.firstLogin,
        exp: parseInt(expiry.getTime() / 1000),
    }, config.secret);
};




//var getInfoUser = mongoose.model('getInfoUser',get_info_user);
//var pois = mongoose.model('pois',poisSchema);
module.exports = {
    getInfoUser: getInfoUser,
    findUserByPassword: findUserByPassword,
    updatePassword: updatePassword,
    generateJWT: generateJWT,
    validPassword: validPassword
};
