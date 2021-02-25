var ws = require("nodejs-websocket");

var Conns = [];
ws.createServer(function (conn) {
  Conns.push(conn);
  conn.on("text", function (str) {
    Conns.forEach((c) => {
      c.sendText(str);
    });
  });
  conn.on("close", function (code, reason) {
    console.log("关闭连接");
  });
  conn.on("error", function (code, reason) {
    console.log("异常关闭");
  });
}).listen(8001);
console.log("WebSocket建立完毕");
