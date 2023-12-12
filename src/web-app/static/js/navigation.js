var navigation = false;
var pathed = false;
var homing = false;
var MAP_WIDTH = (window.innerWidth)*0.65;
var MAP_HEIGHT = window.innerHeight - (window.innerHeight)*0.08;
var value =    document.cookie;



$("#drop-text").change(function() {
    alert($("#drop-text :selected").text())
});

$(document).ready(function() {
    $body = $("body");
    $(".dropdown-content a").click(function(event) {
        $body = $("body");
        event.preventDefault();
        robotvisible =true;

        value = event.target.firstChild.data
        imageurl(value)
        $.ajax({
            url: '/navigation/loadmap',
            type: 'POST',
            data: value,
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error);
            }

        })
        $body.addClass("loading");
        loading();

    });

    function loading() {
        var rosTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/rosout_agg',
            messageType: 'rosgraph_msgs/Log'
        });

        rosTopic.subscribe(function(message) {

            if (message.msg == "odom received!") {
                console.log(message.msg)
                $body.removeClass("loading");
            }

        });
    }

    window.imageurl = function(value) {

        NAV2D.ImageMapClientNav({
            ros: ros,
            viewer: viewer,
            rootObject: viewer.scene,
            serverName: '/move_base',
            image: `/static/${value}.png`
        });
    }



    var ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
    });


    // Create the main viewer.
    var viewer = new ROS2D.Viewer({
        divID: 'nav',
        width: MAP_WIDTH,
        height: MAP_HEIGHT
    });


    var imageMapClientNav = new NAV2D.ImageMapClientNav({
        ros: ros,
        viewer: viewer,
        rootObject: viewer.scene,
        serverName: '/move_base',
        image: `/static/${value}.png`
    });


    var gridClient = new NAV2D.OccupancyGridClientNav({
        ros: ros,
        rootObject: viewer.scene,
        viewer: viewer,
        serverName: '/move_base',
        continuous: true
    });

    var sendGoalPub_ = new ROSLIB.Topic({
        ros : ros,
        name : '/move_base_simple/goal',
        messageType : 'geometry_msgs/PoseStamped'
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
    }

    createJoystick = function() {
        var options = {
            zone: document.getElementById('zonejoystick'),
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
    }


    window.onload = function() {
        createJoystick();
    }

    var pose_ = new ROSLIB.Message({
        header: {
            stamp: {
                secs: 0,
                nsecs: 0
            },
            frame_id: "map"
        },
        pose: {
            position: {
                x: 0.0,
                y: 0.0,
                z: 0.0
            },
            orientation: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
                w: 0.1
            }
        }
    });

    function mapchangegraphical() {

        imageMapClientNav.addImg();
    };


    function mapchangelive() {

        imageMapClientNav.removeImg();

    }
    var pan = new ROS2D.PanView({
        ros: ros,
        rootObject: viewer.scene
    });

    window.pane = function(a, b) {
        pan.startPan(a, b);
    }

    window.paned = function(c, d) {
        pan.pan(c, d);
    }

    window.zoomInMap = function(ros, viewer) {
        var zoom = new ROS2D.ZoomView({
            ros: ros,
            rootObject: viewer.scene
        });
        zoom.startZoom(250, 250);
        zoom.zoom(1.2);
    }

    window.zoomOutMap = function(ros, viewer) {
        var zoom = new ROS2D.ZoomView({
            ros: ros,
            rootObject: viewer.scene
        });
        zoom.startZoom(250, 250);
        zoom.zoom(0.8);
    }


    $("#home").click(function(event) {
        event.preventDefault();
        console.log("home button clicked");
        window.navigation = false;
        window.homing = true;
    });

    $("#navigate").click(function(event) {
        event.preventDefault();
        console.log("navigate button clicked");
        window.navigation = true;
        window.homing = false;
    });

    $("#return").click(function(event) {
        event.preventDefault();
        console.log("return button clicked");
        sendGoalPub_.publish(pose_);
    });

    $('#path').change(function() {
        event.preventDefault();
        if (this.checked) {
            pathed();
        } else {
            upathed();
        }
    });
    $("#zoomplus").click(function(event) {
        event.preventDefault();
        zoomInMap(ros, viewer);

    });

    $("#zoomminus").click(function(event) {
        event.preventDefault();
        zoomOutMap(ros, viewer);

    });

    $("#maplive").click(function(event) {
        event.preventDefault();
        console.log("clicked");
        mapchangelive();

    });

    $("#mapgraphical").click(function(event) {
        event.preventDefault();
        console.log("clicked");
        mapchangegraphical();

    });
    $("#stop").click(function(event) {
        event.preventDefault();
        console.log("clicked");
        $.ajax({
            url: '/navigation/stop',
            type: 'POST',
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        })
        upathed();

    });

    $("#shutdown").click(function(event) {
        event.preventDefault();
        $.ajax({
            url: '/shutdown',
            type: 'POST',
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        })

    });

    $("#restart").click(function(event) {
        event.preventDefault();
        $.ajax({
            url: '/restart',
            type: 'POST',
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        })

    });



    $('.menu-btn').click(function() {
        $(this).toggleClass("menu-btn-left");
        $('.box-out').toggleClass('box-in');
    });

    $("#startmap").click(function(event) {
        $body.addClass("loading");
        event.preventDefault();
        $.ajax({
            url: '/navigation/gotomapping',
            type: 'POST',
            success: function(response) {

                setTimeout(function() {
                    window.location = "/mapping";
                    $body.removeClass("loading");
                }, 5000);

            },
            error: function(error) {
                console.log(error);
            }
        })

    });


    $(".close-navigation").click(function(event) {
        event.stopPropagation();
        // console.log(event.target.previousSibling.data)
        $.ajax({
            url: '/navigation/deletemap',
            type: 'POST',
            data: event.target.previousSibling.data,
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.log(error);
            }
        })

    });

    var close = document.getElementsByClassName("close-navigation");
    var i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
            var div = this.parentElement;
            div.style.display = "none";
        }
    }



});

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("drop-text").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {
        var myDropdown = document.getElementById("drop-text");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
}