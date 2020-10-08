
    if(localStorage.getItem("name") !== null){
        window.location.href="dashboard.html";
    }

    document.querySelector('#google-login').addEventListener('click',function () {

        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function (data) {
            window.localStorage.setItem("name",data.additionalUserInfo.profile.name);
            window.localStorage.setItem("picture",data.additionalUserInfo.profile.picture);
            window.localStorage.setItem("userId",firebase.auth().currentUser.uid);

            window.location.href='dashboard.html';
        });


    });



