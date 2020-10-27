chartsData.forEach((chart) => {
  basicDiv = `<div class="chart"> \
        <h3 class="airport-chart-title">${chart.name}</h3> \
        <i class="fas fa-arrow-left"></i> \
        <div class="charts-list">`;

  chart.charts.forEach((link) => {
    let dataTemaplate = `<div class="chart-data"> \
            <i class="fas fa-plus-square"></i> \
            <a data-url="${link.url}">${link.chartName}</a> \
          </div>`;
    basicDiv += dataTemaplate;
  });
  basicDiv += '</div></div>';
  document.getElementById("inner-sidebar").innerHTML += basicDiv;
});


airportsTitle = document.getElementsByClassName("airport-chart-title");
for (i = 0; i < airportsTitle.length; i++) {
  airportsTitle[i].addEventListener("click", function() {
    changeArrow(this)
  });
}

function changeArrow(node) {
  arrowNode = node.parentNode.getElementsByClassName("fas")[0];
  if (arrowNode.classList.contains("fa-arrow-left")) {
    arrowNode.classList.replace("fa-arrow-left", "fa-arrow-down");
    node.parentNode.getElementsByClassName("charts-list")[0].style.display = "initial";
    node.parentNode.style.marginBottom = "20px";
  } else {
    arrowNode.classList.replace("fa-arrow-down", "fa-arrow-left");
    node.parentNode.getElementsByClassName("charts-list")[0].style.display = "none";
    node.parentNode.style.marginBottom = "0px";
  }
}

chartsTitles = document.getElementsByClassName("chart-data");
for (i = 0; i < chartsTitles.length; i++) {
  chartsTitles[i].addEventListener("click", function() {
    changeAddRemove(this.getElementsByTagName("i")[0])
  });
}

var activeLayers = [];

function changeAddRemove(node) {
  if (node.classList.contains("fa-plus-square")) {
    node.classList.replace("fa-plus-square", "fa-minus-square");
    url = node.parentNode.getElementsByTagName("a")[0].dataset.url;
    fullURL = 'charts/' + url;
    fullURL += '/{z}/{x}/{y}.png';
    layerToMap = L.tileLayer(fullURL, {
      attribution: 'מקור: &copy; פמ"ת פנים ארצי, רת"א | עיבוד: בר רודוי ואריאל בידר',
    }).addTo(map);
    activeLayers.push({
      "url": url,
      "layer": layerToMap
    });
  } else {
    node.classList.replace("fa-minus-square", "fa-plus-square");
    url = node.parentNode.getElementsByTagName("a")[0].dataset.url;
    index = activeLayers.findIndex(layer => layer.url == url);
    activeLayers[index].layer.remove();
    activeLayers.splice(index, 1);
  }
}

function removeAll(){
  activeLayers.forEach((layer) => {
    layer.layer.remove();
  });
  let buttons = document.getElementsByClassName("fa-minus-square");
  while(buttons && buttons.length){
    buttons[0].classList.replace("fa-minus-square", "fa-plus-square");
  }
}
