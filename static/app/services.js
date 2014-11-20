angular.service('Task', function ($resource) {
    return $resource('api/tasks/:taskId', {}, {
        update: {method:'PUT'}
    });
});