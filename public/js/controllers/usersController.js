angular.module('vignemale')

    .controller('usersCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users', 'auth', 'pois',
        'recommendations','routes','maps', function ($scope, $state, $stateParams,$httpParamSerializer, users, auth, pois, recommendations, routes, maps) {

        //user id from url
        $scope.idRequest = "";
        $scope.idUser = $stateParams.id;
        $scope.poisList = "";
        $scope.routesList = "";
        $scope.idPoi = "";
        $scope.idRoute = "";
        $scope.source = "";
        $scope.followingList = "";
        $scope.favsList = "";
        $scope.rating = "";

        $scope.newPoi = {
            name: "",
            description: "",
            keywords: "",
            lat: "",
            lng: "",
            shortURL: "",
            images: "",
            rating: "",
            creator: ""
        };

        $scope.newRoute = {
            name: "",
            pois: "",
            creator: ""
        };

        $scope.message = {
            name: "",
            pois: "",
            creator: ""
        };



        $scope.recommendation = {
            userNameOrigin : "",
            userLastNameOrigin : "",
            email: "",
            message: "",
            isPoi: "",
            idPoiRoute: ""
        }

        $scope.oldPassword = "";
        $scope.newPassword = "";
        $scope.newRePassword = "";

        //user data
        $scope.user = {};

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";


        $scope.itsme = true;
        $scope.itsfollowed = false;

        $scope.show = "pois";


        var isPoi;

        var sort;

        $scope.latitude = "";
        $scope.longitude = "";

        var showFollowingList = function (data) {
            $scope.followingList = data;
        };

        $scope.showFollows = function () {
            $scope.show="follows";
            users.getUserFollows($scope.idUser,showFollowingList);
            resetPoiInfo();
            resetRouteInfo();

        };

        // acceder al home de otro, NO CAMBIA EN LA URL
        $scope.showOneFollow = function (id) {
            $scope.idUser = id;
            users.getUser($scope.idUser, function (data) {
                //save info about user
                //maps.initMap();
                users.getUserPois($scope.idUser, showPoisList);
                $scope.user = {
                    lastName: data.message[0].lastName,
                    name: data.message[0].name
                };
                $scope.itsMe();
                $scope.itsFollowed($scope.idUser);
            }, showError);
        };

        // hide/show different layers
        var showPoisList = function (data) {
            maps.deleteMarkers();
            //update pois list
            $scope.poisList = data.message;
            var poisLen = $scope.poisList.length;

            //create markers from pois list
            for (i = 0; i < poisLen; i++) {
                maps.addMarker({lat:data.message[i].lat,lng:data.message[i].lng},data.message[i].name);
            }
        };

        $scope.showPois = function () {
            users.getUserPois($scope.idUser,showPoisList);
            $scope.show="pois";
            resetPoiInfo();
            resetRouteInfo();
        };

        $scope.showPoi  = function (id) {
            $scope.show="onePoiSelected";
            $scope.idPoi = id;
            pois.getPoi(id, function (data) {
                $scope.newPoi = data;
                $scope.newPoi.shortURL = data.shortURL;

                $scope.hidePois();
                maps.addMarker({lat:data.lat, lng:data.lng}, data.name);
            }, showError);

            isPoi = true;
        };

        $scope.hidePois = function () {
            maps.deleteMarkers();
        };


        var showRoutesList  = function (data) {
            $scope.routesList = data;
        };

        $scope.showRoutes = function () {
            users.getUserRoutes($scope.idUser,showRoutesList);
            $scope.show="routes";
            resetPoiInfo();
            resetRouteInfo();
        };

        $scope.showRoute = function (route) {
            var pois = route.pois;
            var waypts = [];
            for(i = 0; i < pois.length; i++) {
                waypts.push({
                    location: pois[i].location,
                    stopover: true
                });
            }
            maps.createRoute(waypts);
            $scope.show="routeSelected";
            $scope.idRoute=route._id;
            isPoi = false;
        };


        $scope.hideRoutes = function () {
            maps.hideRoute();
        };


        $scope.showFavs = function () {
            users.getUserFavs($scope.idUser, showFavsList,function(){});
            $scope.show = "favs";
            resetPoiInfo();
            resetRouteInfo();
        };

        var showFavsList  = function (data) {
            $scope.favsList = data;
        };

        $scope.showEdit = function () {
            $scope.show="editUser";
        };

        // hide the error mensage
        $scope.hideError = function () {
            $scope.errorMsg = "";
            $scope.error = false;
        };
        // show the error mensage
        var showError = function (error) {
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showSuccess = function (message) {
            $scope.successMsg = message.message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        $scope.showCreatepoi = function () {
            $scope.show="createPoi";
        };

        //Create the poi with values
        $scope.createpoiFun = function () {
            $scope.newPoi.creator = $stateParams.id;

            $scope.newPoi.images = document.getElementById('image').files[0],
                r = new FileReader();
            r.readAsBinaryString($scope.newPoi.images);

            r.onloadend = function(e){
                var data = e.target.result;
                $scope.newPoi.image = 'data:image/png;base64,' + btoa(data);

                //  'data:image/png;base64,' + btoa(data);
                //send your binary data via $http or $resource or do anything else with it
                pois.createPoi($scope.newPoi, function (data) {
                    showSuccess(data);
                    $scope.showPois();
                }, showError);
            }
        };

        //al borrar un poi,si se vuelve a Pois sigue saliendo su marker hasta que se clika en alguno del resto
        $scope.duplicatePoi = function () {

            if($scope.itsMe()){
                $scope.newPoi.creator = $stateParams.id;
            }else{
                $scope.newPoi.creator = $scope.idRequest;
            }

            pois.createPoi($scope.newPoi, function (data) {
                showSuccess(data);
                $scope.showPois();
            }, showError);
        };

        $scope.showRatePoi = function () {
            $scope.show = "rate";
        };

        $scope.ratePoi = function () {
            window.alert($scope.rating)
            var rating = {
                idUser:  $scope.idUser,
                rating: $scope.rating
            };
            pois.ratePoi($scope.idPoi, rating, showSuccess, showError);
        };

        $scope.showCreateRoute = function () {
            $scope.show="createRoute";
            resetRouteInfo();
            //users.getUserPois($scope.idUser,showPoisList);
        };

        $scope.createNewRoute = function () {
            var route = sort.el.childNodes;

            if (route.length > 2){
                $scope.newRoute.creator = $stateParams.id;
                $scope.newRoute.pois = getWaypts();

                routes.createRoute($scope.newRoute, function (data) {
                    showSuccess(data);
                    $scope.showRoutes();
                }, showError);
            }
        };


        $scope.showEditPoi = function () {
            $scope.show="editPoi";
        };

        $scope.editPoiFun = function () {
            var newPoi = {
                idPoi : $scope.idPoi,
                name : $scope.newPoi.name,
                description : $scope.newPoi.description,
                keywords : $scope.newPoi.keywords,
                lat : $scope.newPoi.lat,
                lng : $scope.newPoi.lng,
                shortURL : $scope.newPoi.shortURL,
                rating : $scope.newPoi.rating
            };
            pois.editPoi(newPoi, showSuccess, showError);
            $scope.show="pois";

        };

        //al borrar un poi,si se vuelve a Pois sigue saliendo su marker hasta que se clika en alguno del resto
        $scope.removePoi = function () {
            var deletePoi = window.confirm('Are you sure?');
            if(deletePoi){
                pois.deletePoi($scope.idPoi, function (msg) {
                    showSuccess(msg);
                    $scope.showPois();
                }, showError);
            }
        };



        //modify user password
        $scope.modifyUser = function () {
            if($scope.newPassword === "" || $scope.oldPassword === ""
                || $scope.newPassword !== $scope.newRePassword) {
                showError({"message": "Invalid password"});
            } else if($scope.newPassword === $scope.oldPassword){
                showError({"message": "Old and new passwords cannot be the same"});
            } else {
                var userObject = {
                    id: $scope.idUser,
                    oldPassword: $scope.oldPassword,
                    newPassword: $scope.newPassword,
                    newRePassword: $scope.newRePassword
                };
                users.modifyUser(userObject, showSuccess, showError)
            }
        };

        //disable user account in db
        $scope.removeUser = function () {
            var deleteUser = window.confirm('Are you sure?');
            if(deleteUser){
                users.deleteUser($scope.idUser, function (data) {
                    auth.logout();
                }, showError);
            }
        };

        //Get data about user
        users.getUser($scope.idUser, function (data) {
            //save info about user
            maps.initMap();
            google.maps.event.addListener(maps.getMap(), "click", function(event) {
                $scope.$apply(function () {
                    $scope.newPoi.lat = event.latLng.lat();
                    $scope.newPoi.lng = event.latLng.lng();
                });

            });

            users.getUserPois($scope.idUser, showPoisList);
            $scope.user = {
                lastName: data.message[0].lastName,
                name: data.message[0].name
            };
            $scope.itsMe();
            $scope.itsFollowed($scope.idUser);
        }, showError);

        //Reset info about poi for avoiding show wrong info
        function resetPoiInfo() {
            $scope.newPoi = {
                name: "",
                description: "",
                keywords: "",
                lat: "",
                lng: "",
                shortURL: "",
                images: "",
                rating: "",
                creator: ""
            };
        }

        $scope.itsMe = function () {
            auth.getIdFromToken(auth.getToken(),function (data) {
                $scope.idRequest = data.message;
                if($scope.idUser === $scope.idRequest) {
                    $scope.itsme = true;
                }
                else {
                    $scope.itsme = false;
                }
            })
        };

        $scope.itsFollowed  = function (id) {
            if($scope.followingList.indexOf(id) !== -1) {
                //window.alert('id encontrado en array');
                $scope.itsfollowed = true;
            }
            else{
                //window.alert("No encontrado en array");
                $scope.itsfollowed = false;
            }
        };

        $scope.followFun = function () {
            auth.getIdFromToken(auth.getToken(),function (data) {
                $scope.idRequest = data.message;
            });
            var idsUsers = {
                idFollow: $scope.idUser,
                idRequest: $scope.idRequest
            };
            users.followUser(idsUsers, showSuccess);
            $scope.itsfollowed = true;
        };

        $scope.unfollowFun = function () {
            auth.getIdFromToken(auth.getToken(),function (data) {
                $scope.idRequest = data.message;
            });
            var idsUsers = {
                idUnfollow: $scope.idUser,
                idRequest: $scope.idRequest
            };
            users.unfollowUser(idsUsers, showSuccess);
            $scope.itsfollowed = false;
        };

        //add poi selected to fav to this user
        $scope.addFav = function () {
            auth.getIdFromToken(auth.getToken(), function (idUser) {
                var idPoi = {
                    "idPoi": $scope.idPoi
                };
                users.addFav(idUser.message, idPoi, showSuccess, showError);
            })
        };

        //Reset info about poi for avoiding show wrong info
        function resetRouteInfo() {
            $scope.newRoute = {
                name: "",
                pois: "",
                creator: ""
            };
        }

        $scope.showShare = function () {
            $scope.show="share";
        };

        $scope.share = function () {
            $scope.recommendation.isPoi = isPoi;

            if(isPoi){
                $scope.recommendation.idPoiRoute = $scope.idPoi;
            }else{
                $scope.recommendation.idPoiRoute = $scope.idRoute;
            }
            var id;

            if($scope.itsMe){
                id = $scope.idUser;
            }else{
                id = $scope.idRequest;
            }

            users.getUser(id,function(data){
                $scope.recommendation.userNameOrigin = data.message[0].name;
                $scope.recommendation.userLastNameOrigin = data.message[0].lastName;
                recommendations.share($scope.recommendation,function(data){
                    $scope.show = 'pois';
                    showSuccess(data);
                },showError);
            },showError);
        };




        //*******************************************************************//
        /**               DRAG AND DROP FUNCTIONS                            */
        //*******************************************************************//


        $scope.initDrag = function(){
            Sortable.create(drag, {
                group: "sorting",
                sort: true
            });
        }

        $scope.initDrop = function(){
            sort = Sortable.create(drop, {
                group: "sorting",
                sort: true,
                animation: 200,
                onSort: function (/**Event*/evt) {
                    var waypts = getWaypts();
                    if(waypts.length > 1){
                        var e = waypts.map(function(a) {return {location:a.location};});
                        maps.createRoute(e);
                    }
                    // same properties as onUpdate
                }
            })
        }

        function getWaypts(){

            var route = sort.el.childNodes;

            var waypts = [];
            var pois = $scope.poisList;

            for(i = 1; i<route.length ;i++){
                var j = 0;
                while(route[i].id != pois[j]._id){
                    j++;
                }
                waypts.push({
                    poi: pois[j]._id,
                    location: {lat:pois[j].lat,lng:pois[j].lng}
                });
            }
            return waypts;
        }
    }]);

//http://plnkr.co/edit/8YQGTn79AO4X7Tb7ann7?p=preview