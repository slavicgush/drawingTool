let step = -1;
let labels = [
  "car",
  "fish",
  "house",
  "tree",
  "bicycle",
  "guitar",
  "pencil",
  "clock",
];
let currentDrawing = [];
let isDrawing = false;
let activePath = null;
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;
let startTime = new Date().getTime();
let sessionTime = startTime;
let data = { student: null, session: sessionTime, drawings: {} };

function next() {
  if (document.getElementById("student").value == "") {
    alert("Enter an ID!");
    return;
  } else {
    data.student = document.getElementById("student").value;
  }

  if (step >= 0 && showCurrentDrawing() == 0) {
    alert(
      "There's nothing there.\nPlease draw the " +
        labels[step] +
        " before moving to the next item!"
    );
    return;
  }

  document.getElementById("undo").disabled = true;
  document.getElementById("drawingArea").style.display = "";
  document.getElementById("brand").style.display = "";
  document.getElementById("logo").style.display = "none";
  startTime = new Date().getTime();

  if (step >= 0 && step <= labels.length - 1) {
    data.drawings[labels[step]] = currentDrawing;
    currentDrawing = [];
    showCurrentDrawing();
  }
  step++;
  if (step < labels.length) {
    if (step < labels.length - 1) {
      document.getElementById("nextBtn").innerHTML = "Next<br>Item";
    } else {
      document.getElementById("nextBtn").innerHTML = "Done";
    }
    initDrawing(step);
  } else {
    document.getElementById("drawingArea").style.display = "none";
    //downloadData(data, drawing_data.json);
    save();
    document.getElementById("instructions").innerHTML =
      "Saving...<br>Please wait.";
    document.getElementById("right").style.display = "none";
  }

  document.getElementById("student").style.display = "none";
  document.getElementById("instructions").style.display = "";
}

function initDrawing(index) {
  document.getElementById("instructions").innerHTML =
    "Hi, <i>" +
    data.student +
    "</i>!<br>Please draw a <b>" +
    labels[index] +
    "</b>!";
  //document.getElementById("drIndex").innerHTML="[drawing "+(index+1)+"/"+labels.length+"]";
  document.getElementById("drIndex").innerHTML = "";
}

function addEventListeners() {
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart);
  canvas.addEventListener("touchmove", onTouchMove);
  document.addEventListener("touchend", onTouchEnd);
}

function onTouchStart(evt) {
  console.log(evt);
  let loc = evt.touches[0];
  onMouseDown(loc);
  evt.preventDefault();
}
function onTouchMove(evt) {
  let loc = evt.touches[0];
  onMouseMove(loc);
  evt.preventDefault();
}
function onTouchEnd() {
  onMouseUp();
}

function onMouseDown(evt) {
  isDrawing = true;
  activePath = [];
  activePath.push(getMouse(evt));
  currentDrawing.push({ show: true, path: activePath });
  showCurrentDrawing();
}

function onMouseMove(evt) {
  if (isDrawing) {
    activePath.push(getMouse(evt));
    // console.log(activePath);
    // console.log(currentDrawing);
    showCurrentDrawing();
  }
}

function onMouseUp() {
  isDrawing = false;

  //invalid path
  if (
    currentDrawing.length > 0 &&
    currentDrawing[currentDrawing.length - 1].path.length < 2
  ) {
    currentDrawing.pop();
  }
  const res = showCurrentDrawing();
  console.log(res);
  if (res >= 1) {
    document.getElementById("undo").disabled = false;
  } else {
    document.getElementById("undo").disabled = true;
  }
}

function getMouse(evt) {
  const rect = canvas.getBoundingClientRect();
  console.log(rect);
  console.log('X',evt.clientX);
  console.log('Y',evt.clientY);
  return {
    x: Math.max(0, Math.floor(evt.clientX - rect.left) + 1),
    y: Math.max(0, Math.floor(evt.clientY - rect.top) + 1),
    t: new Date().getTime() - startTime,
  };
}

function showCurrentDrawing() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let cnt = 0;
  for (let i = 0; i < currentDrawing.length; i++) {
    if (currentDrawing[i].show) {
      ctx.beginPath();
      const path = currentDrawing[i].path;
      //console.log(path);
      ctx.strokeStyle = path;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      for (let j = 0; j < path.length; j++) {
        if (j == 0) {
          ctx.moveTo(path[j].x, path[j].y);
        } else {
          ctx.lineTo(path[j].x, path[j].y);
        }
      }
      ctx.stroke();
      cnt++;
    }
  }
  return cnt;
}

function doUndo() {
  for (let i = currentDrawing.length - 1; i >= 0; i--) {
    if (currentDrawing[i].show == true) {
      currentDrawing[i].show = false;
      break;
    }
  }
  const res = showCurrentDrawing();
  if (res >= 1) {
    document.getElementById("undo").disabled = false;
  } else {
    document.getElementById("undo").disabled = true;
  }
}

function save() {
  fetch("./save.php", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "OK") {
        downloadData(data, 'drawing_data.json');
        document.getElementById("instructions").innerHTML =
          "Got it. Thank you!<br>Here's a copy of your data!";
      } else {
        document.getElementById("instructions").innerHTML =
          "Something bad happened :-(<br>Please let me know in the comments if you're seeing this...";
      }
    })
    .catch((error) => {
      document.getElementById("instructions").innerHTML =
        "Something bad happened :-(<br>Please let me know in the comments if you're seeing this...";
    });
}
function downloadData(data, fileName) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

function download() {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(convert(data)))
  );

  //mention session and random to have
  //some control over data and see if
  //someone draws twice, for example

  const fileName = data.session + ".json";
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function convert(data) {
  const newData = {
    session: data.session,
    student: data.student,
    drawings: {},
  };
  for (const label in data.drawings) {
    const drawing = data.drawings[label];
    newData.drawings[label] = convertDrawing(drawing);
  }
  return newData;
}

function convertDrawing(drawing) {
  const paths = [];
  for (const d of drawing) {
    if (d.show == true) {
      paths.push(d.path.map((p) => [p.x, p.y]));
    }
  }
  return paths;
}

addEventListeners();