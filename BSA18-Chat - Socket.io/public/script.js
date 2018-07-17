(function () {
    let messages = document.getElementById("messages");
    let text = document.getElementById("text");
    let textSubmit = document.getElementById("submitText");
    let modal = document.getElementById('modal');
    let enteredUser = document.getElementById("enter-user");
    let nameInput = document.getElementById("name");
    let nickInput = document.getElementById("nick");
    let typingUsersInfo = document.getElementById("typing-users-info");
    let usersContainer = document.getElementById("usersContainer");




    //Some default data
    let userName = 'Anonim';
    let nickName = 'anonim';

    let typing = false;
    let status = "appeared";
    let timeout;

    let socket = io.connect();
    let timeoutTypingFunction = function () {
        typing = false;
        socket.emit("user ended typing", nickName);
    };

    let autoScroll = function () {
        document.getElementById("content-messages").scrollTo(0, document.getElementById("content-messages").scrollHeight);
    }

    text.onkeyup = function () {


        clearTimeout(timeout);
        timeout = setTimeout(timeoutTypingFunction, 2000);

        if (!typing) {
            typing = true;
            socket.emit('user typing', nickName);
        }
    }


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
            status: status
        };

        socket.emit('user entered', data);
        modal.style.display = "none";
    }

    textSubmit.onclick = (event) => {
        event.preventDefault();
        let data = {
            name: userName,
            text: text.value
        };
        text.value = '';

        socket.emit('chat message', data);
    };

    socket.on('chat history', (msgs) => {
        messages.innerHTML = '';
        for (const msg in msgs) {
            if (msgs.hasOwnProperty(msg)) {
                let messageElement = document.createElement('li');
                const data = msgs[msg];
                messageElement.innerHTML = data.name + ': ' + data.text;
                messages.appendChild(messageElement);
            }
        }

        autoScroll();
    });

    socket.on('chat message', (msg) => {
        let messageElement = document.createElement('li');
        messageElement.innerHTML = msg.name + ': ' + msg.text;
        if (msg.text.includes("@" + nickName)) {
            messageElement.classList.add("mentioned");
        }
        messages.appendChild(messageElement);

        autoScroll();
    });

    socket.on('user entered', (user) => {

        let userElement = document.createElement("div");
        userElement.innerHTML = `
        <div class="profile-card user-card">
            <div class="container">
              <div class="user-info row">
                <div class="row">
                  <div class="connect-info" id="user-${user.id}-status">
                    <div class="indicator ${user.status}"></div>
                    <div class="status">${user.status}</div>
                  </div>
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

    socket.on("get all users", (users) => {
        users.forEach(user => {
            let userElement = document.createElement("div");
            userElement.innerHTML = `
            <div class="profile-card user-card">
                <div class="container">
                  <div class="user-info row">
                    <div class="row">
                      <div class="connect-info" id="user-${user.id}-status">
                        <div class="indicator ${user.status}" ></div>
                        <div class="status">${user.status}</div>
                      </div>
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
    })

    socket.on('user typing', function (nameList) {
        typingUsersInfo.innerHTML = "";

        let typingUsersCount = nameList.length;

        if (typingUsersCount > 1) {
            typingUsersInfo.innerHTML = `${typingUsersCount} are typing...   `;
        } else if (typingUsersCount === 1) {
            typingUsersInfo.innerHTML = `${nameList[0]} is typing...`;
        } else {
            typingUsersInfo.innerHTML = "";
        }


    });

    socket.on('changed connection status', function (data) {
        id = data.userId;
        let status = data.status;
        let nick = data.nick;

        let statusIndicator = document.getElementById(`user-${id}-status`).firstElementChild;
        let statusText = document.getElementById(`user-${id}-status`).lastElementChild;

        if (status == "online") {
            statusIndicator.classList.remove("appeared");
            statusIndicator.classList.add(status);
            statusText.innerHTML = status;

        } else if (status == "just-left") {
            statusIndicator.classList.remove("online");
            statusIndicator.classList.add(status);
            statusText.innerHTML = "just left";

            //message that user go offline
            let messageElement = document.createElement('li');
            messageElement.innerHTML = `<i> @${nick} left the chat </i>`;
            messages.appendChild(messageElement);
        } else if (status == "offline") {
            statusIndicator.classList.remove("just-left");
            statusIndicator.classList.add(status);
            statusText.innerHTML = status;
        }
    });
})();
