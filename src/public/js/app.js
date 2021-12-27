
const messageList = document.querySelector("ul"); 
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

const socket = new WebSocket(`ws://${window.location.host}`); 


const makeMessage = (type, payload) => {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("connected to Browser");
}); //서버와 연결이 시작 됐을떄 

socket.addEventListener("message", (message) => {
    console.log("new message: ", message.data);

    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);

});// 서버에서 message를 받았을떄 

socket.addEventListener("close", () => {
    console.log("connected from Server");
}); // 서버와의 연결이 끊겼을떄 


setTimeout(()=> {
    socket.send("hello from the browser");
}, 10000);

function handleSubmit(e){
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_massage", input.value));
    input.value = "";
}

const handleNickSubmit = (e) => {
    e.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);

nickForm.addEventListener("submit", handleNickSubmit);