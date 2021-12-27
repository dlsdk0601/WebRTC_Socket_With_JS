import http from "http"
import express from "express";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);
//이렇게 작성하는거는 일반 브라우저 방식, 소켓은 ws프로토콜로 작업해야함

const server = http.createServer(app);
//http 서버

const wss = new WebSocket.Server({server});
//websocket 서버

//이렇게 두가지 안해도됨. 소켓만 필요하면 소켓만 해도 무방

const sockets = []; //fake db 서버에 연결된 누군가를 여기에 넣을거임 

wss.on("connection", (socket) => {
    sockets.push(socket);

    socket.on("close", () => {
        console.log("disconnected from the Browser")
    }); //프론트가 브라우저를 꺼버렸을 경우

    socket.on("message", (message) => {
        console.log(message.toString('utf8'));
        sockets.forEach(aSocket => aSocket.send(message.toString("utf8")));
        //처음에 접속한 브라우저에게 보내는 방법

        
        // socket.send(message.toString('utf8'));
    }) // 프론트에서 보낸 message 받기 

    //socket.send("hello");  프론트로 data 보내기 
})
// addEventListener와 흡사한 형태. connection이 됐을때, 콜백 함수 실행 

server.listen(3000, handleListen)

