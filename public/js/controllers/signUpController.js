angular.module('vignemale')

    .controller('signUpCtrl', ['$scope', '$state', 'auth', function ($scope, $state, auth) {

        // inputs visual variables
        $scope.name = "";
        $scope.lastName = "";
        $scope.email = "";
        $scope.birthDate = "";
        $scope.place = "";

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
            $scope.errorMsg = error;
            $scope.error = true;
        };

        // show the success mensage
        var showSuccess = function (message) {
            $scope.successMsg = message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        // send the register form to the auth service
        $scope.signUp = function () {
            var userObject = {
                name: $scope.name,
                lastName: $scope.lastName,
                email: $scope.email,
                birthDate: $scope.birthDate,
                place: $scope.place
            };
            auth.signUp(userObject, showSuccess, showError);
        }
    }]);
