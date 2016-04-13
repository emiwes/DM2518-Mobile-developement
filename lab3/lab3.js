// When the DOM is ready...
$(function() {

    function resetLocation(heading){ 
        var h = heading;
        var test = navigator.geolocation.getCurrentPosition(function(location){
            var coords = location.coords;
            var newChannel = geohash(coords.latitude,3) + " " + geohash(coords.longitude,3) + " " + h;
            channel = newChannel;
            subscribe(newChannel);
            var guests = 0;
            $('#alpha-position').html(channel);
            getHistory();
        });
    } 

    function geohash( coord, resolution ) { 
        var rez = Math.pow( 10, resolution || 0 ); 
        return Math.floor(coord * rez) / rez; 
    }

    var channel = '';
    var heading = 'West';
    // Grab the elements
    var msg = $("#msg");
    var user = 'Anonymous';
    var buttonSend = $("#buttonSend");
    var buttonHistory = $("#buttonHistory");
    var output = $("#output");

    // Init PubNub
    var id = PUBNUB.uuid();
    var pubnub = PUBNUB.init({
    publish_key   : "pub-c-7fd548b4-2815-463d-9c1c-5187d45d49f5",
    subscribe_key : "sub-c-bea78536-e9a9-11e4-91d3-0619f8945a4f",
});


// receive messages
function subscribe(channel){
    pubnub.subscribe({
        'channel'   : channel,
        'callback'  : function(message) {
    
            if (message.id == id){
                var user = "Me";
                var msgType = "myMsg";
            }else{
                var user = message.user;
                var msgType = "theirMsg";
            }
            output.html(output.html() + '<div class="'+msgType+'"><b>' + user +"</b> (" + message.timestamp + "):<br/>" + message.msg + '</div>');
            output.animate({scrollTop: output[0].scrollHeight - output.height()}, 500);
        },
        presence: function(m){
            $('#presence').html(": " + m.occupancy + " users online");
        }
    });
}

resetLocation(heading);

// send messages
buttonSend.on('click', function() {
    var timestamp = new Date();
    timestamp = ((timestamp.getHours() < 10)? "0":"") + timestamp.getHours() + ":" + ((timestamp.getMinutes() < 10)? "0":"") + timestamp.getMinutes();

    pubnub.publish({
        'channel' : channel,
        'message' : {"msg": msg.val(), "heading":heading, "user":user, "timestamp":timestamp, "id":id}
    });
    msg.val("");
});

// check history
buttonHistory.on('click', function() {
    getHistory();
});

function getHistory(){
    output.html("");
    pubnub.history({
        count : 100,
        channel : channel,
        callback : function (message) {
            for(var x in message[0]){
                if (message[0][x].id == id){
                    var user = "Me";
                    var msgType = "myMsg";
                }
                else{
                    var user = message[0][x].user;
                    var msgType = "theirMsg";
                }
                output.html(output.html() + '<div class="' + msgType + '"><b> Sir ' + user +" </b>(" + message[0][x].timestamp + "):<br/>" + message[0][x].msg + '</div>');
            }
        }
    });
    output.animate({scrollTop: output[0].scrollHeight - output.height()}, 0);
}

window.addEventListener('deviceorientation', function(event) {
    var oldHeading = heading;
    var alpha = event.webkitCompassHeading;
    if (-45 > event.beta){
        heading = 'Danger';
    }
    else if(alpha === 0){
        return;
    }
    else if(315 <= alpha || 45 > alpha){
        heading = 'North';
    }
    else if(45 <= alpha && 135 > alpha){
        heading = 'East';
    }
    else if(135 <= alpha && 225 > alpha){
        heading = 'South';
    }
    else if(225 <= alpha && 315 > alpha){
        heading = 'West';
    }
    $('#compassImg').css('-webkit-transform','rotate(' + -alpha +'deg)');
    if(oldHeading != heading){
        $('#output').html('');
        pubnub.unsubscribe({'channel' : channel});
        resetLocation(heading);

    return;
    }
    else {
        return;
    }
}, false);

$('#userForm').submit(function(){
    if($('#user').val() != ""){
        user = $('#user').val();
        window.location = '#page2';
        return false;
    }
    else{

    }
});
});