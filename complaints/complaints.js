let start = new Date().getTime();

const originPosition = { x: 0, y: 0 };

const last = {
  starTimestamp: start,
  starPosition: originPosition,
  mousePosition: originPosition
}

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  glowDuration: 75,
  maximumGlowPointSpacing: 10,
  colors: ["249 146 253", "252 254 255"],
  sizes: ["1.4rem", "1rem", "0.6rem"],
  animations: ["fall-1", "fall-2", "fall-3"]
}

let count = 0;
  
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`,
      px = value => withUnit(value, "px"),
      ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
  const diffX = b.x - a.x,
        diffY = b.y - a.y;
  
  return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}

const calcElapsedTime = (start, end) => end - start;

const appendElement = element => document.body.appendChild(element),
      removeElement = (element, delay) => setTimeout(() => document.body.removeChild(element), delay);

const createStar = position => {
  const star = document.createElement("span"),
        color = selectRandom(config.colors);
  
  star.className = "star fa-solid fa-sparkle";
  
  star.style.left = px(position.x);
  star.style.top = px(position.y);
  star.style.fontSize = selectRandom(config.sizes);
  star.style.color = `rgb(${color})`;
  star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
  star.style.animationName = config.animations[count++ % 3];
  star.style.starAnimationDuration = ms(config.starAnimationDuration);
  
  appendElement(star);

  removeElement(star, config.starAnimationDuration);
}

const createGlowPoint = position => {
  const glow = document.createElement("div");
  
  glow.className = "glow-point";
  
  glow.style.left = px(position.x);
  glow.style.top = px(position.y);
  
  appendElement(glow)
  
  removeElement(glow, config.glowDuration);
}

const determinePointQuantity = distance => Math.max(
  Math.floor(distance / config.maximumGlowPointSpacing),
  1
);

/* --  

The following is an explanation for the "createGlow" function below:

I didn't cover this in my video, but I ran into an issue where moving the mouse really quickly caused gaps in the glow effect. Kind of like this:

*   *       *       *    *      *    🖱️

instead of:

*************************************🖱️

To solve this I sort of "backfilled" some additional glow points by evenly spacing them in between the current point and the last one. I found this approach to be more visually pleasing than one glow point spanning the whole gap.

The "quantity" of points is based on the config property "maximumGlowPointSpacing".

My best explanation for why this is happening is due to the mousemove event only firing every so often. I also don't think this fix was totally necessary, but it annoyed me that it was happening so I took on the challenge of trying to fix it.

-- */
const createGlow = (last, current) => {
  const distance = calcDistance(last, current),
        quantity = determinePointQuantity(distance);
  
  const dx = (current.x - last.x) / quantity,
        dy = (current.y - last.y) / quantity;
  
  Array.from(Array(quantity)).forEach((_, index) => { 
    const x = last.x + dx * index, 
          y = last.y + dy * index;
    
    createGlowPoint({ x, y });
  });
}

const updateLastStar = position => {
  last.starTimestamp = new Date().getTime();

  last.starPosition = position;
}

const updateLastMousePosition = position => last.mousePosition = position;

const adjustLastMousePosition = position => {
  if(last.mousePosition.x === 0 && last.mousePosition.y === 0) {
    last.mousePosition = position;
  }
};

const handleOnMove = e => {
  const mousePosition = { x: e.clientX, y: e.clientY }
  
  adjustLastMousePosition(mousePosition);
  
  const now = new Date().getTime(),
        hasMovedFarEnough = calcDistance(last.starPosition, mousePosition) >= config.minimumDistanceBetweenStars,
        hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;
  
  if(hasMovedFarEnough || hasBeenLongEnough) {
    createStar(mousePosition);
    
    updateLastStar(mousePosition);
  }
  
  createGlow(last.mousePosition, mousePosition);
  
  updateLastMousePosition(mousePosition);
}

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);

document.body.onmouseleave = () => updateLastMousePosition(originPosition);

// State variables
var spinnerProgress = 0;
var mouseIsDown = false;
var previousPos = undefined;

// Document objects
var progressNum;
var canv;
var ctx;
var rect;

window.onload = function () {
  progressNum = document.getElementById("progress-num");
  canv = document.getElementById("spinner-canvas");
  ctx = canv.getContext("2d");
  rect = canv.getBoundingClientRect();

  progressNum.innerHTML = `Loading... ${+spinnerProgress.toFixed(1)}%`;

  // Add event listeners
  canv.addEventListener("mousedown", onMouseDown);
  canv.addEventListener("mousemove", onMouseMove);
  canv.addEventListener("mouseup", onMouseUp);

  // Draw spinner
  drawSpinner();
}

function onMouseDown(event) {
  mouseIsDown = true;
  let radialPos = calculateRadians(event.pageX, event.pageY);
  previousPos = radialPos;
}

function onMouseUp(event) {
  mouseIsDown = false;
  previousPos = undefined;
}

function onMouseMove(event) {
  if (mouseIsDown === true) {
    let radialPos = calculateRadians(event.pageX, event.pageY);
    let delta = (radialPos - previousPos) % (2 * Math.PI);
    previousPos = radialPos;

    // If absolute value of delta is very large we need to compensate
    // Otherwise, delta will hang around 0 and 6.28 until mouse is released
    if (delta > 4.75) {
      delta -= 2 * Math.PI;
    } else if (delta < -4.75) {
      delta += 2 * Math.PI;
    }

    // Apply spinner delta to overall spinner progress
    spinnerProgress += delta;

    if (spinnerProgress > 100) {
      // Hide spinner and load contents
      progressNum.style.display = 'none';
      canv.style.display = 'none';
      // document.getElementById('image-container').style.display ='block';
      const imageContainer = document.querySelector('.image-container');
      imageContainer.style.display = 'flex';
      imageContainer.style.height = 'auto' ;
    } else {
      // Update progress % number
      progressNum.innerHTML = `Loading... ${+spinnerProgress.toFixed(1)}%`;

      // Rotate canvas and re-draw spinner
      ctx.translate(rect.width / 2, rect.height / 2);
      ctx.rotate(delta);
      ctx.translate(-rect.width / 2, -rect.height / 2);
      drawSpinner();
    }
  }
}

function calculateRadians(x, y) {
  /**
   * Calculates radians of mouse position from center of rect.
   */
  let rectX = x - rect.left - 1;
  let rectY = y - rect.top - 1;
  let deltaX = rectX - rect.width / 2;
  let deltaY = rectY - rect.height / 2;
  return Math.atan2(deltaY, deltaX);
}

function drawSpinner() {
  ctx.lineWidth = Math.floor(rect.height * 0.04);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.arc(
    rect.width * 0.5,
    rect.height * 0.5,
    rect.height * 0.15,
    spinnerProgress % (2 * Math.PI),
    (spinnerProgress + 5) % (2 * Math.PI)
  );
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth++;
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.arc(
    rect.width * 0.5,
    rect.height * 0.5,
    rect.height * 0.15,
    spinnerProgress % (2 * Math.PI),
    (spinnerProgress + 5) % (2 * Math.PI),
    true
  );
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = 1;
}