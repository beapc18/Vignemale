angular.module('vignemale')

    .controller('verifyAccountCtrl', ['$scope', '$state', '$stateParams', 'users', function ($scope, $state, $stateParams, users) {

        //user id from url
        $scope.idUser = $stateParams.id;

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

        users.verifyAccount($scope.idUser, showSuccess, showError);

    }]);