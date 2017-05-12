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

        $scope.verifyIsAdmin = function () {
            if($scope.logged()) {
                auth.getIdFromToken(auth.getToken(), function (id) {
                    users.getUser(id, function (data) {
                        if (data.message[0].isAdmin) {
                            window.alert("Es administrador");
                            $scope.isAdmin = true;
                        }
                    }, function (data) {
                        window.alert("Error verifying admin");
                    })
                })
            }
            else {
                window.alert("no esta logeado");
            }
        };

        // $scope.verifyIsAdmin();

    }]);
