var args = process.argv.splice(2);

var http = require('http');
var httpProxy = require('http-proxy');
var express = require('express');
var bodyParser = require('body-parser');

var servers = [];

var portNumber = 8001;
for (var i = 0; i < args[0]; i++) {
  var hostName = "http://localhost:" + portNumber;
  servers.push(hostName);
  serve(portNumber)
  portNumber++;

  if (args[0] - i == 1) {
    console.log(servers);
  }
}

var proxy = httpProxy.createProxyServer();
var count = 0;
http.createServer(function(request, response) {
  console.log("Recieved Request on main payload.");
  loadBalanceProxy(request, response);
}).listen(8000);

var currentServer = 1;
function loadBalanceProxy(request, response) {
  var current = currentServer%servers.length;
  currentServer++;
  var targetServer = servers[current];
  proxy.web(request, response, {
    target: targetServer
  });
}

function serve(PORT) {
  var app = express();
  app.use(bodyParser.urlencoded({extended : true}));
  app.listen(PORT);

  app.get("/", function(request, response) {
    console.log("Recieved Request on specific server with PORT: " + PORT);
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.end("You are currently on port " + PORT);
  });
}
