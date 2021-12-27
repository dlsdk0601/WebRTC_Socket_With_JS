import http from "http"
import express from "express";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/pulic", express.static(__dirname + "/public"));
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

const handleConnection = (socket) => {  
    console.log(socket)
}

wss.on("connection", handleConnection)
// addEventListener와 흡사한 형태. connection이 됐을때, 콜백 함수 실행 

server.listen(3000, handleListen)

