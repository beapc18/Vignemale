angular.module('vignemale')

    .controller('starterCtrl', ['$scope', '$state', 'vignemale', function ($scope, $state, vignemale) {

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

    }]);