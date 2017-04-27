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
    
    $scope.submit = function(formData){
        filesToShare.length = 0;
        $scope.files.forEach(file =>{
           if ($scope.selection.selected[file.filename] === true){
               filesToShare.push({'filename':file.filename,'url':file.url});
           }
        });
        console.log('share = ' , filesToShare);

    };


});