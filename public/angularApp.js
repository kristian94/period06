/*    'btford.socket-io'   */

var app = angular.module("VoteApp", ['angularCharts']);

//This will/must be used if you are using OpenShift for hosting
/*function openShiftSocket(socketFactory,$location){
 var server =  $location.protocol() + "://" + $location.host()+":8000";
 var io_socket = io.connect(server);
 var socket = socketFactory({
 ioSocket: io_socket
 });
 return socket;
 }
 */


app.controller("VoteCtrl", function ($scope, $anchorScroll) {

    var socket = io();



    $scope.idk = function(){
        console.log('hey');
    }

    $scope.submitMsg = function ($event) {
        if($event.keyCode == 13 && $scope.msg){

            console.log($scope.msg)

            socket.emit('chat message', $scope.msg);

            $scope.msg = '';
        }
    }

    socket.on('chat message', function(msg){
        var log = angular.element(document.getElementById('log'));
        log.append(msg + '<br>');

    })


    socket.on('vote update', function(voteObject){
        console.log(voteObject)
        $scope.votes.data[0].y = voteObject.data;
        $scope.config.title = voteObject.name;
        $scope.optionA = voteObject.options[0];
        $scope.optionB = voteObject.options[1];
        $scope.$apply();
    })

    $scope.submitNewVote = function(){
        if($scope.newVoteName && $scope.newOptionA && $scope.newOptionB){
            socket.emit('new vote', {
                name: $scope.newVoteName,
                options: [
                    $scope.newOptionA,
                    $scope.newOptionB
                ]
            });
        }
    }

    //Do not focus on this part. Its just to set up the charts
    //https://github.com/chinmaymk/angular-charts/
    $scope.config = {
        title: '', // chart title. If this is false, no title element will be created.
        tooltips: true,
        labels: true, // labels on data points
        colors: ["green", "red"],
        legend: {
            display: true,
            position: 'left',
        },
        isAnimate: true, // run animations while rendering chart
    };

    $scope.vote = function (voteId) {
        console.log(`voted for ${voteId}`)
        socket.emit('vote', voteId);
    }

    $scope.votes = {
        data: [{
            x: "Series1",
            y: [0, 0]
        }]
    };

    $scope.updateVote = function(data){

    }

    $scope.initNewVote = function(newVote){
        $scope.votes = newVote.votes;
    }
});
