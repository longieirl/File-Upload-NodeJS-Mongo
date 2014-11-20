var express = require('express');
var app = express();
var mongoose = require('mongoose');
var multer = require('multer');
var Imagemin = require('imagemin');
var fs = require('fs');
var Schema = mongoose.Schema;
var async = require('async');

app.use(express.favicon()); // use standard favicon
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/static'));

// Application Settings
var imgs = ['png'];
var httpPort = 9000;
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/Drive';

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

// Image Data Schema
var ImageDataSchema = new Schema({
    url: {type: String, trim: true},
    thumb: {type: String, trim: true},
    bin: {type: String, trim: true},
    contentType: {type: String, trim: true}
});

// Exclude bin(ar), version and _id from result set being returned to the UI
ImageDataSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.imgId = ret._id;
        delete ret.__v;
        delete ret._id;
        delete ret.bin;
    }
});

var TaskSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    kind: {
        type: String,
        enum: ['thumbnail', 'detail']
    },
    url: {type: String, trim: true},
    createdAt: {type: Date, required: true, default: Date.now()},
    imgs: [ImageDataSchema]
});

// Create schema index
TaskSchema.index({createdAt: 1});

// Create TaskSchema model
var TaskModel = mongoose.model("Task", TaskSchema);

// Middleware i.e. do some logic like fire an email or trigger some other event
TaskSchema.pre('save', function (next) {
    console.log('Task saved...');
    next();
});

// Exclude bin(ar), version and _id from result set being returned to the UI
TaskSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.taskId = ret._id;
        delete ret.data;
        delete ret.__v;
        delete ret._id;
    }
});

app.configure(function () {
    app.use(function (req, res, next) {

        var handler = multer({
            inMemory: false, // TODO set this to true, currently writes output to disk
            dest: './static/tmp/',
            limits: { // Restrict to 5mg
                fileSize: 5 * 1024 * 1024,
                fieldNameSize: 100,
                files: 5,
                fields: 8
            },
            onFileUploadComplete: function (file) {
                console.log(file.originalname + ' finished...');
            },
            onError: function (error, next) {
                console.log(error);
                next(error);
            },
            onFileSizeLimit: function (file) {
                console.log('Failed: ', file.originalname)
                fs.unlink('./' + file.path) // delete the partially written file
            },
            onFileUploadStart: function (file) {
                if (imgs.indexOf(file.extension) == -1) {
                    console.log(file.extension + ' not supported: ')
                    return false;
                }
            }
        });

        handler(req, res, next);
    });
});

// Handle uploading of new images
app.post('/api/upload', function (req, res) {

    if (Object.keys(req.files).length === 0) {
        res.statusCode = 500;
        return res.send({error: 'Server error'});
    } else {
        //console.log('File Details ' + JSON.stringify(req.files));

        // Step 2. Iterate files and update task when optimisation is completed
        var fileList = [].concat(req.files.userFile);
        var minifiedBaseImages = [];

        async.each(fileList, function (fileItem, done) {

            // Create imagemin and optimize uploaded files
            var imagemin = new Imagemin()
                .src(fileItem.path)
                .use(Imagemin.jpegtran({progressive: true}))
                .use(Imagemin.pngquant());

            // When files have finished processing, update new task
            imagemin.run(function (err, files) {
                if (err) {
                    console.log('Error on optmization!' + err);
                }

                files.forEach(function (tmpFile) {
                    minifiedBaseImages.push(new Buffer(tmpFile.contents).toString('base64'));
                    console.log('Optmization on file is complete and appended to list');
                });

                done();
            });
        }, function (err) {
            if (err) {
                console.log('error during minfication', err)
                return next(err); //assumes you're using express with a next parameter
            }

            // Create new task
            var task = new TaskModel({
                name: {last: 'SomeUsername'},
                createdAt: Date.now()
            })

            // Append optmized images
            for (var x = 0; x < minifiedBaseImages.length; x++) {
                task.imgs.push({bin: minifiedBaseImages[x]});
            }

            // Save task with everything in it
            task.save(function (err) {
                if (!err) {
                    console.log("Image compressed and task updated");
                } else {
                    console.log(err);
                    return next(err);
                }
            });
        });

        res.statusCode = 200;
        res.json({
            success: true
        });
    }
});

// Say hi!
app.get('/api', function (req, res) {
    res.json({message: 'API is running'});
});

// Show ALL tasks restricted to 10 and sorted descending
app.get('/api/tasks', function (req, res) {
    return TaskModel.find(function (err, tasks) {
        if (err || !tasks) {
            res.statusCode = 500;
            return res.json({error: 'Server Error'});
        } else {
            return res.json(tasks);
        }
    }).sort([['createdAt', 'descending']]).limit(10);
});

// Show a specific task
app.get('/api/tasks/:taskid', function (req, res) {
    return TaskModel.findById(req.param('taskid'), function (err, task) {
        if (err || !task) {
            res.statusCode = 500;
            return res.json({error: 'Task not found'});
        } else {
            return res.json(task);
        }
    });
});

// Show image details belonging to a task
app.get('/api/task/:taskid/image/:imgId', function (req, res) {

    return TaskModel.findById(req.param('taskid'), function (err, task) {
        if (err || !task) {
            res.statusCode = 500;
            return res.json({error: 'Task not found'});
        } else {
            console.log("Found task, looking for image " + req.params.imgId);

            var img = task.imgs.id(req.params.imgId);
            if (err || !img) {
                res.statusCode = 500;
                return res.json({error: 'Image not found'});
            } else {
                var base64Image = new Buffer(img.bin, 'base64');
                res.writeHead(200, {'Content-Length': base64Image.length, 'Content-Type': 'image/png'});
                res.end(base64Image);
            }
        }
    });
});

var server = app.listen(httpPort, function () {
    console.log('listening on port %d', server.address().port);
});