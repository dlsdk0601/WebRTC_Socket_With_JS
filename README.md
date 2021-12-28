# Zoom_CLone

> WebRTC와 Websockets을 공부 하기 위한 레파지토리입니다!

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

