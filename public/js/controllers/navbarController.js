angular.module('vignemale')

    .controller('navbarCtrl', ['$scope', '$state', 'auth', 'users', function ($scope, $state, auth, users) {

        $scope.idUser = "";

        $scope.isAdmin = false;

        $scope.logged = function () {
            return auth.isAuthenticated();
        };

        $scope.logout = function () {
            auth.logout();
        };

        $scope.getIdFromToken = function () {

            auth.getIdFromToken(auth.getToken(),function(id) {
                $state.go('users', {id: id.message});
            });
        };

        $scope.showStatistics = function (num) {
            auth.getIdFromToken(auth.getToken(),function(id) {
                $state.go('userStatistics', {idUser: id.message,id: num});
            });
        };

        $scope.showAdminStatistics = function (num) {
            $state.go('adminStatistics', {id: num});
        };

        $scope.verifyIsAdmin = function () {
            if($scope.logged()) {
                auth.getIdFromToken(auth.getToken(), function (id) {
                    users.getUser(id.message, function (data) {
                        if (data.message[0].isAdmin) {
                            $scope.isAdmin = true;
                        }
                    }, function (data) {
                        $scope.isAdmin = false;
                    })
                })
            }
            else {
                $scope.isAdmin = false;
            }
        };


        $scope.verifyIsAdmin();




    }]);
