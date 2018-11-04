var weather;
var news;
var lastWeatherRequest = Date.now();
var weatherDelay = 3600000;
var temperature;
var search = [];
var word = "tech";
var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
var wordDone = false;

function setup(){
	createCanvas(window.innerWidth, window.innerHeight-3.75);
	getWeather();
	getNews();
}

function draw() {
	background(0);
	fill(255);
	textAlign(CENTER);
	textSize(35);
	if(new Date().getHours() < 21 && new Date.getHours() > 6){
		text(getTime(), width/2, 75);
		textSize(25);
		if(Date.now() - lastWeatherRequest >= weatherDelay){
			getWeather();	    
			lastWeatherRequest = Date.now();
			getNews();
		}
		if(weather){
			temperature = weather.main;
			textSize(35)
			text("Current Temp: " + temperature.temp + "°F", width/2, 25);
			textSize(25);
			text(temperature.temp_min + "°F" + "/" + temperature.temp_max + "°F", width/2+275, 25);
		}
		if(wordDone){
			word = "";
			for(var i=0; i<search.length; i++){
				word += search[i];
			}
			wordDone = false;
			search = [];
			getNews();
		}
		if(news){
			text("News: ", width/2, height-100);
			for(var i=1; i<4; i++){
				text(news.getElementsByTagName("item")[i].getElementsByTagName("title")[0].innerHTML, width/2, height-(25*i));
			}
		}
	}
}

function getWeather() {
	var request = new XMLHttpRequest();

	request.open("GET", "https://api.openweathermap.org/data/2.5/weather?id=5391832&&APPID=962206d2c95326f369b6e98b307e0764&&units=imperial", true);
	request.onload = function () {

	  // Begin accessing JSON data here
	  var data = JSON.parse(this.response);

	  if (request.status >= 200 && request.status < 400) {
	    weather = data;
	  } else {
	    // console.log(data);
	  }
	}

	request.send();
}

function getNews(search) {
	var request = new XMLHttpRequest();

	request.open("GET", "https://cors-anywhere.herokuapp.com/https://news.google.com/news/?q="+word+"&output=rss", true);
	request.onload = function () {

	  // Begin accessing JSON data here

	  var parser = new DOMParser();
	  var data = parser.parseFromString(this.response,"text/xml");

	  if (request.status >= 200 && request.status < 400) {
	    news = data;
	    // console.log(news);	
	  } else {
	    console.log(data);
	  }
	}

	request.send();
}

function getTime(){
	var date = new Date();
	var time = "";
	var partOfDay = "AM";
	var hour = date.getHours();
	if(hour > 12){
		partOfDay = "PM";
		hour = hour - 12;
	}
	time += hour;
	var minutes = date.getMinutes();
	if(minutes < 10){
		minutes = "0" + minutes;
	}
	time += ":" + minutes;
	time += " " + partOfDay;
	return time;
}

function keyPressed(){
	var letter;
	if(keyCode >= 65 && keyCode <= 90){
		letter = alphabet[keyCode-65];
	}
	if(keyCode === 32){
		letter = " ";
	}
	if(letter){
		search.push(letter);
	}
	if(keyCode === 13){
		wordDone = true;
	}
}