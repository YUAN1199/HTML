const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let startX, startY;
let currentImage = null;
let selection = {x: 0, y: 0, w: 0, h: 0};

// 初始化画布尺寸
function initCanvasSize(img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
}

// 文件上传处理
document.getElementById('upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        currentImage = new Image();
        currentImage.onload = function() {
            initCanvasSize(currentImage);
        };
        currentImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// 鼠标事件处理
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    // 清除临时画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);
    
    // 绘制选择矩形
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
});

canvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;

    selection = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        w: Math.abs(endX - startX),
        h: Math.abs(endY - startY)
    };
});

// 马赛克效果
function applyMosaic() {
    const blockSize = 10;
    const imageData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
    
    for (let y = 0; y < imageData.height; y += blockSize) {
        for (let x = 0; x < imageData.width; x += blockSize) {
            const pixel = (y * imageData.width + x) * 4;
            const r = imageData.data[pixel];
            const g = imageData.data[pixel + 1];
            const b = imageData.data[pixel + 2];
            
            for (let dy = 0; dy < blockSize && y + dy < imageData.height; dy++) {
                for (let dx = 0; dx < blockSize && x + dx < imageData.width; dx++) {
                    const pos = ((y + dy) * imageData.width + (x + dx)) * 4;
                    imageData.data[pos] = r;
                    imageData.data[pos + 1] = g;
                    imageData.data[pos + 2] = b;
                }
            }
        }
    }
    ctx.putImageData(imageData, selection.x, selection.y);
}

// 颜色擦除
function applyErase() {
    const eraseColor = document.getElementById('eraseColor').value;
    const rgb = hexToRgb(eraseColor);
    const imageData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = rgb.r;     // R
        imageData.data[i + 1] = rgb.g; // G
        imageData.data[i + 2] = rgb.b; // B
    }
    ctx.putImageData(imageData, selection.x, selection.y);
}

// 十六进制转RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 下载图片
function download() {
    const link = document.createElement('a');
    link.download = 'modified-image.png';
    link.href = canvas.toDataURL();
    link.click();
}
