document.addEventListener('DOMContentLoaded', () => {
    // 获取所有DOM元素
    const fileInput = document.getElementById('imageInput');
    const scaleMode = document.getElementById('scaleMode');
    const scaleInput = document.getElementById('scaleInput');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');
    const sizeInfo = document.getElementById('previewSize');
    
    let currentImage = null;
    let keepAspectRatio = true;

    // 处理图片上传
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentImage = new Image();
                currentImage.onload = () => {
                    canvas.width = currentImage.width;
                    canvas.height = currentImage.height;
                    ctx.drawImage(currentImage, 0, 0);
                    updateSizeInfo(currentImage.width, currentImage.height);
                    downloadBtn.disabled = false;
                };
                currentImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 处理缩放模式切换
    scaleMode.addEventListener('change', () => {
        document.querySelector('.scale-mode-group').style.display = 
            scaleMode.value === 'ratio' ? 'block' : 'none';
        document.querySelector('.size-mode-group').style.display = 
            scaleMode.value === 'size' ? 'flex' : 'none';
        updatePreview();
    });

    // 处理比例输入变化
    scaleInput.addEventListener('input', () => {
        if (scaleMode.value === 'ratio') {
            updatePreview();
        }
    });

    // 处理尺寸输入变化
    [widthInput, heightInput].forEach(input => {
        input.addEventListener('input', () => {
            if (scaleMode.value === 'size') {
                if (keepAspectRatio && currentImage) {
                    const aspect = currentImage.width / currentImage.height;
                    if (input === widthInput) {
                        heightInput.value = Math.round(widthInput.value / aspect);
                    } else {
                        widthInput.value = Math.round(heightInput.value * aspect);
                    }
                }
                updatePreview();
            }
        });
    });

    // 下载处理
    downloadBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `scaled-image-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    });

    function updateSizeInfo(w, h) {
        const originalSize = `${currentImage.width}×${currentImage.height}`;
        let infoText;
        
        if (scaleMode.value === 'ratio') {
            const scale = (w / currentImage.width * 100).toFixed(1);
            infoText = `缩放比例: ${scale}% | 原始尺寸: ${originalSize}`;
        } else {
            infoText = `目标尺寸: ${w}×${h} | 原始尺寸: ${originalSize}`;
        }
        
        sizeInfo.textContent = infoText;
    }
});
