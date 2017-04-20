angular.module('vignemale', ['ui.router', 'base64'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
        //añadir access:{restricted:true/false} para determinar las q tienen q estar logeadas para verlo

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
                templateUrl: "templates/users.html",
                controller: "usersCtrl"
            })

            .state('verifyAccount', {
                url: '/users/{id}/verifyAccount',
                templateUrl: "templates/verifyAccount.html",
                controller: "verifyAccountCtrl"
            })

            .state('changePassword', {
                url: '/users/{id}/changePassword',
                templateUrl: "templates/changePassword.html",
                controller: "changePasswordCtrl"
            })

            .state('resetPassword', {
                url: '/resetPassword',
                templateUrl: "templates/resetPassword.html",
                controller: "resetPasswordCtrl"
            });



        //llevar mejor a una pagina de error si la url no existe
        $urlRouterProvider.otherwise('starter');
    });