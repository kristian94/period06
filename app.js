var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/public"));

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var messageLog = [];
var sockets = [];
var currentVote = {
    name: 'Choose your next president',
    options: [
        'Clinton',
        'Trump'
    ],
    votes: []
}

function getClientFriendlyVoteObject(){
    var data = [0, 0]
    currentVote.votes.forEach(function(vote){
        data[vote.vote]++;
    })
    return {
        name: currentVote.name,
        options: currentVote.options,
        data: data
    }
}

function submitNewVote(newVote){
    currentVote.name = newVote.name;
    currentVote.options = newVote.options;
    currentVote.votes = [];
}

function submitVote(ip, voteId){
    var voteIndex = -1;
    currentVote.votes.forEach(function(value, index){
        if(value.ip == ip){
            voteIndex = index;
        }
    })
    if(voteIndex >= 0){
        currentVote.votes[voteIndex].vote = voteId;
    }else{
        currentVote.votes.push({
            ip: ip,
            vote: voteId
        })
    }
}


function sendTenLatestMessages(socket){
    let startIndex = messageLog.length - 10;
    if(startIndex < 0) startIndex == 0;
    let arr = messageLog.slice(startIndex, messageLog.length);
    arr.forEach(function(value, key){
        socket.emit('chat message', value);
    })
}

io.on('connection', function (socket) {
    console.log('a user connected');
    console.log(socket.request.connection.remoteAddress)

    sendTenLatestMessages(socket);
    socket.emit('vote update', getClientFriendlyVoteObject())


    socket.on('chat message', function(msg){
        messageLog.push(msg);

        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function () {
        io.emit('chat message', 'a user has disconnected')
        console.log('user disconnected');
    });

    socket.on('vote', function(voteId){
        submitVote(socket.request.connection.remoteAddress, voteId)
        console.log(currentVote.votes)
        io.emit('vote update', getClientFriendlyVoteObject())
    })
    socket.on('new vote', function(newVote){
        submitNewVote(newVote);
        io.emit('vote update', getClientFriendlyVoteObject())
    })
});


http.listen(port, ip, ()=> {
    console.log(`Server started, listening on port: ${port}, bound to ${ip}`)
});


