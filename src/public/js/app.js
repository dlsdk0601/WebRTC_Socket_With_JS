const socket = io();
//io는 아마도 socket 설치하고 생긴 함수(내장된 함수 일수도.) 이 함수를 통해서 백엔드와 연결시켜준다 

const welcome = document.querySelector("#welcome");
const room = document.querySelector("#room");
const form = welcome.querySelector("form");
const roomList = document.querySelector("#roomList ul");

room.hidden = true;  // 처음에 채팅방 숨기기 

let roomname;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.append(li);
}

function handleMessageSubmit(e){
    e.preventDefault();
    const input = room.querySelector("#msg input");
    let value = input.value;
    socket.emit("new_message", value, roomname, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(e){
    e.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function showRoom(nickname){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname}`;

    addMessage(`${nickname} joined`);
    

    const megForm = room.querySelector("#msg");
    // const nameForm = room.querySelector("#name");
    megForm.addEventListener("submit", handleMessageSubmit);
    // nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(e){
    e.preventDefault();
    const roominput = form.querySelector("input#roomname");
    const nickname = form.querySelector("input#name");
    socket.emit("enter_room", roominput.value, nickname.value, showRoom);
    
    roomname = roominput.value;
    // socket.emit("enter_room", input.value, (msg) => {
    //     console.log("server done" + msg)
    // })
    //websocket에서 send와 비슷한 느낌
    //emit으로 어떠한 이벤트를 할수있고, 이름도 마음대로 지으면 됨 websocket처럼 clsoe, message 등등 안해도됨 
    //파라미터를 보낼수 있는데, websocket처럼 객체를 stringify할 필요없이바로 보내진다. 
    // emit의 인자로 콜백 함수 넣을수 있음, 어떠한 파라미터든 몇개든 넣을수 있지만 콜백함수는 제일 마지막에 넣는다 
    roominput.value = "";
    nickname.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname} (${newCount})`;
    addMessage(`${user} joined`);
})
//welcome이라는 이벤트를 받았을때 실행. 

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname} (${newCount})`;
     addMessage(`${left} left`)
})
// socket.on("new_message", (msg) => addMessage(msg)) 밑에랑 동일함
socket.on("new_message", addMessage)

socket.on("room_change", (rooms) => { 
    roomList.innerText = "";
    
    if(rooms.length === 0){  //채팅방이 없다면 멈춰
        return;
    }
    
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
});


// -------------------------websocket 버전
// const messageList = document.querySelector("ul"); 
// const messageForm = document.querySelector("#message");
// const nickForm = document.querySelector("#nick");

// const socket = new WebSocket(`ws://${window.location.host}`); 


// const makeMessage = (type, payload) => {
//     const msg = {type, payload};
//     return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//     console.log("connected to Browser");
// }); //서버와 연결이 시작 됐을떄 

// socket.addEventListener("message", (message) => {
//     console.log("new message: ", message.data);

//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);

// });// 서버에서 message를 받았을떄 

// socket.addEventListener("close", () => {
//     console.log("connected from Server");
// }); // 서버와의 연결이 끊겼을떄 


// function handleSubmit(e){
//     e.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));
//     const li = document.createElement("li");
//     li.innerText = `You: ${input.value}`;
//     messageList.append(li);
//     input.value = "";
// }

// const handleNickSubmit = (e) => {
//     e.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);

// nickForm.addEventListener("submit", handleNickSubmit);