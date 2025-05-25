document.addEventListener('DOMContentLoaded', () => {
    const upload = document.getElementById('upload');
    const filterSelect = document.getElementById('filterSelect');
    const downloadBtn = document.getElementById('download');
    const sourceCanvas = document.getElementById('sourceCanvas');
    const resultCanvas = document.getElementById('resultCanvas');
    
    let currentImage = null;
    let processedImage = null;

    // 初始化Canvas上下文
    const sourceCtx = sourceCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    // 图像上传处理
    upload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentImage = new Image();
                currentImage.onload = () => {
                    sourceCanvas.width = currentImage.width;
                    sourceCanvas.height = currentImage.height;
                    resultCanvas.width = currentImage.width;
                    resultCanvas.height = currentImage.height;
                    sourceCtx.drawImage(currentImage, 0, 0);
                    applyFilter();
                    downloadBtn.disabled = false;
                };
                currentImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }); 



    // 黑白高对比滤镜算法
    function applyBlackFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            const brightness = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
            const threshold = 128;
            const value = brightness > threshold ? 255 : 0;
            data[i] = value;    // R
            data[i+1] = value;  // G
            data[i+2] = value;  // B
        }
    }


    // 滤镜选择处理
    filterSelect.addEventListener('change', applyFilter);

    // 下载处理
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = resultCanvas.toDataURL();
        link.click();
    });

    // 滤镜应用核心函数
    function applyFilter() {
        if (!currentImage) return;

        const filterType = filterSelect.value;
        resultCtx.drawImage(currentImage, 0, 0);

        if (filterType === 'none') {
            return;
        }

        const imageData = resultCtx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
        const data = imageData.data;

        switch(filterType) {
            case 'grayscale':
                applyGrayscale(data);
                break;
            case 'invert':
                applyInvert(data);
                break;
            case 'saturate':
                applySaturation(data, 1.5);
                break;
            case 'black':
                applyBlackFilter(data);
                break;
        }

        resultCtx.putImageData(imageData, 0, 0);
    }

    // 灰度滤镜算法
    function applyGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            const avg = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
            data[i] = data[i+1] = data[i+2] = avg;
        }
    }

    // 反色滤镜算法
    function applyInvert(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // R
            data[i+1] = 255 - data[i+1]; // G
            data[i+2] = 255 - data[i+2]; // B
        }
    }

    // 饱和度增强算法
    function applySaturation(data, level) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            const avg = (r + g + b) / 3;
            data[i] = avg + (r - avg) * level;
            data[i+1] = avg + (g - avg) * level;
            data[i+2] = avg + (b - avg) * level;
        }
    }
});
