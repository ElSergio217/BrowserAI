var r = document.getElementById('result');
var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();
msg.voice = voices[10]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.volume = 1; // 0 to 1
msg.rate = 1.5; // 0.1 to 10
msg.pitch = 2; //0 to 2
msg.text = '';
msg.lang = 'en-US';

function startConverting () {
	//msg.text="Hello. how can I assist you today."
	//speechSynthesis.speak(msg);
	
	if('webkitSpeechRecognition' in window){
	
		var speechRecognizer = new webkitSpeechRecognition();
		speechRecognizer.continuous = true;
		speechRecognizer.interimResults = true;
		speechRecognizer.lang = 'en-IN';
		speechRecognizer.start();

		var finalTranscripts = '';

		speechRecognizer.onresult = function(event){
			var interimTranscripts = '';
			for(var i = event.resultIndex; i < event.results.length; i++){
				var transcript = event.results[i][0].transcript;
				transcript.replace("\n", "<br>");
				if(event.results[i].isFinal){
					finalTranscripts = transcript;
				}
			}
			r.innerHTML = finalTranscripts;
			speechRecognizer.stop();

			if(finalTranscripts.startsWith("open")){
				var site = finalTranscripts.replace("open ", "");
				window.open("http://" + site + ".com",'_blank');
				msg.text="opening " + site;
				speechSynthesis.speak(msg);
				finalTranscripts="";
			}
			
		};
				
		speechRecognizer.onerror = function (event) {
			
		};
	}
				
	else{
		r.innerHTML = 'Your browser is not supported. If google chrome, please upgrade!';
	}
}