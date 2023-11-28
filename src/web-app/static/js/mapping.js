var navigation = false;
var pathed = false;
var homing = false;
var MAP_WIDTH = (window.innerWidth)*0.65;
var MAP_HEIGHT = window.innerHeight - (window.innerHeight)*0.08;

$(document).ready(function() {
    $body = $("body");
    var ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
    });

    cmd_vel_listener = new ROSLIB.Topic({
        ros: ros,
        name: "/cmd_vel",
        messageType: 'geometry_msgs/Twist'
    });

    move = function(linear, angular) {
        var twist = new ROSLIB.Message({
            linear: {
                x: linear,
                y: 0,
                z: 0
            },
            angular: {
                x: 0,
                y: 0,
                z: angular
            }
        });
        cmd_vel_listener.publish(twist);
    };

    createJoystick = function() {
        var options = {
            zone: document.getElementById('zone_joystick'),
            threshold: 0.1,
            position: { left: '18%', bottom: '20%' },
            mode: 'static',
            size: 150,
            color: 'blue',
        };
        manager = nipplejs.create(options);

        linear_speed = 0;
        angular_speed = 0;

        manager.on('start', function(event, nipple) {
            timer = setInterval(function() {
                move(linear_speed, angular_speed);
            }, 25);
        });

        manager.on('move', function(event, nipple) {
            max_linear = 0.2; // m/s
            max_angular = 0.8; // rad/s
            max_distance = 75.0; // pixels;
            linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance / max_distance;
            angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance / max_distance;
        });

        manager.on('end', function() {
            if (timer) {
                clearInterval(timer);
            }
            self.move(0, 0);
        });
    };

    window.onload = function() {
        createJoystick();
    };    

});