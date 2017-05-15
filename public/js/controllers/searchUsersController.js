angular.module('vignemale')

    .controller('searchUsersCtrl', ['$scope', '$state', 'auth', 'users', function ($scope, $state, auth, users) {

        // variables
        $scope.search = false;
        $scope.userSearch = "";
        $scope.foundUsers = "";
        $scope.found = false;

        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
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

        $scope.searchUsers = function () {
            users.search($scope.userSearch, function (data) {
                console.log(data);
                $scope.found = true;
                $scope.foundUsers = data;
            }, showError)
        };

    }]);