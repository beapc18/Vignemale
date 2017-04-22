angular.module('vignemale')

    .controller('usersCtrl', ['$scope', '$state', '$stateParams', 'users', 'auth', function ($scope, $state, $stateParams, users, auth) {

        //user id from url
        $scope.idUser = $stateParams.id;
        $scope.poisList = "";
        $scope.createpoi = false;

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

        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(41.64514, -0.8689481)
        }

        $scope.map = new google.maps.Map(document.getElementById('googleMap'), mapOptions)


        // hide/show different layers
        var showPoisList = function (data) {
            $scope.poisList = data.message;
            var poisLen = $scope.poisList.length;
            console.log(poisLen);
            var markers = new Array(poisLen);

            var pos;
            for (i = 0; i < poisLen; i++) {
                console.log(data.message[i]);
                pos = new google.maps.LatLng(data.message[i].xCoord,data.message[i].yCoord);
                markers[i] = new google.maps.Marker({
                    position: pos,
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    title: 'Hello World!'
                });
                markers[i].addListener('click', $scope.showPoi);
            }
        };
        $scope.showPoi  = function () {
            console.log("hola");
        }

        $scope.showPois = function () {
            users.getUserPois($scope.idUser,$scope.pois);
            $scope.pois = true;
        };
        $scope.hidePois = function () {
            $scope.pois = false;
        };

        $scope.showRoutes = function () {
            $scope.routes = true;
        };

        $scope.hideRoutes = function () {
            $scope.routes = false;
        };

        $scope.showFollows = function () {
            $scope.follows = true;
        };

        $scope.hideFollows = function () {
            $scope.follows = false;
        };

        $scope.showFavs = function () {
            $scope.favs = true;
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
            users.getUserPois($scope.idUser, showPoisList);
            $scope.user = {
                lastName: data.message[0].lastName,
                name: data.message[0].name
            };
        }, showError);

    }]);

//http://plnkr.co/edit/8YQGTn79AO4X7Tb7ann7?p=preview