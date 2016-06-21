function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes) {
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
    }
  }
  for(var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

var controls = Object.create(null);

function createPaint(parent) {
  var canvas = elt("canvas", {width: 800, height: 400});
  var cx = canvas.getContext("2d");
  var heading = elt("p", null, "Paint Application");
  var toolbar = elt("div", {class: "toolbar"});
  for (var name in controls)
    toolbar.appendChild(controls[name](cx));
  var panel = elt("div", {class: "panel"}, canvas);
  parent.appendChild(elt("div", null, heading, panel, toolbar));
}

var tools = Object.create(null);

controls.select = function(cx) {
  var select = elt("select");
  for (var name in tools)
    select.appendChild(elt("option", null, name));
  
  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });
  
  return elt("span", null, "Tools: ", select);
};

function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

function trackDrag(onMove, onEnd) {
  function end(event) {
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}

tools.Line = function(event, cx, onEnd) {
  cx.lineCap = "round";
  
  var pos = relativePos(event, cx.canvas);
  trackDrag(function(event) {
    cx.beginPath();
    cx.moveTo(pos.x, pos.y);
    pos = relativePos(event, cx.canvas);
    cx.lineTo(pos.x, pos.y);
    cx.stroke();
  }, onEnd);
};

tools.Erase = function(event, cx) {
  cx.globalCompositeOperation = "destination-out";
  tools.Line(event, cx, function(event) {
    cx.globalCompositeOperation = "source-over";
  });
};

controls.color = function(cx) {
  var input = elt("input", {type: "color"});
  input.addEventListener("change", function(event) {
    cx.fillStyle = input.value;
    cx.strokeStyle = input.value;
  });
  return elt("span", null, "Color: ", input);
};

controls.brush = function(cx) {
  var input = elt("input", {type: "range", min: 1, max: 21, step: 2, value: 1});
  var output = elt("span", null, "1px");
  input.addEventListener("change", function(event){
    cx.lineWidth = input.value;
    output.textContent = input.value + "px";
  });
  return elt("span", null, "Brush: ", input, output);
};

var app = document.querySelector("#app");
createPaint(app);