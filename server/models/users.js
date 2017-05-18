var mongoose = require('mongoose');

//Return data of user with id
var getInfoUser = function(mongo, id, callback){
    var response = {};

    //search the user avoiding return params which are not necessary
    mongo.users.find({_id: id}, { firstLogin: false, isVerified: false,
        lastAccess: false, creationDate: false, place: false, birthDate: false,
        email: false, password: false}, function (err, user) {
        if (err) {
            response = {"status": 500, "res": {"message": "Error searching user"}};
        } else {
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

var getFavs = function (mongo, idUser, callback) {
    mongo.users.find({_id: idUser}, {favs: 1, _id: 0}, function (err, data) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "message": "Error finding favs"};
        } else {
            response = {"status": 200, "res": {"message": data}};
        }
        callback(response);
    })
};

var addFav = function (mongo, idUser, idPoi, callback) {
    mongo.users.update({_id: idUser}, {$addToSet: {favs: idPoi}}, function (err, user) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error adding fav to user"}};
        }
        else {
            response = {"status": 200, "res": {"message": "Fav adding succesfully"}};
        }
        callback(response);
    })
};


var deleteFav = function (mongo, idUser, idPoi, callback) {
    mongo.users.update({_id: idUser}, {$pull: {favs: idPoi}}, function (err, user) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error deleting fav to user"}};
        }
        else {
            response = {"status": 200, "res": {"message": "Fav deleting succesfully"}};
        }
        callback(response);
    })
};

var getNameUser = function (mongo, idUser, callback) {
    mongo.users.find({_id: idUser}, {name: 1, _id: 0}, function (err, data) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error getting name"}};
        }
        else {
            response = {"status": 200, "res": {"message": data}};
        }
        callback(response.res);
    });
};

var getNamePOI = function (mongo, idPOI, callback) {
    mongo.pois.find({_id: idPOI}, {name: 1, _id: 0}, function (err, data) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error getting name"}};
        }
        else {
            response = {"status": 200, "res": {"message": data}};
        }
        callback(response.res);
    });
};

var getNamePOIcreator = function (mongo, idCreator, callback) {
    /*mongo.pois.distinct("rating", function (err, data) {
     if(err) {
     console.log("Error database");
     response = {"status": 500, "res": {"message": "Error getting creator from the POI"}};
     }
     else {
     console.log(data);
     response = {"status": 200, "res": {"message": data}};
     }
     });*/
    mongo.pois.find({creator: idCreator}, {rating: 1, _id: 0}, function (err, data) {
        var objId = new mongoose.mongo.ObjectId(idCreator);
        mongo.pois.aggregate([{$match: {creator: objId}}], function (err, data) {
            if (err) {
                console.log("Error database");
                response = {"status": 500, "res": {"message": "Error getting creator from the POI"}};
            }
            else {
                response = {"status": 200, "res": {"message": data}};
            }
            callback(response.res)
        });
    });
};

var ratePoi = function (mongo, idUser, idPoi, rating, callback) {
    var response = {};
    mongo.ratings.find({idUser: idUser, idPoi: idPoi}, function (err, data) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error rating poi"}};
        }
        else {
            //update mean in poi if the user hasn't voted yet
            if (data.length === 0){
                updateRatingPoi(mongo, idPoi, rating, function (response) {
                    if (response.status === 500) {
                        callback(response);
                    } else{
                        //save new rating, user poi and value
                        saveRating(mongo, idUser, idPoi, rating, function (response) {
                            callback(response);
                        });
                    }
                })
            }
            else{
                response = {"status": 200, "res": {"message": "You cannot rate twice the same POI"}};
                callback(response);
            }
        }
    });
};

//save new rating in table ratings
var saveRating = function (mongo, idUser, idPoi, rating, callback) {
    var db = new mongo.ratings;
    db.idUser = idUser;
    db.idPoi = idPoi;
    db.rating = rating;
    db.save(function (err) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error rating poi"}};
        } else {
            response = {"status": 200, "res": {"message": "POI rated successfully"}};
        }
        callback(response);
    })
};


//update mean in poi
var updateRatingPoi = function (mongo, idPoi, rating, callback) {
    var response = {};
    mongo.ratings.count({idPoi: idPoi}, function (err, votes) {
        if (err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error rating poi"}};
            callback(response);
        } else {
            mongo.pois.find({_id: idPoi}, {rating: 1, _id: 0}, function (err, mean) {
                if (err) {
                    console.log("Error database");
                    response = {"status": 500, "res": {"message": "Error rating poi"}};
                    callback(response);
                } else {
                    //calculate new mean and update it
                    var mean2 = mean[0].rating;
                    var div = (mean2*votes+Number(rating))/(votes+1);
                    mongo.pois.update({_id: idPoi}, {rating: div}, function (err, data) {
                        if (err) {
                            console.log("Error database");
                            response = {"status": 500, "res": {"message": "Error rating poi"}};
                        } else {
                            console.log(data);
                            response = {"status": 200, "res": {"message": "POI rated successfully"}};
                        }
                        callback(response);
                    })
                }
            })
        }
    });
};

//
var removePoisFromFavs = function (mongo, idPoi) {
    mongo.users.update({ }, { $pull: {favs: idPoi}}, {multi: true}, function (err, data) {
        if (err){
            console.log("Error removing fav poi "+idPoi+" from users")
        } else{
            console.log(data);
            console.log("Removed fav poi "+idPoi+" from users successfully")
        }
    });
};

var getUserPoisByCountry = function (mongo, idUser, callback) {
    var response;

    mongo.pois.aggregate([{$match: {creator: idUser}}, {$group: { _id: {country: "$country"}, total: {$sum: 1}}}], function(err, data) {
        if (err){
            console.log("Error getting user pois by country")
            response = {"status": 500, "res": {"message": "Error getting user pois by country"}};
        } else{
            var tot = 0;
            for(i=0; i<data.length; i++){
                tot += data[i].total;
            }
            response = {"array": data, "tot": tot};
        }
        callback(response);
    });
};

var getFollowingPoisByCountry = function (mongo, idUser, callback) {
    var response;
    mongo.users.find({_id: idUser}, {following: 1, _id: 0}, function (err, data) {
        mongo.pois.aggregate([{$match: {creator: {$in: data[0].following}}}, {$group: { _id: {country: "$country"},total: {$sum: 1}}}], function(err, data) {
            if (err){
                console.log("Error getting following user pois by country");
                response = {"status": 500, "res": {"message": "Error following user pois by country"}};
            } else{
                var tot = 0;
                for(i=0; i<data.length; i++){
                    tot += data[i].total;
                }
                response = {"array": data, "tot": tot};
            }
            callback(response);
        });
    });
};

var getUsersByPlace = function (mongo, callback) {
    var response;
    //mongo.users.find({isAdmin: {$ne: 1}}, function (err, data) {
    mongo.users.aggregate([{$group: {_id: "$place", count: {$sum:1}}}], function (err, data) {
        if(err) {
            console.log("Error database");
            response = {"status": 500, "res": {"message": "Error getting users by place"}};
        }
        else {
            console.log(data);
            response = {"status": 200, "res": {"message": data}};
            callback(response);
        }
    })
};

//following users' activity depending on pois and age
var getUserInfo = function (mongo, idUser, callback) {
    var response;
    mongo.users.find({_id: idUser}, {following: 1, _id: 0}, function (err, data) {
        mongo.users.find({_id: data[0].following}, {name: 1}, function (err, followings) {
            if (err){
                console.log("Error getting user info of pois");
                response = {"status": 500, "res": {"message": "Error getting user info of pois"}};
                callback(response);
            } else {
                mongo.pois.aggregate({$match: {creator: {$in: data[0].following}}}, {$group: { _id: {creator: "$creator"}, total: {$sum: 1}}}, function (err, data) {
                    if (err){
                        console.log("Error getting user info of pois");
                        response = {"status": 500, "res": {"message": "Error getting user info of pois"}};
                    } else{
                        response = { "follows": followings, "pois": data};
                    }
                    callback(response);
                });
            }
        })
    });
};

// pois by user and rating average
var getPoisRatingByUser = function (mongo, callback) {
    var response;
    mongo.users.find({isAdmin: {$ne: 1} }, {name: 1}, function (err, names) {

        if (err){
            console.log("Error getting user pois and rating average");
            response = {
                "status": 500,
                "res": {"message": "Error getting user pois and rating average"}
            };
            callback(response);
        } else {
            var users = [];
            for (i = 0; i < names.length; i++) {
                users.push(new mongoose.mongo.ObjectId(names[i]._id));
            }

            mongo.pois.aggregate({$match: {creator: {$in: users}}}, {
                $group: {
                    _id: "$creator",
                    y: {$avg: "$rating"},                //avg of rating all pois
                    r: {$sum: 1}                       //pois
                }
            }, function (err, data) {
                if (err) {
                    console.log("Error getting user pois and rating average");
                    response = {
                        "status": 500,
                        "res": {"message": "Error getting user pois and rating average"}
                    };
                } else {
                    response = {"pois": data, "names": names};
                }
                callback(response);
            });
        }
    });
};

var getGoogleUsers = function (mongo, callback) {
    var response;

    mongo.users.count({google: true}, function(err, google) {
        if (err){
            console.log("Error getting google users");
            response = {"status": 500, "res": {"message": "Error getting google users"}};
            callback(response);
        } else{
            mongo.users.count({google: false}, function(err, notGoogle) {
                if (err){
                    console.log("Error getting google users");
                    response = {"status": 500, "res": {"message": "Error getting google users"}};
                } else{
                    response = {"google": google, "notGoogle": notGoogle};
                    console.log(response)
                }
                callback(response);
            });
        }
    });
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
    removeFollowing: removeFollowing,
    getFavs: getFavs,
    addFav: addFav,
    deleteFav: deleteFav,
    getNameUser: getNameUser,
    getNamePOI: getNamePOI,
    ratePoi: ratePoi,
    updateRatingPoi: updateRatingPoi,
    saveRating: saveRating,
    removePoisFromFavs: removePoisFromFavs,
    getUserPoisByCountry: getUserPoisByCountry,
    getFollowingPoisByCountry: getFollowingPoisByCountry,
    getUserInfo: getUserInfo,
    getPoisRatingByUser: getPoisRatingByUser,
    getGoogleUsers: getGoogleUsers,
    getNamePOIcreator: getNamePOIcreator,
    getUsersByPlace: getUsersByPlace
};
