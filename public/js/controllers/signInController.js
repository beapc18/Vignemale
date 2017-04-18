angular.module('vignemale')

    .controller('signInCtrl', ['$scope', '$state', 'auth', function ($scope, $state, auth) {

        // inputs visual variables
        $scope.email = "";
        $scope.password = "";

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
            if(error.message === "You must change your password"){
                //id is necessary for changing the password
                var userObject = {
                    id: error.id,
                    password: "password"
                };

                $state.go('changePassword', {id: userObject.id});
            }else{
                $scope.errorMsg = error.message;
                $scope.error = true;
            }
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
        $scope.signIn = function () {
            var userObject = {
                email: $scope.email,
                password: $scope.password
            };
            auth.signIn(userObject, showSuccess, showError);
        }
    }]);
