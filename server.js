var express = require("express");
var request = require("request");
var fs = require("fs");
var app = express();
const bodyparser = require("body-parser");
var search = "technology";
var on = true;
var lightsOn = false;
var lightColor = JSON.stringify("0,0,0");
var iftttId;
var baseURL = "https://maker.ifttt.com/trigger/";
var withKey = "/with/key/";
var triggerEvent = (triggerEvent = process.env.IFTTT_EVENT_1);

if (!process.env.IFTTT_MAKER_URL)
  console.log(
    "You need to set your IFTTT Maker URL - copy the URL from https://ifttt.com/services/maker/settings into the .env file against 'IFTTT_MAKER_URL'"
  );
else
  iftttId = process.env.IFTTT_MAKER_URL.split(
    "https://maker.ifttt.com/use/"
  )[1];

// Show the homepage
// http://expressjs.com/en/starter/static-files.html
app.use(express.static("views"));
app.use(bodyparser.json());

// Handle requests from IFTTT
app.post("/", function(req, res) {
  console.log(req.body.queryResult);
  if (req.body.queryResult.parameters.searchTerm) {
    search = req.body.queryResult.parameters.searchTerm;
  } else if (req.body.queryResult.parameters.screenOn) {
    let screenOn = req.body.queryResult.parameters.screenOn;
    if (screenOn === "true") {
      on = true;
    } else {
      on = false;
    }
  } else if (req.body.queryResult.parameters.color) {
    var color = req.body.queryResult.parameters.color;
    while (color.includes(" ")) {
      color =
        color.substring(0, color.indexOf(" ")) +
        color.substring(color.indexOf(" ") + 1);
    }
    color = color.toLowerCase();

    var colors = JSON.parse(fs.readFileSync("./colors.json"));
    color = colors[color];
    lightColor = JSON.stringify(`${color[0]},${color[1]},${color[2]}`);
    request(
      baseURL + triggerEvent + withKey + iftttId + "?value1=" + lightColor,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
        }
      }
    );
  } else if (req.body.queryResult.parameters.lightsOn) {
    if (req.body.queryResult.parameters.lightsOn === "true") {
      request(
        baseURL + triggerEvent + withKey + iftttId + "?value1=" + lightColor,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
          }
        }
      );
    } else {
      var color = JSON.stringify("0,0,0");
      request(
        baseURL + triggerEvent + withKey + iftttId + "?value1=" + color,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
          }
        }
      );
    }
  } else if (req.body.queryResult.parameters.lightsOnWhite) {
    if (req.body.queryResult.parameters.lightsOnWhite === "true") {
      request(
        baseURL +
          triggerEvent +
          withKey +
          iftttId +
          "?value1=" +
          JSON.stringify("255,255,255"),
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
          }
        }
      );
    } else {
      var color = JSON.stringify("0,0,0");
      request(
        baseURL + triggerEvent + withKey + iftttId + "?value1=" + color,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
          }
        }
      );
    }
  } else if (req.body.queryResult.queryText) {
    search = req.body.queryResult.queryText;
  }
  res.status(200).json({
    speech: "Searched",
    displayText: "Searched",
    source: "Smart Mirror Server"
  });
});

app.post("/screenOn", function(req, res) {
  on = true;
  console.log("on");
  res.send("");
});

app.post("/screenOff", function(req, res) {
  on = false;
  console.log("off");
  res.send("");
});

app.get("/search", function(req, res) {
  res.json(search);
});

app.get("/content", function(req, res) {
  let content = {
    screenCondition: on,
    word: search
  };
  res.json(content);
});

app.post("/screenCondition", function(req, res) {
  if (req.body.queryResult.queryText === "on") {
    on = true;
  } else {
    on = false;
  }
  res.send("");
});

app.get("/screenCondition", function(req, res) {
  res.json(on);
});
app.get("/", function(req, res) {
  res.render("index");
});

// listen for requests :)
var listener = app.listen("8080", function() {
  console.log("Your app is listening on port " + listener.address().port);
});
