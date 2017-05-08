angular.module('vignemale')
// 'auth' service manage the authentication function of the page with the server
    .factory('auth', function ($state, $http, $httpParamSerializer, $stateParams) {

        var session = undefined,
            _authenticated = false;

        return {
            //return true if the user is authenticated
            isAuthenticated: function () {
                if (_authenticated) {
                    return _authenticated;
                } else {
                    var tmp = angular.fromJson(localStorage.sessionJWT);
                    //console.log("services - authenticate false, tmp=" + tmp);
                    if (tmp !== undefined) {
                        this.authenticate(tmp);
                        return _authenticated;
                    } else {
                        return false;
                    }
                }
            },

            //authenticate the [identity] user
            authenticate: function (jwt) {
                session = jwt;
                _authenticated = jwt !== undefined;
                localStorage.sessionJWT = angular.toJson(session);
            },

            getToken: function () {
                return 'JWT '+localStorage.sessionJWT.replace(/"/g,'');
            },

            //logout function
            logout: function () {
                session = undefined;
                _authenticated = false;
                localStorage.removeItem("sessionJWT");
                $state.go('starter');
            },

            getIdFromToken: function (token,callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/getIdFromToken',
                    headers: {
                        'Authorization': token
                    }
                }).success(function (data) {
                    //$state.go('users', {id: data.message}); --> poner en el callback del sign in q vaya a home
                    callbackSuccess(data);
                });
            },

            resetPassword: function (email, callbackSuccess, callbackError) {
                window.alert(email);
                $http({
                    method: 'POST',
                    url: '/resetPassword',
                    data: $httpParamSerializer(email),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data)
                })
            },

            //send the login info to the server
            signIn: function (userObject, callbackError) {
                var that = this;
                $http({
                    method: 'POST',
                    url: '/signIn',
                    data: $httpParamSerializer(userObject),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data, status, headers, params) {
                    that.authenticate(headers().authorization);
                    if(data.message === "admin") {
                        $state.go('adminList');
                    }
                    else {
                        $state.go('users', {id: data.message, idRequest: data.message}); //redirect user home
                    }
                }).error(function (data) {
                    if(data.message === "You must change your password") {
                        var userObject = {
                            id: data.id,
                            email: data.email
                        };
                        console.log("Services-signin. id " + userObject.id + " email " + userObject.email);
                        $state.go('password', {id: userObject.id}, {email: userObject.email});
                    }
                    callbackError(data);
                });
            },

            googleSignIn: function (token, callbackSuccess, callbackError) {
                var that = this;
                $http({
                    method: 'POST',
                    url: '/googleSignIn',
                    data: $httpParamSerializer(token),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data, status, headers) {
                    that.authenticate(headers().authorization);
                    $state.go('users',{id: data.message}); //redirect user home
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

//send the register info to the server
            signUp: function (userObject, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/signUp',
                    data: $httpParamSerializer(userObject),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            }
        };
    })

    .factory('users', function ($state, $http, $httpParamSerializer, auth) {
        return {

            getUser: function (id, callbackSuccess,callbackError) {
                //idRequest
                $http({
                    method: 'GET',
                    url: '/users/'+id,
                    /*params: {
                        idRequest
                    },*/
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            modifyUser: function (userObject, callbackSuccess,callbackError) {
                $http({
                    method: 'PUT',
                    url: '/users/'+userObject.id,
                    data: $httpParamSerializer(userObject),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            deleteUser: function (id, callbackSuccess, callbackError) {
                $http({
                    method: 'DELETE',
                    url: '/users/'+id,
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },


            //verifyAccount
            verifyAccount: function (id, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/users/'+id+'/verifyAccount'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            //password
            password: function (user, callbackSuccess,callbackError) {
                $http({
                    method: 'PUT',
                    url: '/users/'+user.id+'/password',
                    data: $httpParamSerializer(user),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    console.log("Services email " + data.email);
                    var userObject = {
                        email: data.email,
                        password: data.password
                    };
                    $state.go('signIn', {email: userObject.email}, {password: userObject.password});
                    callbackSuccess(userObject);
                }).error(function (data) {
                    callbackError(data);
                });
            },


            users: function (url, callbackSuccess,callbackError) {
                $http({
                    method: 'GET',
                    url: '/users'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            getUserPois: function (id, callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/users/'+id+'/pois'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    console.log("error");
                });
            },
            getUserRoutes: function (id, callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/users/'+id+'/routes'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    console.log("error");
                });
            },

            getUserFollows: function (id, callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/users/'+id+'/following'
                }).success(function (data) {
                    callbackSuccess(data[0].following);  //en data tiene q ir [following]
                }).error(function (data) {
                    console.log("error");
                });
            },

            getUserFavs: function (idUser, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/users/'+ idUser + '/favs'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            addFav:  function (idUser, idPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/users/'+ idUser + '/favs',
                    data: $httpParamSerializer(idPoi),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            deleteFav:  function (idUser, idPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'DELETE',
                    url: '/users/'+ idUser + '/favs',
                    data: $httpParamSerializer(idPoi),
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            followUser: function (idsUsers, callbackSuccess) {
                $http({
                    method: 'POST',
                    url: '/followUser/',
                    data: $httpParamSerializer(idsUsers),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            unfollowUser: function (idsUsers, callbackSuccess) {
                $http({
                    method: 'POST',
                    url: '/unfollowUser/',
                    data: $httpParamSerializer(idsUsers),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            search: function (words, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/search/users/'+words
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            sendMail: function (userObject, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/sendMail/' + userObject.email,
                    data: $httpParamSerializer(userObject.email),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            }
        };
    })

    .factory('pois', function ($state, $http, $httpParamSerializer, auth) {
        return {
            createPoi: function (poi, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/pois',
                    data: $httpParamSerializer(poi),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

             getPoi: function (id, callbackSuccess, callbackError) {
                 $http({
                     method: 'GET',
                     url: '/pois/' + id
                 }).success(function (data) {
                     callbackSuccess(data);
                 }).error(function (data) {
                     callbackError(data);
                 });
            },
            
            editPoi: function (newPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: '/pois/' + newPoi.idPoi,
                    data: $httpParamSerializer(newPoi),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }

                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },
            
            deletePoi: function (idPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'DELETE',
                    url: '/pois/'+idPoi,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            short: function (id, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/short/'+id
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            search: function (words, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/search/pois/'+words
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            }

        };
    })
    .factory('routes', function ($state, $http, $httpParamSerializer, auth) {
        return {
            createRoute: function (route, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/routes',
                    data: $httpParamSerializer(route),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            }
        };
    })
    
    .factory('adminList', function ($state, $http, $httpParamSerializer) {
        
        return {
            
            listUsers: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/admin/usersList'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError('ERROR');
                });
            }
        }
        })

    .factory('vignemale', function ($state, $http) {

        return {

            //send the register info to the server
            starter: function (url, callbackSuccess,callbackError) {
                $http({
                    method: 'GET',
                    url: '/starter'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError('ERROR');
                });
            }
        };

    });
