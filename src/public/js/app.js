

const socket = io();
//io는 아마도 socket 설치하고 생긴 함수(내장된 함수 일수도.) 이 함수를 통해서 백엔드와 연결시켜준다 


//------------------video call

const myFace = document.querySelector("#myFace");
const mute = document.querySelector("#mute");
const camera = document.querySelector("#camera");
const camerasSelect = document.querySelector("#cameras");

const welcome = document.querySelector("#welcome");
const call = document.querySelector("#call");
const textChat = document.querySelector("#textChat");
const textForm = document.querySelector("#textForm");

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

call.hidden = true;
textChat.hidden = true;

async function getCameras(){ //어떤 카메라를 쓸지 생성하는 함수
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        //유저가 가지고 있는 모든 메디아 정보
        
        const cameras = devices.filter(device => device.kind === "videoinput");
        //디바이스 중에서 카메라 정보만 가져오기

        const currentCamera = myStream.getVideoTracks()[0];
        //현재 켜져있는 카메라

        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label == camera.label){
                option.selected = true;
                //현재 선택된 카메라가 셀렉트 박스 젤 위에 보이게
            }
            camerasSelect.appendChild(option);
        })

    }catch(e){
        console.log(e)
    }
};

async function getMedia(deviceId){
    const initioalConstrains = {
        audio: true,
        video: { facingMode: "user"},  //브라우저든 모바일이든 무조건 셀카 카메라로 작동
    }
    const cameraConstraints = {
        audio: true,
        video: {
            deviedId: {exact: deviceId }  //exact 없이 적어주면 해당 아이디값의 카메라가 없을떄, 비디오가 실행 안된다. 
            //근데 위와 같이 적으면 카메라 찾다가 못찾으면 다른 카메라 실행
        }
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initioalConstrains
        )        
        // myStream 이라는 변수에 현재 가지고 있는 미디어 장치에 접근하는 방식
        // 가지고 오고싶은 정보를 객체 형식으로 파라미터로 넣어준다
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
            //젤 처음만 실행하면됨. 카메라 변경할때마다 실행되면 selectbox 길어짐
        }
    } catch(e){
        console.log(e);
    }
}

function handlemuteClick(){
    myStream.getAudioTracks().forEach( track => track.enabled = !track.enabled);
    //오디오 동작을 false 시켜줌
    //트랙을 가져와서 해당 트랙의 enabled 값을 바꿔주면 비활성화가 된다

    if(!muted){
        mute.innerText = "Unmute";
        muted = true;
    }else{
        muted = false;
        mute.innerText = "Mute";
    }
}

function handlecameraClick(){
    myStream.getVideoTracks().forEach(track =>  track.enabled = !track.enabled);
    if(!cameraOff){
        camera.innerText = "Turn Camera Off";
        cameraOff = true;
    }else{
        cameraOff = false;
        camera.innerText = "Turn Camera On";
    }
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value); 
    //카메라 바꿔줌
    if(myPeerConnection){
        // 누군가와 채팅중이라면 

        const videoTrack = mystream.getVideoTracks()[0];
        //현재 비디오 정보 
        console.log(myPeerConnection.getSenders());
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        //지금 현재 가지고 있는 메디아 중 비디오만 선택
        
        videoSender.replaceTrack(videoTrack);
        //현재 카메라 대신 다른 카레마 replace
    }
}

mute.addEventListener("click", handlemuteClick);
camera.addEventListener("click", handlecameraClick);
camerasSelect.addEventListener("input", handleCameraChange); 


// --------------------- welcoem Form (choose a room)

welcomeForm = welcome.querySelector("form");


async function startMedia(){
        await getMedia();
        makeconnection();
}

function hiddenWelcome(count){
    if(count > 1){
        alert("this room is full")
    }else{
        welcome.hidden = true;
        call.hidden = false;
        textChat.hidden = false;
    }
}

async function handleWelcomeSubmit(e){
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    await startMedia();
    socket.emit("join_room", input.value, hiddenWelcome);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// ---------------------------socket code

textForm.addEventListener("submit", (e) =>{
    // 본인이 submmit 했을때 채팅창에 뜨게 
    e.preventDefault();
    const input = textForm.querySelector("#textInput");
    const msg = input.value;
    
    myDataChannel?.send(msg);
    const li = document.createElement("li");
    li.innerText = msg;
    textForm.appendChild(li);
    input.value = "";
})

// someone joined
socket.on("welcome", async () => {
    // 누군가가 방에 들어오면 원래 방에 있던 브라우저에 실행되는 함수
    
    
    //"chat" 이라는 data channel 만들기
    myDataChannel = myPeerConnection.createDataChannel("chat");  //먼저 들어온 사람이 data channel 정의 
    myDataChannel.addEventListener("message", (event) => {
        // 보내는 채팅 evnet.data

        console.log(event.data);
        const li = document.createElement("li");
        li.innerText = event.data;
        textForm.appendChild(li);
    })
    console.log("make data channel");

    const offer = await myPeerConnection.createOffer();
    //다른 브라우저가 방에 참여 할 수있게 해주는 초대장 

    myPeerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomName);
    console.log("send the Offer");
})

socket.on("offer", async (offer) => {
    //방에 들어온 누군가의 브라우저에 실행되는 함수
    console.log("take the Offer");

    //datachannel이 있다면 이벤트 실행
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel; //나중에 들어온 사람이 data channel 정의하는 법
        myDataChannel.addEventListener("message", event => {
            //받는 채팅
            console.log(event.data);

            //받는 사람 채팅창에 뜨게 
            const li = document.createElement("li");
            li.innerText = event.data;
            textForm.appendChild(li);
        });
    })

    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sned the answer");
})

socket.on("answer", answer => {
    console.log("take the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("take candidate");
    myPeerConnection.addIceCandidate(ice);
})

//----------------RTC code
function makeconnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    //stun server 핸드폰으로 들어오면 오류 난다(같은 와이파이를 쓰면 오류 안남)
    // 즉 핸드폰을 쓰는 상대방을 찾아줘야함. (사실 pc는 어케 찾아주는지 모르겠음, 왜 자동으로 됐는지 의문)
    //stun server는 어떤 것을 request하면 인터넷에서 상대가 누군지 알려주는 서버
    // 전문적으로 할꺼면 만들어야하나, 구글 무료 서버를 쓴다. 

    myPeerConnection.addEventListener("icecandidate", handleIce); //멀리 떨어진 장치를 연결 시켜주는 프로토콜
    myPeerConnection.addEventListener("addstream", handleAddstream);
    myStream.getTracks().forEach( track => myPeerConnection.addTrack(track, myStream))
    // Tracks(비디오와 오디오 정보)를 가져와서 myStream에 추가하는 과정

    
}

function handleIce(data){
    console.log("got ice candidate");
    console.log("send candidate");
    console.log(data);

    socket.emit("ice", data.candidate, roomName);
}

function handleAddstream(data){
    console.log("take event from my peer");
    console.log("peer's Stram", data.stream);
    console.log("my Stram", myStream);

    const peersStream = document.querySelector("#peersStream");
    peersStream.srcObject = data.stream;
}

//--------------------------with socket.io
// const welcome = document.querySelector("#welcome");
// const room = document.querySelector("#room");
// const form = welcome.querySelector("form");
// const roomList = document.querySelector("#roomList ul");

// room.hidden = true;  // 처음에 채팅방 숨기기 

// let roomname;

// function addMessage(message){
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li");
//     li.innerText = message;
//     ul.append(li);
// }

// function handleMessageSubmit(e){
//     e.preventDefault();
//     const input = room.querySelector("#msg input");
//     let value = input.value;
//     socket.emit("new_message", value, roomname, () => {
//         addMessage(`You: ${value}`);
//     });
//     input.value = "";
// }

// function handleNicknameSubmit(e){
//     e.preventDefault();
//     const input = room.querySelector("#name input");
//     socket.emit("nickname", input.value);
// }

// function showRoom(nickname){
//     welcome.hidden = true;
//     room.hidden = false;
//     const h3 = room.querySelector("h3");
//     h3.innerText = `Room ${roomname}`;

//     addMessage(`${nickname} joined`);
    

//     const megForm = room.querySelector("#msg");
//     // const nameForm = room.querySelector("#name");
//     megForm.addEventListener("submit", handleMessageSubmit);
//     // nameForm.addEventListener("submit", handleNicknameSubmit);
// }

// function handleRoomSubmit(e){
//     e.preventDefault();
//     const roominput = form.querySelector("input#roomname");
//     const nickname = form.querySelector("input#name");
//     socket.emit("enter_room", roominput.value, nickname.value, showRoom);
    
//     roomname = roominput.value;
//     // socket.emit("enter_room", input.value, (msg) => {
//     //     console.log("server done" + msg)
//     // })
//     //websocket에서 send와 비슷한 느낌
//     //emit으로 어떠한 이벤트를 할수있고, 이름도 마음대로 지으면 됨 websocket처럼 clsoe, message 등등 안해도됨 
//     //파라미터를 보낼수 있는데, websocket처럼 객체를 stringify할 필요없이바로 보내진다. 
//     // emit의 인자로 콜백 함수 넣을수 있음, 어떠한 파라미터든 몇개든 넣을수 있지만 콜백함수는 제일 마지막에 넣는다 
//     roominput.value = "";
//     nickname.value = "";
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = `Room ${roomname} (${newCount})`;
//     addMessage(`${user} joined`);
// })
// //welcome이라는 이벤트를 받았을때 실행. 

// socket.on("bye", (left, newCount) => {
//     const h3 = room.querySelector("h3");
//     h3.innerText = `Room ${roomname} (${newCount})`;
//      addMessage(`${left} left`)
// })
// // socket.on("new_message", (msg) => addMessage(msg)) 밑에랑 동일함
// socket.on("new_message", addMessage)

// socket.on("room_change", (rooms) => { 
//     roomList.innerText = "";
    
//     if(rooms.length === 0){  //채팅방이 없다면 멈춰
//         return;
//     }
    
//     rooms.forEach(room => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     })
// });













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