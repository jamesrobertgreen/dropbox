app.controller('mainController', function ($scope, $q) {
    var dbx = null;
    $scope.files = [];
    $scope.selection = {};
    var filesToShare = [];
    var filesToShare2 = [];
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
                filesToShare2.push(file.url);
                $scope.test = filesToShare2;
            }
        });
        console.log('share = ', filesToShare);
        if (filesToShare.length != 0) {
            share(filesToShare);
        }

    };

    var share = function (filesToShare) {
        console.log('sharing ', filesToShare);
        window.plugins.socialsharing.shareWithOptions(options1, onSuccess, onError);
    };
    var share = function (filesToShare) {
        window.plugins.socialsharing.shareWithOptions(options2, onSuccess, onError);
    };

    // this is the complete list of currently supported params you can pass to the plugin (all optional)
    var options1 = {
        message: 'The folowing files have been shared with you', // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        files: filesToShare, // an array of filenames either locally or remotely
        url: 'http://google.com',
        chooserTitle: 'Select an app to share with' // Android only, you can override the default share sheet title
    }
    // this is the complete list of currently supported params you can pass to the plugin (all optional)
    var options2 = {
        message: 'The array is full of links this time', // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        files: filesToShare2, // an array of filenames either locally or remotely
        url: 'http://google.com',
        chooserTitle: 'Select an app to share with' // Android only, you can override the default share sheet title
    }
    var onSuccess = function (result) {
        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
    }

    var onError = function (msg) {
        console.log("Sharing failed with message: " + msg);
    }

    $scope.shareViaEmail1 = function () {

        // check for a configured email client
        window.plugins.socialsharing.canShareViaEmail( // share something
            window.plugins.socialsharing.shareViaEmail(
                '<html><p>Can we put HTML here?</p></html>',
                'Share PDFs via email', ['jrgreen@gmail.com'], // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                filesToShare, // FILES: null, a string, or an array
                onSuccess, // called when email was sent or canceled, no way to differentiate
                onError // called when something unexpected happened
            ));



    };

    $scope.shareViaEmail2 = function () {

        // check for a configured email client
        window.plugins.socialsharing.canShareViaEmail( // share something
            window.plugins.socialsharing.shareViaEmail(
                'test links - http://google.com',
                'Share PDFs via email', ['jrgreen@gmail.com'], // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                null, // FILES: null, a string, or an array
                onSuccess, // called when email was sent or canceled, no way to differentiate
                onError // called when something unexpected happened
            ));



    };

    $scope.shareViaEmail3 = function () {

        // check for a configured email client
        window.plugins.socialsharing.canShareViaEmail( // share something
            window.plugins.socialsharing.shareViaEmail(
                'test links - http://google.com<br> test2 - http://gmail.com',
                'Share PDFs via email', ['jrgreen@gmail.com'], // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                null, // FILES: null, a string, or an array
                onSuccess, // called when email was sent or canceled, no way to differentiate
                onError // called when something unexpected happened
            ));



    };


});