window.addEventListener('load', (event) => {
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
