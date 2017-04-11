
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




//var getInfoUser = mongoose.model('getInfoUser',get_info_user);
//var pois = mongoose.model('pois',poisSchema);
module.exports = {
    getInfoUser: getInfoUser,
    findUserByPassword: findUserByPassword,
    updatePassword: updatePassword
};
