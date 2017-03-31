angular.module('vignemale')

    .controller('navbarCtrl', ['$scope', '$state', 'auth', function ($scope, $state, auth) {

        $scope.logged = function () {
            return auth.isAuthenticated();
        };

        $scope.logout = function () {
            auth.logout();
        }


    }])

    .directive('navbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/components/navbar.html',
            controller: 'navbarCtrl'
        }
    });
