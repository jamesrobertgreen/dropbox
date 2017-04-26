var dbx = null;

function listFiles() {
    var ACCESS_TOKEN = '5TvwQ0C2DlAAAAAAAAAADFU4naUdxFM-NjDCoJWAxLnCH8IK1VR1W37LhBd2l2mp';
    dbx = new Dropbox({
        accessToken: ACCESS_TOKEN
    });
    dbx.filesListFolder({
            path: ''
        })
        .then(function (response) {
            displayFiles(response.entries);
            console.log(response);

        })
        .catch(function (error) {
            console.error(error);
        });


    return false;
}

function displayFiles(files) {
    var filesList = document.getElementById('files');
    var li;
    var link;
    for (var i = 0; i < files.length; i++) {
        console.log('file = ', files[i]);
        link = document.createElement('a');
        link.setAttribute('id', files[i].path_lower)

        li = document.createElement('li');
        li.appendChild(document.createTextNode(files[i].name));

        link.appendChild(li);
        filesList.appendChild(link);
        
        dbx.sharingCreateSharedLink({
                path: files[i].path_lower
            })
            .then(function (response) {
                ahref = document.getElementById(response.path);
                ahref.setAttribute('href', response.url);
            
                console.log('get share ', response.path);
                console.log('get share2 ', response);
            })
            .catch(function (error) {
                console.error(error);
            });


    }



};