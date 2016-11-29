var r = document.getElementById('result');
var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();
msg.voice = voices[10]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.volume = 1; // 0 to 1
msg.rate = 1; // 0.1 to 10
msg.pitch = 2; //0 to 2
msg.text = '';
msg.lang = 'en-US';


document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        startConverting();
    }
}

mixpanel.track("Visits");

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	document.getElementById('result').innerHTML= "<h2>Sorry, Dr.Manhattan is not avalible on mobile browsers.</h2>";
	document.getElementById('tip').innerHTML= "";
}
		var finalTranscripts = '';
		startConverting ();
		
function startConverting () {
	
	if('webkitSpeechRecognition' in window){
	
		document.getElementById('status').innerHTML='Listening...';
		r.innerHTML="";
	
		var speechRecognizer = new webkitSpeechRecognition();
		speechRecognizer.continuous = true;
		speechRecognizer.interimResults = true;
		speechRecognizer.lang = 'en-IN';
		speechRecognizer.start();

		speechRecognizer.onresult = function(event){
			var interimTranscripts = '';
			for(var i = event.resultIndex; i < event.results.length; i++){
				var transcript = event.results[i][0].transcript;
				transcript.replace("\n", "<br>");
				if(event.results[i].isFinal){
					finalTranscripts = transcript;
					document.getElementById('status').innerHTML='';
					Recog();
					startConverting ();
				}
			}
			//r.innerHTML = finalTranscripts;	
				
		speechRecognizer.onerror = function (event) {
			
		};
	}
	}				
	else{
		r.innerHTML = 'Your browser is not supported. If google chrome, please upgrade!';
	}

}




function Recog(){
	//Open Website
	if(finalTranscripts.startsWith("open")){
		var site = finalTranscripts.replace("open ", "");
		window.open("http://" + site + ".com",'_blank');
		msg.text="opening " + site;
		speechSynthesis.speak(msg);
		r.innerHTML="Opening " + site;
		mixpanel.track("Website Opened",{"Website":site});
		finalTranscripts="";
	}
			
	// current time HH:MM AM/PM
	if(finalTranscripts=="what time is it"){
		var date = new Date();
		var am = false;
		var hours= date.getHours();
		if (hours > 12) {
			am = false;
			hours -= 12;
		}
		if(hours==12){
			am=true
		}
		if(hours==0){
			hours=12;
		}
		msg.text="It is " + hours + ":" + date.getMinutes() + (am ? "a.m." : "p.m.");
		speechSynthesis.speak(msg);
		r.innerHTML="It is " + hours + ":" + date.getMinutes() + (am ? "a.m." : "p.m.");
		finalTranscripts="";
	}
			
	//google search
	if(finalTranscripts.startsWith("search for")){
		var search = finalTranscripts.replace("search for ", "");
		var urlEnd = search.replace(" ", "+") 
		window.open("https://www.google.com/search?q=" + urlEnd,'_blank');
		msg.text="Searching for " + search;
		speechSynthesis.speak(msg);
		r.innerHTML="Searching for " + search;
		mixpanel.track("Google Searches",{"Searches":search});
		finalTranscripts="";
	}
			
	//Post a tweet
	if(finalTranscripts.startsWith("post on Twitter ")){
		var tweet = finalTranscripts.replace("post on Twitter ", "");
		var urlTweet = tweet.replace(" ", "%20").replace(tweet[0],tweet[0].toUpperCase()); 
		window.open( "https://twitter.com/home?status=" + urlTweet + ".%20Tweet%20posted%20from%20%23DrManhattanAI%3A%20%40elsergio217",'_blank');
		msg.text="please confirm your tweet.";
		speechSynthesis.speak(msg);
		r.innerHTML="Please confirm your tweet."
		mixpanel.track("Twitter Post",{"tweet":tweet});
		finalTranscripts="";
	}	

	//Define a word
	if(finalTranscripts.startsWith("Define ")||finalTranscripts.startsWith("define ")){
		var def = finalTranscripts.replace("Define ", "").replace("define ", "");
		var xmlhttp = new XMLHttpRequest();
		var url = "https://api.wordnik.com/v4/word.json/" + def + "/definitions?api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var myArr = JSON.parse(xmlhttp.responseText);
				r.innerHTML="<h3>" + def.replace(def[0],def[0].toUpperCase()) + "</h3>" + myArr[0]["text"];
				msg.text=myArr[0]["text"];
				speechSynthesis.speak(msg);
				mixpanel.track("Word Define",{"word":def});
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
		finalTranscripts="";
	}

	//Show Weather
	if(finalTranscripts=="what's the weather"){
		var xmlhttp = new XMLHttpRequest();
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};
			var url = "http://api.wunderground.com/api/03e2922bf82af124/conditions/forecast/alert/q/" + pos.lat + "," + pos.lng + ".json";
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var myArr = JSON.parse(xmlhttp.responseText);
					var condition= myArr["forecast"]["simpleforecast"]["forecastday"][0]["conditions"];
					var temp= myArr["forecast"]["simpleforecast"]["forecastday"][0]["high"]["fahrenheit"];
					msg.text= temp + " fahrenheit and " + condition;
					r.innerHTML="<img src='"+ myArr["forecast"]["simpleforecast"]["forecastday"][0]["icon_url"] +"'><br>" + temp + "F and " + condition; 
					speechSynthesis.speak(msg);
					mixpanel.track("Weather",{"condition":condition});
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
			finalTranscripts="";
		});
	}	

			//Show News
	if(finalTranscripts=="show me the news"){
		var xmlhttp = new XMLHttpRequest();
		var url = "http://rss2json.com/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Fnews%3Fcf%3Dall%26hl%3Den%26pz%3D1%26ned%3Dus%26topic%3Dw%26output%3Drss";
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var myArr = JSON.parse(xmlhttp.responseText);
					var out = "";
					var i;
					for(i = 0; i < myArr.items.length; i++) {
						out+= "<a href='"+ myArr.items[i].link +"'>" + myArr.items[i].title + "</a><br><br>"
					}
					r.innerHTML=out;
					msg.text= "Here are the global news";
					speechSynthesis.speak(msg);
					mixpanel.track("News");
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
			finalTranscripts="";
		}
}			

