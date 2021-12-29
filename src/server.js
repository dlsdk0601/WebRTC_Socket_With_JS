import http from "http"
import express from "express";
import WebSocket from "ws";

import { Socket, Server } from "socket.io";

const app = express();


const server = http.createServer(app);
//http 서버

// const wss = new WebSocket.Server({server});
//websocket 서버

//이렇게 두가지 안해도됨. 소켓만 필요하면 소켓만 해도 무방

//socket.io 버전
const wsServer = new Server(server);
 


app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);
//이렇게 작성하는거는 일반 브라우저 방식, 소켓은 ws프로토콜로 작업해야함


//---------------------------socket.io 버전
wsServer.on("connection", socket => {
    socket.onAny((e) => {
        console.log(`socket event : ${e}`);
        //미들웨어같이 어디서든 콘솔 찍어줌
    });

    socket.on("enter_room", (roomname, done) => {
        
        
        socket.join(roomname)
        done();

        socket.to(roomname).emit("welcome");
        //방에 잇는 모두에세 메세지 보내기 
        //welcome 이라는 이벤트를 모두에게 전송


        // setTimeout(() => {
        //     done("hello world")
            //프론트단에서 보낸 콜백함수 
            //이건 프론트단에서 실행되는 함수임. 
            //그런데 콜백함수의 파라미터는 백엔드에서 설정 가능 
        // }, 5000);
    })
})


//---------------------------websocket을 이용한 버전
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



//socket.io







server.listen(3000, handleListen)

