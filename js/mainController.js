app.controller('mainController', function ($scope, $q, APP_CONFIG) {
    var dbx = null;
    $scope.files = [];
    $scope.selection = {};
    var filesToShare = [];

    $scope.showFileList = function () {
        var target = document.getElementById('dropbox-files');
        var spinner = new Spinner(opts).spin(target);

        listFiles().then(files => {
            $scope.files.length = 0;
            // apply once we have all the files and urls
            spinner.stop();
            $scope.$apply(function () {
                files.forEach(e => $scope.files.push(e));
            });
        });
    }

    listFiles = function () {
        dbx = new Dropbox({
            accessToken: APP_CONFIG.ACCESS_TOKEN
        });

        return dbx.filesListFolder({
                path: ''
            })
            .then(function (response) {
                // return the list of files
                return response.entries
            })
            .then(filelist => {
                // return once all of the urls for each file are in
                return $q.all(
                    filelist.map(file => dbx.sharingCreateSharedLink({
                        path: file.path_lower
                    }))
                );
            })
            .then(response => {
                return response.map(r => {
                    // return object containing the filename and url
                    return {
                        'filename': r.path.replace('/', ''),
                        'url': r.url
                    }
                });
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    $scope.share = function () {
        if ($scope.selection.selected == undefined) {
            notification('No files selected');
            return;
        }

        filesToShare.length = 0;
        $scope.files.forEach(file => {
            if ($scope.selection.selected[file.filename] === true) {
                filesToShare.push({
                    'filename': file.filename,
                    'url': file.url
                });
            }
        });
        // ensure that at least 1 selection was true
        if (filesToShare.length != 0) {
            shareViaEmail(filesToShare);
        } else {
            notification('Please select files to share');
        }

    };


    var shareViaEmail = function (filesToShare) {
        var html = createHTMLlinks(filesToShare);
        // check for a configured email client
        window.plugins.socialsharing.canShareViaEmail( // share something
            window.plugins.socialsharing.shareViaEmail(
                html,
                'Share PDFs via email',
                null, // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                null, // FILES: null, a string, or an array
                onSuccess, // called when email was sent or canceled, no way to differentiate
                onError // called when something unexpected happened
            ));
    };
    var onSuccess = function (result) {
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
    }
    var onError = function (msg) {
        notification('Email cannot be sent - ' + msg);
    }

    var createHTMLlinks = function (filesToShare) {
        // create an HTML link in the following format:
        // $FILENAME - <a href ="$URL">$URL</a>  
        var html = '';
        filesToShare.forEach(file => {
            html += '<br>';
            html += file.filename;
            html += ' - <a href ="' + file.url + '">' + file.url + '</a>';
        });
        return html;
    };

    var notification = function (message) {
        if (window.navigator) {
            navigator.notification.alert(message);
        } else {
            console.log(message);
        }
    };

});