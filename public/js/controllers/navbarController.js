angular.module('vignemale')

    .controller('navbarCtrl', ['$scope', '$state', 'auth', function ($scope, $state, auth) {

        $scope.idUser = "";

        $scope.logged = function () {
            return auth.isAuthenticated();
        };

        $scope.logout = function () {
            auth.logout();
        };

        $scope.getIdFromToken = function () {
            auth.getIdFromToken(function(id) {
                $scope.idUser = id;
            });
        }
    }]);
