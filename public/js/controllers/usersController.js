angular.module('vignemale')

    .controller('usersCtrl', ['$scope', '$state', '$stateParams', 'users', 'auth', 'pois', function ($scope, $state, $stateParams, users, auth, pois) {

        //user id from url
        $scope.idUser = $stateParams.id;
        $scope.poisList = "";
        $scope.routesList = "";

        $scope.newPoi = {
            name: "",
            description: "",
            keywords: "",
            lat: "",
            lng: "",
            shortURL: "",
            images: "",
            valoration: "",
            creator: ""
        };

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

        $scope.pois = true;
        $scope.routes = false;
        $scope.follows = false;
        $scope.favs = false;
        $scope.edit = false;
        $scope.createpoi = false;
        $scope.onePoiSelected = false;

        var markers= [];
        var map;
        var directionsService;
        var directionsDisplay;
        $scope.latitude = "";
        $scope.longitude = "";

        // hide/show different layers
        var showPoisList = function (data) {
            //update pois list
            $scope.poisList = data.message;
            var poisLen = $scope.poisList.length;

            //create markers from pois list
            var pos;
            for (i = 0; i < poisLen; i++) {
                addMarker({lat:data.message[i].lat,lng:data.message[i].lng},data.message[i].name);
            }
        };

        $scope.showPois = function () {
            users.getUserPois($scope.idUser,showPoisList);
            $scope.pois = true;
            $scope.createpoi = false;
            $scope.onePoiSelected = false;
            resetPoiInfo();
        };

        $scope.showPoi  = function (lat, lng, name, id) {
            $scope.hidePois();
            addMarker({lat:lat, lng:lng}, name);
            $scope.onePoiSelected = true;
            pois.getPoi(id, function (data) {
                $scope.newPoi = data;
            }, showError);
        };

        $scope.hidePois = function () {
            $scope.pois = false;
            deleteMarkers();
        };


        var showRoutesList  = function (data) {
            $scope.routesList = data.message;
        };

        $scope.showRoutes = function () {
            users.getUserRoutes($scope.idUser,showRoutesList);
            $scope.routes = true;
            $scope.createpoi = false;
            $scope.onePoiSelected = false;
            resetPoiInfo();
        };

        $scope.showRoute = function (route) {
            directionsDisplay.setMap(map);

            var pois = route.pois;
            var waypts = [];
            for(i = 0; i < pois.length; i++) {
                waypts.push({
                    location: {lat:pois[i].lat,lng:pois[i].lng},
                    stopover: true
                });
            }
            createRoute(waypts);
            $scope.routes = true;
        };


        $scope.hideRoutes = function () {
            $scope.routes = false;
            directionsDisplay.setMap(null);
        };

        $scope.showFollows = function () {
            $scope.follows = true;
            $scope.createpoi = false;
            $scope.onePoiSelected = false;
            resetPoiInfo();
        };

        $scope.hideFollows = function () {
            $scope.follows = false;
        };

        $scope.showFavs = function () {
            $scope.favs = true;
            $scope.createpoi = false;
            $scope.onePoiSelected = false;
            resetPoiInfo();
        };

        $scope.hideFavs = function () {
            $scope.favs = false;
        };

        $scope.showEdit = function () {
            $scope.edit = true;
        };

        $scope.showProfile = function () {
            $scope.edit = false;
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
            $scope.createpoi = true;
            $scope.pois = false;
        };

        //Create the poi with values
        $scope.createpoiFun = function () {
            $scope.newPoi.creator = $stateParams.id;
            pois.createPoi($scope.newPoi, showSuccess, showError);
            resetPoiInfo();
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
            initMap();
            users.getUserPois($scope.idUser, showPoisList);
            $scope.user = {
                lastName: data.message[0].lastName,
                name: data.message[0].name
            };
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
                valoration: "",
                creator: ""
            };
        }


        //*******************************************************************//
        //                  GOOGLE MAPS FUNCTIONS                            //
        //*******************************************************************//

        var myLatlng = new google.maps.LatLng(41.64514, -0.8689481);
        var mapOptions = {
            zoom: 13,
            center: myLatlng
        };

        var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

        google.maps.event.addListener(map, "click", function(event) {
            $scope.newPoi.lat = event.latLng.lat();
            $scope.newPoi.lng = event.latLng.lng();
        });

        function initMap(){
            /*var mapOptions = {
                zoom: 13,
                center: new google.maps.LatLng(41.64514, -0.8689481)
            };
            map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);*/

            directionsService = new google.maps.DirectionsService;
            directionsDisplay = new google.maps.DirectionsRenderer({map: map});


        }

        // Adds a marker to the map and push to the array.
        function addMarker(location, name) {
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                tittle: name
            });
            //marker.addListener('click', $scope.showPoi);
            markers.push(marker);
        }

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
        }

        function createRoute(waypts){
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

    }]);

//http://plnkr.co/edit/8YQGTn79AO4X7Tb7ann7?p=preview