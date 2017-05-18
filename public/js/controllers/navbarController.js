angular.module('vignemale')

    .controller('navbarCtrl', ['$scope', '$state', 'auth', 'users', function ($scope, $state, auth, users) {

        $scope.idUser = "";

        $scope.isAdmin = false;

        $scope.logged = false;


        $scope.logout = function () {
            auth.logout();
            $scope.idUser = "";
            $scope.isAdmin = false;
            $scope.logged = false;

        };

        $scope.goHome = function () {
            if($scope.isAdmin){
                $state.go('adminList');
            }else{
                $state.go('users', {id: $scope.idUser});
            }
        };

        $scope.showStatistics = function (num) {
            $state.go('userStatistics', {idUser: $scope.idUser,id: num});
        };

        $scope.showAdminStatistics = function (num) {
            $state.go('adminStatistics', {id: num});
        };


        $scope.$on('signIn', function (event, arg) {
            setId($scope.goHome);
        });

        var setId = function(callback){
            if(auth.isAuthenticated()){
                auth.getIdFromToken(auth.getToken(),function(id) {
                    $scope.idUser = id.message;
                    $scope.logged = true;
                    users.getUser(id.message, function (data) {
                        if (data.message[0].isAdmin) {
                            $scope.isAdmin = true;
                        }
                        callback();
                    }, function (data) {
                        $scope.isAdmin = false;
                    })
                });
            }else{
                $scope.logged = false;
            }
        }


        setId(function(){});

    }]);
