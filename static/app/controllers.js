function RouteCtrl($route) {

    var self = this;

    $route.when('/tasks', {template:'../pages/welcome.html'});

    $route.when('/tasks/:taskId', {template:'../pages/task-details.html', controller:TaskDetailCtrl});

    $route.otherwise({redirectTo:'/tasks'});

    $route.onChange(function () {
        self.params = $route.current.params;
    });

    $route.parent(this);

    this.addTask = function () {
        window.location = "#/tasks/add";
    };

}

function TaskListCtrl(Task) {

    this.tasks = Task.query();

}

function TaskDetailCtrl(Task) {

    this.task = Task.get({taskId:this.params.taskId});


    //this.saveWine = function () {
    //    if (this.wine.id > 0)
    //        this.wine.$update({wineId:this.wine.id});
    //    else
    //        this.wine.$save();
    //    window.location = "#/wines";
    //}
    //
    //this.deleteWine = function () {
    //    this.wine.$delete({wineId:this.wine.id}, function() {
    //        alert('Wine ' + wine.name + ' deleted')
    //        window.location = "#/wines";
    //    });
    //}

}