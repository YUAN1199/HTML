let originalImage = null;
let processedImage = null;

// 初始化Canvas
const origCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = origCanvas.getContext('2d');
const resultCtx = resultCanvas.getContext('2d');

// 绑定控件事件
document.getElementById('imageInput').addEventListener('change', loadImage);
document.getElementById('radius').addEventListener('input', updateParams);
document.getElementById('amount').addEventListener('input', updateParams);

function updateParams() {
    document.getElementById('radiusValue').textContent = this.value;
    document.getElementById('amountValue').textContent = this.value;
}

function loadImage(e) {
    const file = e.target.files[0];
    if (!file.type.match('image.*')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        originalImage = new Image();
        originalImage.onload = () => {
            origCanvas.width = originalImage.width;
            origCanvas.height = originalImage.height;
            resultCanvas.width = originalImage.width;
            resultCanvas.height = originalImage.height;
            ctx.drawImage(originalImage, 0, 0);
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function processImage() {
    if (!originalImage) return;

    const radius = parseInt(document.getElementById('radius').value);
    const amount = parseFloat(document.getElementById('amount').value);
    
    // 应用USM锐化算法
    processedImage = applyUnsharpMask(origCanvas, radius, amount);
    resultCtx.putImageData(processedImage, 0, 0);
    document.getElementById('downloadBtn').disabled = false;
}

function applyUnsharpMask(canvas, radius, amount) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const blurred = gaussianBlur(imageData, radius);
    
    // 锐化计算
    for (let i = 0; i < imageData.data.length; i += 4) {
        const diff = imageData.data[i] - blurred.data[i];
        imageData.data[i] = Math.min(255, imageData.data[i] + diff * amount);
        imageData.data[i+1] = Math.min(255, imageData.data[i+1] + diff * amount);
        imageData.data[i+2] = Math.min(255, imageData.data[i+2] + diff * amount);
    }
    return imageData;
}

// 高斯模糊实现
function gaussianBlur(imageData, radius) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const channels = 4;
    const gaussMatrix = createGaussianKernel(radius);
    
    // 水平方向模糊
    let horizontal = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let i = -radius; i <= radius; i++) {
                const x2 = Math.min(Math.max(x + i, 0), width - 1);
                const idx = (y * width + x2) * channels;
                const weight = gaussMatrix[i + radius];
                r += pixels[idx] * weight;
                g += pixels[idx + 1] * weight;
                b += pixels[idx + 2] * weight;
                a += pixels[idx + 3] * weight;
            }
            const idx = (y * width + x) * channels;
            horizontal[idx] = r;
            horizontal[idx + 1] = g;
            horizontal[idx + 2] = b;
            horizontal[idx + 3] = a;
        }
    }

    // 垂直方向模糊
    let vertical = new Uint8ClampedArray(pixels.length);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let i = -radius; i <= radius; i++) {
                const y2 = Math.min(Math.max(y + i, 0), height - 1);
                const idx = (y2 * width + x) * channels;
                const weight = gaussMatrix[i + radius];
                r += horizontal[idx] * weight;
                g += horizontal[idx + 1] * weight;
                b += horizontal[idx + 2] * weight;
                a += horizontal[idx + 3] * weight;
            }
            const idx = (y * width + x) * channels;
            vertical[idx] = r;
            vertical[idx + 1] = g;
            vertical[idx + 2] = b;
            vertical[idx + 3] = a;
        }
    }

    return new ImageData(vertical, width, height);
}

function createGaussianKernel(radius) {
    const sigma = radius / 3;
    const kernel = [];
    let sum = 0;
    
    for (let i = -radius; i <= radius; i++) {
        const weight = Math.exp(-(i*i)/(2*sigma*sigma));
        kernel.push(weight);
        sum += weight;
    }
    
    // 归一化
    return kernel.map(w => w / sum);
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = 'sharpened-image.png';
    link.href = resultCanvas.toDataURL();
    link.click();
}
