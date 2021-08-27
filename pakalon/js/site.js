window.addEventListener('load', (event) => {
  // Request name from user
  if(document.cookie){
    name = getCookie("name");
    document.getElementById("name").innerHTML = "שלום " + name;
  } else {
    const name = prompt("הכניסו את שמכם המלא", "");
    if(name){
      document.getElementById("name").innerHTML = "שלום " + name;

      const d = new Date();
      d.setTime(d.getTime() + (60*60*1000));
      let expires = "expires="+ d.toUTCString();
      document.cookie = "name=" + name + ";" + expires + ";";
    } else {
      document.getElementById("name").remove()
    }
  }

  // Add to tds the function of coloring
  tds = document.getElementsByTagName('td');

  for(td of tds){
    td.addEventListener('click', function(e){
      tdToMark = e.srcElement.closest("td");

      if(tdToMark.innerHTML != ""){
        if(tdToMark.className == "shipur"){
          tdToMark.className = "shimur";
        } else if (tdToMark.className == "shimur") {
          tdToMark.className = "";
        } else {
          tdToMark.className = "shipur";
        }
      }
    });
  }
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
