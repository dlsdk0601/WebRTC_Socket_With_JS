import http from "http"
import express from "express";
import WebSocket from "ws";
import { instrument } from "@socket.io/admin-ui";

import { Socket, Server } from "socket.io";

const app = express();


const server = http.createServer(app);
//http 서버

const wsServer = new Server(server);



app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));


const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);
//이렇게 작성하는거는 일반 브라우저 방식, 소켓은 ws프로토콜로 작업해야함

//------------------video call
wsServer.on("connection", socket => {
    
    socket.on("join_room", (roomName, hiddenWelcome) => {
        let count = wsServer.sockets.adapter.rooms.get(roomName)?.size;
        if( count > 1){
            hiddenWelcome(count);
        }else{
            hiddenWelcome(count)
            socket.join(roomName);
            socket.to(roomName).emit("welcome", count);
        }
    });

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
        // 프론트단에 누가 방에 들어와서 offer를 서버에 주면 
        //그 offer를 해당 room에 다시 보내줘야한다. 
        // 채팅이 서버를 통해서 전달이 아닌 브라우자 랑 브라우저의 이벤트 이므로 서버는 각자의 주소만 알려주는 역할
        //그래서 offer를 받아서 다시 offer를 뿌려준다
    }) 

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })

})











//---------------------------socket.io 버전

//socket.io 버전
// const wsServer = new Server(server, {
//     cors: {
//         origin: ["https://admin.socket.io"],
//         credentials: true
//     }
// }); //어드민 페이지 보기위한 셋팅
 
// instrument(wsServer, {
//     auth: false
// }) //어드민 페이지 보안 설정 => 설정하면 아이디비밀번호 설정 가능


// function publicRooms(){
//     const { sockets: {adapter: { sids, rooms } } } = wsServer
//     //ws 서버에 adapter라는 기능이 있음 => 엄청 큰 앱은 하나의 db로 모든 유저를 다루지 않는다
//     //같은 프론트단을 보더라도 다른 서버를 이용 할 수도있음 
//     //이론상 다른 서버에 있는 유저끼리는 정보를 주고받고 못하지만 adapter가 해준다


//     // const sids = wsServer.sockets.adapter.sids;
//     // const rooms = wsServer.sockets.adapter.rooms;

//     const publicRooms = [];
//     rooms.forEach( (_, key) => {
//         if(sids.get(key) === undefined) { //privite room을 찾아줌
//             publicRooms.push(key);

//         }
//     })


//     return publicRooms;
// }

// function countRoom(roomName){
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }


// wsServer.on("connection", socket => {
//     socket["nickname"] = "someone";
//     socket.onAny((e) => {
//         console.log(`socket event : ${e}`);
//         //미들웨어같이 어디서든 콘솔 찍어줌
//     });

//     socket.on("enter_room", (roominput, nickname, done) => {
        
//         socket["nickname"] = nickname;
//         socket.join(roominput);
//         done(nickname);

//         socket.to(roominput).emit("welcome", socket.nickname, countRoom(roominput));
//         //방에 잇는 모두에세 메세지 보내기 
//         //welcome 이라는 이벤트를 모두에게 전송


//         // setTimeout(() => {
//         //     done("hello world")
//             //프론트단에서 보낸 콜백함수 
//             //이건 프론트단에서 실행되는 함수임. 
//             //그런데 콜백함수의 파라미터는 백엔드에서 설정 가능 
//         // }, 5000);

//         wsServer.sockets.emit("room_change", publicRooms());
//     })

//     socket.on("disconnecting", () => { //방을 떠나기 직전
//         socket.rooms.forEach(room => {
//             socket.to(room).emit("bye", socket.nickname, countRoom(room) -1 ); //본인이 떠나기 직전에 실행되니, 본인 퐇마그래서 -1 해줘야함
//         });
//     })
//     socket.on("disconnect", () => {  //방을 떠난 후 
//         wsServer.sockets.emit("room_change", publicRooms());
//         //방을 떠났기 떄문에 빈 배열 출력
//     })
//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//         done();
//     })
//     // socket.on("nickname", (name) => socket["nickname"] = name);
// })






//---------------------------websocket을 이용한 버전

// const wss = new WebSocket.Server({server});
//websocket 서버


// const sockets = []; 
// fake db 서버에 연결된 누군가를 여기에 넣을거임 

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "none";  //닉네임 설정 방법

//     socket.on("close", () => {
//         console.log("disconnected from the Browser")
//     }); 
//     //프론트가 브라우저를 꺼버렸을 경우

//     socket.on("message", (msg) => {

//         const message = JSON.parse(msg.toString('utf8'));
        
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));
//                 //처음에 접속한 브라우저에게 보내는 방법
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload
//                 break;
//         }
//         // socket.send(message.toString('utf8'));
//     }) 
//     // 프론트에서 보낸 message 받기 

//     //socket.send("hello");  프론트로 data 보내기 
// })
// // addEventListener와 흡사한 형태. connection이 됐을때, 콜백 함수 실행 




server.listen(3000, handleListen)

