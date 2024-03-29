angular.module('vignemale')

    .controller('signInCtrl', ['$scope', '$state', 'auth','$rootScope', function ($scope, $state, auth,$rootScope) {

        // inputs visual variables
        $scope.email = "";
        $scope.password = "";
        $scope.click = false;

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
            /**
             * quitarlo de aqui?
             */
            if(error.message === "You must change your password"){
                //id is necessary for changing the password
                var userObject = {
                    id: error.id,
                    email: $scope.email,
                    password: "password"
                };

                $state.go('password', {id: userObject.id});
            }else{
                $scope.errorMsg = error.message;
                $scope.error = true;
            }
        };

        // show the success mensage
        var showSuccess = function (message) {
            $scope.successMsg = message.message;
            $scope.success = true;
            $rootScope.$broadcast('signIn', 'something');
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
            auth.signIn(userObject, showError,showSuccess);
        }


        $scope.allow = function () {
            $scope.click=true;
        }

        // send the register form to the auth service
        window.googleSignIn = function (googleUser) {

            if($scope.click){
                var id_token = googleUser.getAuthResponse().id_token;

                var data = {
                    token: id_token
                };
                var data = {
                    token: id_token
                };
                auth.googleSignIn(data, showSuccess, showError)
            }
        }

    }]);
