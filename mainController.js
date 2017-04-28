app.controller('mainController', function ($scope, $q) {
    var dbx = null;
    $scope.files = [];
    $scope.selection = {};
    var filesToShare = [];

    $scope.showFileList = function () {
        listFiles().then(files => {
            $scope.files.length = 0;
            // apply once we have all the files and urls
            $scope.$apply(function () {
                files.forEach(e => $scope.files.push(e));
            });
        });
    }

    listFiles = function () {
        var ACCESS_TOKEN = '5TvwQ0C2DlAAAAAAAAAADFU4naUdxFM-NjDCoJWAxLnCH8IK1VR1W37LhBd2l2mp';
        dbx = new Dropbox({
            accessToken: ACCESS_TOKEN
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

    $scope.submit = function (formData) {
        filesToShare.length = 0;
        $scope.files.forEach(file => {
            if ($scope.selection.selected[file.filename] === true) {
                filesToShare.push({
                    'filename': file.filename,
                    'url': file.url
                });
            }
        });
        console.log('share = ', filesToShare);
        if (filesToShare.length != 0) {
            shareViaEmail(filesToShare);
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
        console.log("Sharing failed with message: " + msg);
        if (window.navigator) {
            navigator.notification.alert('No email client configured for sharing.');
        }
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


});