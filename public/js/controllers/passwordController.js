angular.module('vignemale')

    .controller('passwordCtrl', ['$scope', '$state', 'auth', '$stateParams', 'users', function ($scope, $state, auth, $stateParams, users) {


        // inputs visual variables
        $scope.newPassword = "";
        $scope.newRePassword = "";
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
        var showSuccess = function (userObject) {
            auth.signIn(userObject,showError);
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        // send the register form to the auth service
        $scope.password = function () {

            if($scope.newPassword !== $scope.newRePassword) {
                showError("Invalid passwords")
            } else{
                var user = {
                    password: $scope.newPassword
                };
                users.password(user, showSuccess, showError);

            }
        };

    }]);