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
                if (localStorage.sessionJWT) {
                    return 'JWT '+localStorage.sessionJWT.replace(/"/g,'');
                } else {
                    $state.go('unauthorized');
                }
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
                    callbackSuccess(data);
                });
            },

            resetPassword: function (email, callbackSuccess, callbackError) {
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
            signIn: function (userObject, callbackError,callbackSuccess) {
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
                    console.log("logged")
                    if(data.message === "You must change your password") {
                        var userObject = {
                            id: data.id,
                            email: data.email
                        };
                        console.log("Services-signin. id " + userObject.id + " email " + userObject.email);
                        $state.go('password', {id: userObject.id}, {email: userObject.email});
                    }else{
                        callbackSuccess(data);
                    }
                }).error(function (data) {
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
                }).success(function (data) {
                    console.log(data)
                    if(data.message[0].removed){}
                    callbackSuccess(data);
                }).error(function (data) {
                    if(data.message == "Removed"){
                        $state.go('starter');
                    } else{
                        callbackError(data);
                    }
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
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
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
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                    callbackSuccess(data);  //en data tiene q ir [following]
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
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            deleteFav:  function (idUser, idPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'DELETE',
                    url: '/users/'+ idUser + '/favs',
                    data: $httpParamSerializer(idPoi),
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            followUser: function (idFollow, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/users/' + idFollow + '/follow',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            unfollowUser: function (idUnfollow, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/users/' + idUnfollow + '/unfollow',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            isFollowed: function (idFollowed, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/users/' + idFollowed + '/isfollowed/',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                    data: $httpParamSerializer(userObject),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            getStatistics: function(idUser,id, callbackSuccess){
                $http({
                    method: 'GET',
                    url: '/users/'+idUser+'/statistics/'+id,
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                })
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
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()

                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            ratePoi: function (idPoi, rating, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/pois/'+idPoi+'/rating',
                    data: $httpParamSerializer(rating),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            isFav: function (idPoi, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/pois/' + idPoi + '/isfav',
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
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
            getRoute: function (id, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: '/routes/' + id
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },
            createRoute: function (route, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/routes',
                    data:route,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            deleteRoutes: function (idRoute, callbackSuccess, callbackError) {
                $http({
                    method: 'DELETE',
                    url: '/routes/'+idRoute,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },
        };
    })
    
    .factory('adminList', function ($state, $http, $httpParamSerializer, auth) {
        
        return {
            
            listUsers: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': auth.getToken()
                    },
                    url: '/admin/usersList'
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    if (data ==="Unauthorized") $state.go('unauthorized');
                    else callbackError(data);
                });
            },

            getAdminStatistics: function(id, callbackSuccess){
                $http({
                    method: 'GET',
                    url: '/admin/statistics/'+id,
                    headers: {
                        'Authorization': auth.getToken()
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                })
            }
        }
        })

    .factory('recommendations', function ($state, $http, $httpParamSerializer, auth) {
        return {
            share: function (recommendation, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: '/share',
                    data: $httpParamSerializer(recommendation),
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


    .service('maps', function ($state, $http, $httpParamSerializer, auth) {

        var map;
        var markers = [];
        var directionsService;
        var directionsDisplay;
        var myLatlng;
        var mapOptions;

        this.initMap = function(){
            myLatlng = new google.maps.LatLng(41.64514, -0.8689481);

            mapOptions = {
                zoom: 13,
                center: myLatlng
            };

            map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

            directionsService = new google.maps.DirectionsService;
            directionsDisplay = new google.maps.DirectionsRenderer({map: map});
        }

        this.centerPlace = function (lat, lng) {

            map.setCenter(new google.maps.LatLng(lat, lng));
        };

        this.centerInit = function () {
            map.setOptions(mapOptions)
        };


        this.getMap = function() {
            return map;
        };


        // Adds a marker to the map and push to the array.
        this.addMarker = function(location, name) {
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                tittle: name
            });
            markers.push(marker);
        }

        // Deletes all markers in the array by removing references to them.
        this.deleteMarkers = function() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
        }

        this.createRoute = function(waypts){
            directionsDisplay.setMap(map);
            directionsService.route({
                origin: waypts[0].location,
                destination: waypts[waypts.length-1].location,
                waypoints: waypts.slice(1, waypts.length-1),
                optimizeWaypoints: true,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                }
            });
        }



        this.hideRoute = function(){
            directionsDisplay.setMap(null);
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
