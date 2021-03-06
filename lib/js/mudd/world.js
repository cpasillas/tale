
var Q = require("narwhal/promise-util");
var EL = require("narwhal/event-loop");
var HTTP = require("narwhal/q-http");
var UTIL = require("narwhal/util");
var Cache = require("chiron/cache").Cache;
var CHIRON = require("chiron");
var URL = require("url");

var world = exports.world = {
};

world.connect = function (channel, session, cookieSession) {
    var queue = Q.Queue();

    var room;
    var location;

    function go(_location) {
        location = _location;
        return Q.when(HTTP.read(location), function (content) {
            room = JSON.parse(content);
            channel.send({
                "message": room.description
            });
            if (room.exits) {
                channel.send({
                    "message": "There are exits: " +
                    UTIL.keys(room.exits).join(", ")
                });
            }
        });
    }

    go("http://localhost:8080/origin.json");
    var loop = Q.loop(channel.receive, function (message) {
        if (UTIL.has(room.exits, message)) {
            go(URL.resolve(location, room.exits[message].href));
            channel.send({
                "message": "You go " + message
            });
        } else {
            channel.send({
                "message": "Huh?"
            });
        }
    });

};

world.tick = function () {
};

world.start = function () {
    var world = this;
    var running = true;
    var stopping = Q.defer();
    function run() {
        if (running) {
            world.tick();
            EL.setTimeout(run, 1000);
        }
    }
    Q.enqueue(run);
    return {
        "stop": function () {
            running = false;
            stopping.resolve();
        },
        "stopped": stopping.promise
    }
};

var Room = function () {
};

var Mob = function () {
};

Mob.prototype.tick = function () {
};

