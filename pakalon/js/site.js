window.addEventListener('load', (event) => {
  tds = document.getElementsByTagName('td');

  for(td of tds){
    td.addEventListener('click', function(e){
      tdToMark = e.srcElement.closest("td");
      if(tdToMark.className){
        tdToMark.className = "";
      } else if (tdToMark.innerHTML != ""){
        tdToMark.className = "checked";
      }
    });
  }
});
