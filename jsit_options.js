

function setApiKey()
{
    var keyinp = document.getElementById("apikey_input");
    
    chrome.runtime.sendMessage({type: "setApiKey", value : keyinp.value}); 
}


function useDetectedApiKey()
{
    var keyinp = document.getElementById("apikey_input");
    keyinp.value =  document.getElementById("detectedApiKey").innerHTML;
	
    chrome.runtime.sendMessage({type: "setApiKey", value : keyinp.value}); 
}


    var keyinp = document.getElementById("apikey_input");
    
    chrome.runtime.sendMessage({type: "getApiKey"}, function(response) {
        if (typeof response.apikey != "undefined")
        {
            keyinp.value = response.apikey;
        }
        else
        {
            keyinp.value = "";
        }
    });
    
    var keybut = document.getElementById("apikey_submit");
    keybut.addEventListener('click', setApiKey);
	
document.getElementById("detectedKey_submit").addEventListener('click', useDetectedApiKey);





	//from http://snipplr.com/view/14074/
 
 String.prototype.between = function(prefix, suffix) {
  s = this;
  var i = s.indexOf(prefix);
  if (i >= 0) {
    s = s.substring(i + prefix.length);
  }
  else {
    return '';
  }
  if (suffix) {
    i = s.indexOf(suffix);
    if (i >= 0) {
      s = s.substring(0, i);
    }
    else {
      return '';
    }
  }
  return s;
}


var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 ) {
	   if(xmlhttp.status == 200 && xmlhttp.responseText.between('name="api_key" value="','" />')){
			document.getElementById("autodetect").style.display="block";
		   document.getElementById("detectedApiKey").innerHTML = xmlhttp.responseText.between('name="api_key" value="','" />');
		  document.getElementById("detectedMail").innerHTML = xmlhttp.responseText.between('font-weight: bold;">\n \n ',"&nbsp;<span");
	   }
	}
}

xmlhttp.open("GET", "https://justseed.it/options/index.csp", true);
xmlhttp.send();



