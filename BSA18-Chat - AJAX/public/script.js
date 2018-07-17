(function () {
    let messages = document.getElementById("messages");
    let text = document.getElementById("text");
    let textSubmit = document.getElementById("submitText");
    let modal = document.getElementById('modal');
    let enteredUser = document.getElementById("enter-user");
    let nameInput = document.getElementById("name");
    let nickInput = document.getElementById("nick");
    let usersContainer = document.getElementById("usersContainer");




    //stock names
    let userName = 'Anonim';
    let nickName = 'anonim';

    let autoScroll = function () {
        document.getElementById("content-messages").scrollTo(0, document.getElementById("content-messages").scrollHeight);
    };

    enteredUser.onclick = function () {
        userName = nameInput.value;
        nickName = nickInput.value;

        if (userName == "" || nickName == "") {
            alert("Введіть ім'я та нікнейм");
            return;
        };

        let data = {
            name: userName,
            nick: nickName,
        };


        ajaxRequest({
            method: 'POST',
            url: '/users',
            data: data
        });
        modal.style.display = "none";
    }

    textSubmit.onclick = (event) => {
        event.preventDefault();
        let data = {
            name: userName,
            text: text.value
        };

        text.value = '';

        ajaxRequest({
            method: 'POST',
            url: '/messages',
            data: data
        });
    };

    let ajaxRequest = function (options) {
        let url = options.url || '/';
        let method = options.method || 'GET';
        let callback = options.callback || function () { };
        let data = options.data || {};
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.open(method, url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(JSON.stringify(data));

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.status == 200 && xmlHttp.readyState === 4) {
                callback(xmlHttp.responseText);
            };
        };
    };

    let getData = function () {
        ajaxRequest({
            url: '/messages',
            method: 'GET',
            callback: function (msgs) {
                msgs = JSON.parse(msgs);

                if (msgs.length != 0) {

                    messages.innerHTML = '';

                    for (const msg in msgs) {
                        if (msgs.hasOwnProperty(msg)) {
                            let messageElement = document.createElement('li');
                            const data = msgs[msg];
                            messageElement.innerHTML = data.name + ': ' + data.text;

                            //If mentioned
                            if (data.text.includes("@" + nickName)) {
                                messageElement.classList.add("mentioned");
                            }

                            messages.appendChild(messageElement);

                        };
                    };

                    autoScroll();
                }
            }
        });

        ajaxRequest({
            url: '/users',
            method: 'GET',
            callback: function (users) {
                users = JSON.parse(users);

                if (users.length != 0) {
                    usersContainer.innerHTML = "";

                    users.forEach(user => {
                        let userElement = document.createElement("div");
                        userElement.innerHTML = `
                                <div class="profile-card user-card">
                                    <div class="container">
                                      <div class="user-info row">
                                        <div class="row">
                                          <div class="column name-post-text">
                                            <div>${user.name}</div>
                                            <div>${user.nick}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                </div>
                                `

                        usersContainer.appendChild(userElement);
                    });
                }
            }
        });
    };


    getData();

    setInterval(() => {
        getData();
    }, 500)
})();