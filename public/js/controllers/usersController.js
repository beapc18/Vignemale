angular.module('vignemale')

    .controller('usersCtrl', ['$scope', '$state', 'users', function ($scope, $state, users) {

        //user id from url
        $scope.idUser = window.location.href.split('/')[5];

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

        // hide/show different layers
        $scope.showPOIs = function () {
            $scope.pois = true;
        };

        $scope.hidePOIs = function () {
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

        //Save data about user
        users.getUser($scope.idUser, function (data) {
            console.log(data.message);

            //save info about user
            $scope.user = {
                lastName: data.message[0].lastName,
                name: data.message[0].name
            };
            console.log($scope.user.lastName);
            window.alert($scope.user.name);
        }, showError);

    }]);