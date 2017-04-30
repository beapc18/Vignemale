angular.module('vignemale')

// include the 'navbar.html' into the <navbar> tag
    .directive('navbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/components/navbar.html',
            controller: 'navbarCtrl'
        }
    })
    .directive('ngDrag',function(){
        function link(scope, element, attrs) {
            scope.initDrag();
        }
        return{
            link: link
        };

    })
    .directive('ngDrop',function(){
        function link(scope, element, attrs) {
            scope.initDrop();
        }
        return{
            link: link
        };

    })

;