(function () {
  function Chart() {
    this.ws;
    this.myPhone;
    this.TargetUserName;
    this.LoginBtn;
    this.inputUserName;
    this.LoginStateLabel;
    this.UserName;
    this.userDiv;
    this.init = function () {
      this.GetDominstance();
      this.myPhone = new RTCPeerConnection({
        iceServers: [
          {
            urls: "turn:134.175.227.69:3478",
            username: "SLOE",
            credential: "mgdowoqu741",
            credentialType: "password",
          },
        ],
      });
      this.myPhone.onaddstream = function (e) {
        var videoShow = document.createElement("video");
        videoShow.setAttribute("autoplay", "autoplay");
        videoShow.srcObject = e.stream;
        document.getElementById("VideoShow").appendChild(videoShow);
      };
      var self = this;
      this.myPhone.onicecandidate = function (e) {
        if (e.candidate) {
          ws.send(
            JSON.stringify({
              type: "ICE",
              candidate: e.candidate,
              TargetUserName: self.TargetUserName,
            })
          );
        }
      };
    };

    this.GetDominstance = function () {
      var self = this;
      this.LoginBtn = document.getElementById("Login");
      this.inputUserName = document.getElementById("username");
      this.LoginStateLabel = document.getElementById("LoginState");
      this.userDiv = document.getElementById("UserList");
      this.LoginBtn.addEventListener("click", function () {
        if (!self.IsLogin) {
          self.Login(self.inputUserName.value);
        } else {
          alert("你已经登陆了！");
        }
      });
    };
    this.IsLogin = false;
    this.Login = function (UserName) {
      var self = this;
      ws = new WebSocket("ws://aab.free.idcfengye.com");
      ws.onopen = function () {
        ws.send(JSON.stringify({ type: "Login", UserName }));
        self.IsLogin = true;
        self.UserName = UserName;
        self.LoginStateLabel.textContent = "登录状态：已登录";
      };
      ws.onclose = function () {
        self.IsLogin = false;
        self.LoginStateLabel.textContent = "登录状态：未登录！！！";
      };
      ws.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        switch (msg.type) {
          case "RenderUserList":
            self.userDiv.childNodes.forEach(function (m) {
              m.remove();
            });
            var NewUserDiv = document.createDocumentFragment();
            msg.userlist.forEach((u) => {
              NewUserDiv.appendChild(
                (function () {
                  var div = document.createElement("div");
                  div.textContent = u;
                  div.addEventListener("click", function () {
                    if (this.textContent !== self.UserName) {
                      navigator.getUserMedia(
                        { video: true, audio: true },
                        (stream) => {
                          self.myPhone.onaddstream({ stream });
                          self.myPhone.addStream(stream);
                          self.myPhone
                            .createOffer()
                            .then((offer) => {
                              return self.myPhone.setLocalDescription(offer);
                            })
                            .then(() => {
                              self.TargetUserName = this.textContent;
                              ws.send(
                                JSON.stringify({
                                  type: "offer",
                                  name: self.UserName,
                                  TargetUserName: this.textContent,
                                  sdp: self.myPhone.localDescription,
                                })
                              );
                            });
                        },
                        (err) => {
                          console.log(err);
                        }
                      );
                    } else {
                      alert("我不能让你自己跟自己打电话啊，那太令人疑惑了");
                    }
                  });
                  return div;
                })()
              );
            });
            self.userDiv.appendChild(NewUserDiv);
            break;
          case "ICE":
            var candidate = new RTCIceCandidate(msg.candidate);
            self.myPhone.addIceCandidate(candidate).catch((err) => {});
            break;
          case "offer":
            self.TargetUserName = msg.name;
            var desc = new RTCSessionDescription(msg.sdp);
            self.myPhone.setRemoteDescription(desc).then(() => {
              return navigator.getUserMedia(
                { video: true, audio: true },
                (stream) => {
                  self.myPhone.onaddstream({ stream });
                  self.myPhone.addStream(stream);
                  self.myPhone.createAnswer().then((answer) => {
                    self.myPhone.setLocalDescription(answer).then(() => {
                      ws.send(
                        JSON.stringify({
                          type: "answer",
                          name: UserName,
                          TargetUserName: msg.name,
                          sdp: self.myPhone.localDescription,
                        })
                      );
                    });
                  });
                },
                (err) => {
                  console.log(err);
                }
              );
            });
            break;
          case "answer":
            var desc = new RTCSessionDescription(msg.sdp);
            self.myPhone.setRemoteDescription(desc);
            break;
          default:
            break;
        }
      };
    };
  }
  var clientchart = new Chart();
  clientchart.init();
})();
