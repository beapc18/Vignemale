angular.module('vignemale', ['ui.router', 'base64'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            //starter screen
            .state('starter', {
                url: "/starter",
                templateUrl: "templates/starter.html",
                controller: "starterCtrl"
            })

            //sing up screen
            .state('signUp', {
                url: "/signUp",
                templateUrl: "templates/signUp.html",
                controller: "signUpCtrl"
            })

            .state('signIn', {
                url: "/signIn",
                templateUrl: "templates/signIn.html",
                controller: "signInCtrl"
            })

            .state('users', {
                url: '/users/{id}',
                params: {
                  idRequest: null   //id user from request, pass it always to recognize it
                },
                templateUrl: "templates/users.html",
                controller: "usersCtrl"
            })

            .state('verifyAccount', {
                url: '/users/{id}/verifyAccount',
                templateUrl: "templates/verifyAccount.html",
                controller: "verifyAccountCtrl"
            })

            .state('password', {
                url: '/users/{id}/password',
                templateUrl: "templates/password.html",
                controller: "passwordCtrl"
            })

            .state('resetPassword', {
                url: '/resetPassword',
                templateUrl: "templates/resetPassword.html",
                controller: "resetPasswordCtrl"
            })
            .state('pois', {
                url: '/pois/{id}',
                templateUrl: "templates/pois.html",
                controller: "poisCtrl"
            })
            .state('routes', {
                url: '/routes/{id}',
                templateUrl: "templates/routes.html",
                controller: "routesCtrl"
            })
            .state('searchPois', {
                url: '/search/pois',
                templateUrl: "templates/searchpois.html",
                controller: "searchPoisCtrl"
            })
            .state('searchUsers', {
                url: '/search/users',
                templateUrl: "templates/searchusers.html",
                controller: "searchUsersCtrl"
            })
            .state('adminList', {
                url: '/admin/usersList',
                templateUrl: "templates/adminList.html",
                controller: "adminListCtrl"
            })
            .state('userStatistics', {
                url: '/user/{idUser}/statistics/{id}',
                templateUrl: "templates/userStatistics.html",
                controller: "userStatisticsCtrl"
            })
            .state('adminStatistics', {
                url: '/admin/statistics/{id}',
                templateUrl: "templates/adminStatistics.html",
                controller: "adminStatisticsCtrl"
            })
            .state('unauthorized', {
                url: '/unauthorized',
                templateUrl: "templates/unauthorized.html"
            });

        $urlRouterProvider.otherwise('starter');
    });