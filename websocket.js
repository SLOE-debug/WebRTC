var ws = require("nodejs-websocket");

var Conns = [];
ws.createServer(function (conn) {
  var SelfUserName = "";
  conn.on("text", function (str) {
    var msg = JSON.parse(str);
    switch (msg.type) {
      case "Login":
        var existsUser = Conns.find((c) => c.UserName === msg.UserName);
        if (existsUser) {
          existsUser.Conn = conn;
        } else {
          SelfUserName = msg.UserName;
          Conns.push({ UserName: msg.UserName, Conn: conn });
          Conns.forEach((c) => {
            c.Conn.sendText(
              JSON.stringify({
                type: "RenderUserList",
                userlist: Conns.map((c) => c.UserName),
              })
            );
          });
        }
        break;
      case "ICE":
      case "offer":
      case "answer":
        if (msg.TargetUserName) {
          Conns.find((c) => c.UserName === msg.TargetUserName).Conn.sendText(
            str
          );
        } else {
          console.log(msg.type, str);
        }
        break;
      default:
        break;
    }
  });
  conn.on("close", function (code, reason) {
    Conns.splice(
      Conns.findIndex((c) => c.UserName === SelfUserName),
      1
    );
    console.log("关闭连接");
  });
  conn.on("error", function (code, reason) {
    Conns.splice(
      Conns.findIndex((c) => c.UserName === SelfUserName),
      1
    );
    console.log("异常关闭");
  });
}).listen(8001);
console.log("WebSocket建立完毕");
