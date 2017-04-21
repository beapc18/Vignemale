angular.module('vignemale')
// 'auth' service manage the authentication function of the page with the server
    .factory('auth', function ($state, $http, $httpParamSerializer) {

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

            getIdFromToken: function (callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/getIdFromToken',
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    $state.go('users', {id: data.message});
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
                }).success(function (data, status, headers) {
                    that.authenticate(headers().authorization);
                    $state.go('users',{id: data.message}); //redirect user home
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
                $http({
                    method: 'GET',
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

            getUserPOIs: function (id, callbackSuccess) {
                $http({
                    method: 'GET',
                    url: '/users/'+id+'/pois'
                }).success(function (data) {
                    console.log(data);
                    callbackSuccess(data);
                }).error(function (data) {
                    console.log("error");
                });
            }
        };
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