Setup

- ```vagrant up``` to setup and start an instance of Mongo, not required if already running a local instance on port 27107
- ```npm install``` to install all the dependencies
- ```node server``` to startup, binds to port 9000

Open browser and go to ```http://localhost:9000/```

FAQ:
- Requires a mongodb instance to be available, all images uploaded are stored in base64 format
- A new task is created each time a new batch of images are uploaded
- Depending on the size of the images, the association of images to a task can lag
- All images are stored in the database and rendered by calling ```'/api/task/:taskid/image/:imgId```
- Only PNG is currently supported
- Not all error handling is gracefully handled!!!
- Image compression is handled by Imagemin [https://github.com/imagemin/imagemin]

TODO:
- Cleanup temporary images created as part of the upload process
- Fix CSS issue, when user uploads files through 'Drag & Drop' the progress bar status is incorrect 
- Look at using the client-side image rendering File API's to create thumbnails and attach to task
