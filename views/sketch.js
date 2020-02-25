var weather;
var news;
var lastWeatherRequest = Date.now();
var lastFaceRequest = Date.now();
var lastApiRequest = Date.now();
var apiDelay = 1000;
var weatherDelay = 3600000;
var checkFaceDelay = 1000;
var temperature;
var search = [];
var word = "tech";
var alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
];
var wordDone = false;
var screenCondition;

// Classifier Variable
let classifier;
// Model URL
let imageModelURL = "./tm-my-image-model/";

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight - 3.75);
  getWeather();
  getNewsWord();
  getContent();

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  flippedVideo = ml5.flipImage(video);
  // Start classifying
  classifyVideo();
}

function draw() {
  background(0);

  fill(255);
  textAlign(CENTER);
  textSize(35);
  // getScreenCondition();
  if (Date.now() - lastApiRequest > apiDelay) {
    lastApiRequest = Date.now();
    getContent();
  }

  if (Date.now() - lastFaceRequest >= checkFaceDelay) {
    classifyVideo();
    lastFaceRequest = Date.now();
  }
  // console.log((new Date()).getHours());
  if (screenCondition) {
    text(getTime(), width / 2, 75);
    textSize(25);
    // getNewsWord();
    if (Date.now() - lastWeatherRequest >= weatherDelay) {
      getWeather();
      lastWeatherRequest = Date.now();
    }

    if (weather) {
      temperature = weather.main;
      textSize(35);
      text("Current Temp: " + temperature.temp + "°F", width / 2, 25);
      textSize(25);
      text(
        temperature.temp_min + "°F" + "/" + temperature.temp_max + "°F",
        width / 2 + 275,
        25
      );
    }
    if (wordDone) {
      word = "";
      for (var i = 0; i < search.length; i++) {
        word += search[i];
      }
      wordDone = false;
      search = [];
      getContent();
    }
    if (news) {
      text("News: ", width / 2, height - 100);
      for (var i = 1; i < 4; i++) {
        text(
          news.getElementsByTagName("item")[i].getElementsByTagName("title")[0]
            .innerHTML,
          width / 2,
          height - 25 * i
        );
      }
    }
  }
}

function getWeather() {
  var request = new XMLHttpRequest();
  //id=5391832
  request.open(
    "GET",
    "https://api.openweathermap.org/data/2.5/weather?q=Encinitas&&APPID=962206d2c95326f369b6e98b307e0764&&units=imperial",
    true
  );
  request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      weather = data;
      // console.log(data);
    } else {
      // console.log(data);
    }
  };

  request.send();
}

function getNewsWord() {
  fetch("/search", { method: "GET" })
    .then(function(response) {
      if (response.ok) return response.json();
      throw new Error("Request failed.");
    })
    .then(function(data) {
      if (
        (data && data !== word) ||
        Date.now() - lastWeatherRequest >= weatherDelay
      ) {
        // create a circle at the x, y coords
        word = data;
        getNews();
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getScreenCondition() {
  fetch("/screenCondition", { method: "GET" })
    .then(function(response) {
      if (response.ok) return response.json();
      throw new Error("Request failed.");
    })
    .then(function(data) {
      if (data) {
        // create a circle at the x, y coords
        screenCondition = data;
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

function setScreenCondition(condition) {
  let body = {
    queryResult: {
      queryText: condition
    }
  };

  fetch("/screenCondition", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  }).catch(function(error) {
    console.log(error);
  });
}

function getContent() {
  fetch("/content", { method: "GET" })
    .then(function(response) {
      if (response.ok) return response.json();
      throw new Error("Request failed.");
    })
    .then(function(data) {
      if (data.screenCondition || !data.screenCondition) {
        // create a circle at the x, y coords
        screenCondition = data.screenCondition;
      }
      if (
        (data.word && data.word !== word) ||
        Date.now() - lastWeatherRequest >= weatherDelay
      ) {
        // create a circle at the x, y coords
        word = data.word;
        getNews();
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getNews() {
  var request = new XMLHttpRequest();

  request.open(
    "GET",
    "https://cors-anywhere.herokuapp.com/https://news.google.com/news/?q=" +
      word +
      "&output=rss",
    true
  );
  request.onload = function() {
    // Begin accessing JSON data here

    var parser = new DOMParser();
    var data = parser.parseFromString(this.response, "text/xml");

    if (request.status >= 200 && request.status < 400) {
      news = data;
      // console.log(news);
    } else {
      console.log(data);
    }
  };

  request.send();
}

function getTime() {
  var date = new Date();
  var time = "";
  var partOfDay = "AM";
  var hour = date.getHours();
  if (hour > 12) {
    partOfDay = "PM";
    hour = hour - 12;
  }
  time += hour;
  var minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  time += ":" + minutes;
  time += " " + partOfDay;
  return time;
}

function keyPressed() {
  var letter;
  if (keyCode >= 65 && keyCode <= 90) {
    letter = alphabet[keyCode - 65];
  }
  if (keyCode === 32) {
    letter = " ";
  }
  if (letter) {
    search.push(letter);
  }
  if (keyCode === 13) {
    wordDone = true;

    let newWord = "";
    for (var i = 0; i < search.length; i++) {
      newWord += search[i];
    }

    let body = {
      queryResult: {
        parameters: { searchTerm: newWord }
      }
    };
    fetch("/", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        if (response.ok) {
          return;
        }
        throw new Error("Request failed.");
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResult);
}

// When we get a result
async function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;

  setScreenCondition(label == "Not Known" ? "off" : "on");
}
