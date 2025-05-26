// 初始化变量
const sourceCanvas = document.getElementById('sourceCanvas');
const targetCanvas = document.getElementById('targetCanvas');
const upload = document.getElementById('upload');
const transformBtn = document.getElementById('transformBtn');
const sourcePointsDiv = document.getElementById('sourcePoints');
const targetPointsDiv = document.getElementById('targetPoints');
let sourcePoints = [];
let targetPoints = [];
let img;

// 文件上传处理
upload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        img = new Image();
        img.onload = function() {
            sourceCanvas.width = img.width;
            sourceCanvas.height = img.height;
            const ctx = sourceCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            targetCanvas.width = img.width;
            targetCanvas.height = img.height;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// 源画布点击事件
sourceCanvas.addEventListener('click', function(e) {
    if (sourcePoints.length >= 3) return;
    
    const rect = sourceCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    sourcePoints.push({x, y});
    updatePointsDisplay(sourcePointsDiv, sourcePoints.length);
    drawMarker(sourceCanvas, x, y);
    checkTransformButton();
});

// 目标画布点击事件
targetCanvas.addEventListener('click', function(e) {
    if (targetPoints.length >= 3) return;
    
    const rect = targetCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    targetPoints.push({x, y});
    updatePointsDisplay(targetPointsDiv, targetPoints.length);
    drawMarker(targetCanvas, x, y);
    checkTransformButton();
});

// 更新点数显示
function updatePointsDisplay(element, count) {
    element.textContent = `已选${count}/3点`;
}

// 绘制标记点
function drawMarker(canvas, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
}

// 检查按钮状态
function checkTransformButton() {
    transformBtn.disabled = !(sourcePoints.length === 3 && targetPoints.length === 3);
}

// 变换按钮点击事件
transformBtn.addEventListener('click', function() {
    if (sourcePoints.length !== 3 || targetPoints.length !== 3) return;

    const matrix = calculateAffineMatrix(sourcePoints, targetPoints);
    applyTransformation(matrix);
});

// 计算仿射变换矩阵
function calculateAffineMatrix(src, dst) {
    // 构建矩阵方程 A * X = B
    const A = [
        [src[0].x, src[0].y, 1, 0, 0, 0],
        [0, 0, 0, src[0].x, src[0].y, 1],
        [src[1].x, src[1].y, 1, 0, 0, 0],
        [0, 0, 0, src[1].x, src[1].y, 1],
        [src[2].x, src[2].y, 1, 0, 0, 0],
        [0, 0, 0, src[2].x, src[2].y, 1]
    ];
    
    const B = [dst[0].x, dst[0].y, dst[1].x, dst[1].y, dst[2].x, dst[2].y];
    
    // 使用高斯消元法解线性方程组
    const X = solveLinearSystem(A, B);
    return [
        [X[0], X[1], X[2]],
        [X[3], X[4], X[5]],
        [0, 0, 1]
    ];
}

// 解线性方程组
function solveLinearSystem(A, B) {
    const n = B.length;
    for (let i = 0; i < n; i++) {
        // 寻找主元
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
                maxRow = j;
            }
        }
        
        // 交换行
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [B[i], B[maxRow]] = [B[maxRow], B[i]];
        
        // 消元
        for (let j = i + 1; j < n; j++) {
            const factor = A[j][i] / A[i][i];
            for (let k = i; k < n; k++) {
                A[j][k] -= factor * A[i][k];
            }
            B[j] -= factor * B[i];
        }
    }
    
    // 回代
    const X = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * X[j];
        }
        X[i] = (B[i] - sum) / A[i][i];
    }
    return X;
}

// 应用变换
function applyTransformation(matrix) {
    const srcCtx = sourceCanvas.getContext('2d');
    const dstCtx = targetCanvas.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const dstData = dstCtx.createImageData(targetCanvas.width, targetCanvas.height);
    
    // 计算缩放比例
    const scaleX = Math.sqrt(matrix[0][0] ** 2 + matrix[0][1] ** 2);
    const scaleY = Math.sqrt(matrix[1][0] ** 2 + matrix[1][1] ** 2);
    const isUpscaling = scaleX > 1 || scaleY > 1;
    
    for (let y = 0; y < targetCanvas.height; y++) {
        for (let x = 0; x < targetCanvas.width; x++) {
            // 应用逆变换
            const srcX = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
            const srcY = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];
            
            let color;
            if (isUpscaling) {
                color = bilinearInterpolation(srcData, srcX, srcY);
            } else {
                color = bicubicInterpolation(srcData, srcX, srcY);
            }
            
            const idx = (y * targetCanvas.width + x) * 4;
            dstData.data.set(color, idx);
        }
    }
    
    dstCtx.putImageData(dstData, 0, 0);
}

// 双线性插值
function bilinearInterpolation(srcData, x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;
    
    const dx = x - x0;
    const dy = y - y0;
    
    const pixels = [
        getPixel(srcData, x0, y0),
        getPixel(srcData, x1, y0),
        getPixel(srcData, x0, y1),
        getPixel(srcData, x1, y1)
    ];
    
    const top = lerp(pixels[0], pixels[1], dx);
    const bottom = lerp(pixels[2], pixels[3], dx);
    return lerp(top, bottom, dy);
}

// 双三次插值
function bicubicInterpolation(srcData, x, y) {
    const x0 = Math.floor(x - 0.5) + 0.5;
    const y0 = Math.floor(y - 0.5) + 0.5;
    const dx = x - x0;
    const dy = y - y0;
    
    let result = [0, 0, 0, 0];
    for (let j = -1; j <= 2; j++) {
        for (let i = -1; i <= 2; i++) {
            const px = x0 + i;
            const py = y0 + j;
            const pixel = getPixel(srcData, px, py);
            
            // 计算权重
            const wx = cubicWeight(dx - i);
            const wy = cubicWeight(dy - j);
            const weight = wx * wy;
            
            result = result.map((v, idx) => v + pixel[idx] * weight);
        }
    }
    return result.map(v => Math.max(0, Math.min(v, 255)));
}

function cubicWeight(t) {
    const absT = Math.abs(t);
    if (absT <= 1) {
        return 1.5 * absT**3 - 2.5 * absT**2 + 1;
    } else if (absT < 2) {
        return -0.5 * absT**3 + 2.5 * absT**2 - 4 * absT + 2;
    }
    return 0;
}

// 辅助函数
function getPixel(data, x, y) {
    x = Math.max(0, Math.min(x, data.width - 1));
    y = Math.max(0, Math.min(y, data.height - 1));
    const idx = (y * data.width + x) * 4;
    return data.data.slice(idx, idx + 4);
}

function lerp(a, b, t) {
    return a.map((v, i) => v * (1 - t) + b[i] * t);
}
