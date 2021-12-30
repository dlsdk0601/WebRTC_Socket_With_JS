# Zoom_CLone

> socket.io와 Websockets을 공부 하기 위한 레파지토리입니다!

## nodeJs

> websocket 서버 셋팅 

```
    const server = http.createServer(app);
    //http 서버

    const wss = new WebSocket.Server({server});
    //websocket 서버
```

> websocket이 연결이 돼있는 경우 콜백 함수를 불러 실행 시킨다 
    addEventListener와 매우 흡사한 형식

> 콜백 함수는 socket을 파라미터로 받는다
ex
```
    wss.on( "connection", CB(socket) )
```

> 파라미터로 받는 socket으로 메시지들을 서로 주고 받을 수 있다

```
    wss.on("connection", (socket) => {

        socket.on("close", () => {
            console.log("disconnected from the Browser")
        }); //프론트가 websocket을 종료 했을 때

        socket.on("message", (msg) => {

            const message = JSON.parse(msg.toString('utf8'));
            //단순히 텍스트 뿐 아니라,  
            //JSON의 형태로 더 많은 데이터를 주고 받는다

            socket.send(message.toString('utf8'));
            //프론트단으로 메세지를 보낸다. 
        }) 

    })
```

## JavaScript 

> websocket은 js에서 내장되어있는 api 이다.

```
    const socket = new WebSocket(`ws://${window.location.host}`); 
```


> 서버에서 어떠한 응답을 받았을 때, addEventListener로 받는다. 

```
    socket.addEventListener("message", (message) => {

        const li = document.createElement("li");
        li.innerText = message.data;
        messageList.append(li);
        //받은 메세지를 li태그에 넣어서 ul태그에 append 시킨다. 
    });
```

> 서버로 보낼때 또한 마찬가지이다.

```
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = messageForm.querySelector("input");

        socket.send(makeMessage("new_message", input.value));
        //메세지 보내기 

        const li = document.createElement("li");
        li.innerText = `You: ${input.value}`;
        messageList.append(li);
        input.value = "";
    });
```

---

# socket.io

> websocket의 부가기능이 아닌 리얼타임을 위한 프레임 워크. 

> 프론트단과 서버단에서 서로 emit으로 이벤트를 만들고, on으로 이벤트를 받는다

app.js
```
    socket.emit("new_message", value, roomname, () => {
        addMessage(`You: ${value}`);
    });
```

server.js
```
    socket.on("new_message", (msg, room, callback) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);  //방 전체 알림
        callback();
    })
```

## nodeJS

> websocket과 마찬가지로 서버를 만들어 준다 

```
    const wsServer = new Server(server);
```

>  연결은 websocket과 아주 흡사하다 

```
    wsServer.on("connection", socket => {
        socket.onAny((e) => {
            console.log(`socket event : ${e}`);
        });

        socket.on("enter_room", (roomname, done) => {            
            socket.join(roomname)
            done();
            socket.to(roomname).emit("welcome");
        })
    })
```

> adapter => 다른 서버에 있는 유저끼리는 정보를 주고 받을 수 있게 adapter가 도와준다.

```
    function publicRooms(){
        const { sockets: {adapter: { sids, rooms } } } = wsServer

        const publicRooms = [];
        rooms.forEach( (_, key) => {
            if(sids.get(key) === undefined) { //privite room을 찾아줌
                publicRooms.push(key);
            }
        })
        return publicRooms;
    }
```

> size => room에 접속한 유저의 수를 알 수 있다.

```
    function countRoom(roomName){
        return wsServer.sockets.adapter.rooms.get(roomName)?.size;
    }
```

> room 생성 => socket의 join 함수로 쉽게 생성 할 수 있다.

```
     socket.join("room 의 이름");
```

> disconnecting과 disconnect의 차이

```
    disconnecting => 방을 나가기 직전 / disconnect 방을 나간 후 
```

## JavaScript

> websocket과 흡사한 방식으로 서버와 연결한다

```
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        socket.emit("enter_room", input.value, showRoom);
    });
```


---

## admin

> socket에서 채팅방과 유저의 데이터들을 볼 수 있는 어드민 페이지를 제공해준다. 

> 기본 셋팅

server.js
```
    const wsServer = new Server(server, {
        cors: {
            origin: ["https://admin.socket.io"],
            credentials: true
        }
    });
```

server.js 
```
    instrument(wsServer, {
        auth: false
    })
    //어드민 페이지 로그인을 위한 설정 => false 해준 이유는 별 다른 로그인 없이 볼 수 있게 설정
```

> https://admin.socket.io 여기에 접속하면 admin 페이지 볼 수 있다. 
<img src="./admin.png"  width="700" height="370">

