var auth = firebase.auth();
var storageRef = firebase.storage().ref();

const FIREBASE_STORAGE_VIDEOS_FOLDER = "videos_cumple/"
const FIREBASE_STORAGE_JSONS_FOLDER = "JSONS/"

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

//Handle waiting to upload each file using promise
function uploadFileAsPromise(file) {
    return new Promise(function(resolve, reject) {
        var metadata = {
            'contentType': file.type
        };

        let folder = file.name.split('-')[1].split('.')[0] + '/'
            //Upload file
        var task = storageRef.child(FIREBASE_STORAGE_VIDEOS_FOLDER + folder + file.name).put(file, metadata)

        //Update progress bar
        task.on('state_changed',
            function progress(snapshot) {
                var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                console.log(file.name + ": " + percentage)
            },
            function error(err) {
                console.error('Upload failed:', error);
                reject()
            },
            function complete() {
                var url = task.snapshot.downloadURL;
                console.log(file.name + ": complete")
                name = file.name.split("-")[0]
                celeb = file.name.split("-")[1].split('.')[0]
                if (uploadedFiles[celeb] == null) {
                    uploadedFiles[celeb] = {}
                }
                if (uploadedFiles[celeb]['names']) {
                    uploadedFiles[celeb]['names'].push(toTitleCase(name.replace("_", " ")))
                } else {
                    uploadedFiles[celeb]['names'] = []
                    uploadedFiles[celeb]['names'].push(toTitleCase(name.replace("_", " ")))
                }

                uploadedFiles[celeb][name] = url

                document.getElementById('linkbox').innerHTML = '<a href="' + url + '">Click For File</a>';
                resolve()
            }
        )
    });
}

var uploadedFiles;

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.target.files;
    window.uploadedFiles = uploadedFiles
    uploadPromises = []

    uploadedFiles = {}
    for (var i = 0; i < files.length; i++) {
        uploadPromises.push(uploadFileAsPromise(files[i]));
    }
    console.log("All requests done")

    Promise.all(uploadPromises).then(values => {

        for (key in uploadedFiles) {
            var videosDataBaseRef = firebase.database().ref('videos_cumple/' + key + '/');
            /*videosDataBaseRef.once('value').then(function(snapshot) {


            });*/
            console.log("Finished: " + key)
            window._ = _
            uploadedFiles[key]['names'] = _.sortBy(uploadedFiles[key]['names']).join(', ')
            console.log(uploadedFiles[key]['names'])
            videosDataBaseRef.update(uploadedFiles[key])
        }
    });
}