const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let points = [];
let isInterpolated = false;

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Event Listeners
canvas.addEventListener('click', handleCanvasClick);
document.getElementById('toggleInterpolation').addEventListener('click', toggleInterpolation);
document.getElementById('clear').addEventListener('click', clearCanvas);

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    points.push({x, y});
    draw();
}

function toggleInterpolation() {
    isInterpolated = !isInterpolated;
    draw();
}

function clearCanvas() {
    points = [];
    isInterpolated = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4444';
        ctx.fill();
    });

    if (points.length > 1) {
        if (isInterpolated) {
            drawSpline();
        } else {
            drawPolyline();
        }
    }
}

function drawPolyline() {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawSpline() {
    if (points.length < 2) return;

    const tension = 0.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];

        for (let t = 0; t <= 1; t += 0.02) {
            const x = catmullRom(p0.x, p1.x, p2.x, p3.x, t, tension);
            const y = catmullRom(p0.y, p1.y, p2.y, p3.y, t, tension);
            ctx.lineTo(x, y);
        }
    }
    
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function catmullRom(p0, p1, p2, p3, t, tension) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}
