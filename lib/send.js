// probably don't need this
// websocket should replace this
function sendXHR(method, url, cb){
  var xhr;
  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.responseText);
      cb(xhr.responseText);
    }
  }
  if(method === "GET") {
    xhr.open("GET", url, true);
  } else if(method === "POST") {
    xhr.open("POST", url, true);
  }
  xhr.send();
}