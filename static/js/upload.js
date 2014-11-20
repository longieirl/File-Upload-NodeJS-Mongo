$(function () {
    var timerId;

    $('success').removeAttr('disabled');

    function setTimer() {
        timerId = setInterval(function () {
            if ($('#userFileInput').val() !== '') {
                clearInterval(timerId);
                $('#uploadForm').submit();
            }
        }, 500);
    }

    function setProgress(percent) {
        $('#percent').html(percent + '%');
        $('#bar').css('width', percent + '%');
    }

    setTimer();
    $('#uploadForm').submit(function () {
        status('0%');
        var formData = new FormData();
        var files = document.getElementById('userFileInput').files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('userFile', file, file.name);
        }
        //formData.append('userFile', file);
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('post', '/api/upload', true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable)
                setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = function (e) {
            status('error while trying to upload');
        };
        xhr.onload = function () {
            $('#userFileInput').val('');
            setProgress(0);
            var resJson = JSON.parse(xhr.responseText);
            setTimer();
            if (resJson.success) {
                status('All files have been uploaded and optimised successfully');
                success();
                //window.open('./uploads/' + resJson.savedAs, 'upload', 'status=1, height = 300, width = 300, resizable = 0');
                document.getElementById('image-uploaded').className = '';
            }
        };
        xhr.send(formData);
        return false; // no refresh
    });
    function status(message) {
        $('#status').text(message);
    };
    function success() {
        document.getElementById('success').className = '';
    };
});