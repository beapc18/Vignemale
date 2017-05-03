angular.module('vignemale')

    .controller('adminListCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users', 'adminList', function ($scope, $state, $stateParams,$httpParamSerializer, users, adminList) {

        $scope.listOfUsers = "";


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
            //$scope.successMsg = message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        /*$scope.listUsers = function () {
            adminList.listUsers(function (data) {
                window.alert("DATOS RECIBIDOS:" + data);
                $scope.listOfUsers = data;
            }, showError);
        };*/

        $scope.editUser = function (id) {
            users.modifyUser()
        };

        adminList.listUsers(function (data) {
            $scope.listOfUsers = data;
        }, showError);


    }]);
