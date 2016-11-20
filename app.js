var express = require("express");
var app = express();

app.use(express.static(__dirname+"/public"));

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var server = app.listen(port,ip,()=>{
  console.log(`Server started, listening on port: ${port}, bound to ${ip}`)
});

var io = require("socket.io")(server);

