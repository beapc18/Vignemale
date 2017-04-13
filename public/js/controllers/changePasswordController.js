angular.module('vignemale')

    .controller('changePasswordCtrl', ['$scope', '$state', 'users', function ($scope, $state, users) {


        // inputs visual variables
        $scope.password = "";
        $scope.rePassword = "";
        $scope.idUser = "";

        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

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

        // send the register form to the auth service
        $scope.changePassword = function () {

            if($scope.password !== $scope.rePassword) {
                showError("Invalid passwords")
            } else{
                $scope.idUser = window.location.href.split('/')[5];
                console.log($scope.idUser);
                var user = {
                    id: $scope.idUser,
                    password: $scope.password
                };
                users.changePassword(user, showSuccess, showError);
            }
        };

    }]);