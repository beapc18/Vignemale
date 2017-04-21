angular.module('vignemale')

    .controller('usersCtrl', ['$scope', '$state', '$stateParams', 'users', 'auth', function ($scope, $state, $stateParams, users, auth) {

        //user id from url
        $scope.idUser = $stateParams.id;
        $scope.poisList = "";

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



        // hide/show different layers
        $scope.POIs = function (data) {
            $scope.poisList = data.message;
        };


        $scope.showPOIs = function () {
            users.getUserPOIs($scope.idUser,$scope.POIs);
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
            $scope.user = {
                lastName: data.message[0].lastName,
                name: data.message[0].name
            };
        }, showError);

    }]);

//http://plnkr.co/edit/8YQGTn79AO4X7Tb7ann7?p=preview