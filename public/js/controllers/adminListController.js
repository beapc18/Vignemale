angular.module('vignemale')

    .controller('adminListCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users', 'adminList', function ($scope, $state, $stateParams,$httpParamSerializer, users, adminList) {

        $scope.listOfUsers = "";


        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";


        $scope.index= "";
        $scope.send= "";
        $scope.message= "";

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
            $scope.successMsg = message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };


        $scope.select = function (index,send) {
            $scope.index=index;
            $scope.send =send;
            console.log($scope.send);
        };


        $scope.sendMail = function () {
            console.log($scope.message);
            var userMail = $scope.listOfUsers[$scope.index];
            var userObject = {
                email : userMail.email,
                message: $scope.message
            };
            users.sendMail(userObject, showSuccess, showError);
        };

        $scope.deleteUser = function () {
            var index = $scope.index;
            var userDelete = $scope.listOfUsers[index];
            users.deleteUser(userDelete._id, function (data) {
                showSuccess(data.message);
                $scope.listOfUsers.splice(index, 1);
            }, showError);
        };

        adminList.listUsers(function (data) {
            $scope.listOfUsers = data;
        }, showError);


    }]);
