var app = angular.module("MyApp", ['ngRoute', 'ngAnimate']);

// configure our routes
app.config(function($routeProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'pages/home.html',
            controller  : 'taskListCtrl'
        })

        // route for the about page
        .when('/tasks/:taskId', {
            templateUrl : 'pages/task-details.html',
            controller  : 'taskItemCtrl'
        })

        .when('/tasks', {
            templateUrl : 'pages/home.html',
            controller  : 'taskListCtrl'
        })

        .otherwise({redirectTo:'/tasks'});

});


app.controller('taskListCtrl', function ($scope, $http) {
    $scope.pageClass = 'page-home';

    $http.get('api/tasks').
        success(function (data, status, headers, config) {
            $scope.tasks = data;
        }).
        error(function (data, status, headers, config) {
            console.log('Error Received');
        });
});

app.controller("taskItemCtrl", function ($scope, $http, $routeParams) {
    $scope.pageClass = 'page-home';

    $routeParams.taskId;

    console.log('JL : ' + $routeParams.taskId);

    $http.get('api/tasks/' + $routeParams.taskId).
        success(function (data, status, headers, config) {
            $scope.taskItem = data;
        }).
        error(function (data, status, headers, config) {
            console.log('Error Received');
        });



});