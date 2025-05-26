document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    const originalPreview = document.getElementById('originalPreview');
    const scaledPreview = document.getElementById('scaledPreview');
    const originalSize = document.getElementById('originalSize');
    const scaledSize = document.getElementById('scaledSize');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let originalImage = null;
    let scaledImageBlob = null;

    // 处理图像上传
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    // 显示原始图像
                    originalPreview.src = e.target.result;
                    updateSizeInfo(originalSize, originalImage.naturalWidth, originalImage.naturalHeight);
                    
                    // 初始化缩放图像
                    updateScaledImage();
                    downloadBtn.disabled = false;
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 更新缩放比例显示
    scaleSlider.addEventListener('input', () => {
        scaleValue.textContent = `${scaleSlider.value}%`;
        updateScaledImage();
    });

    // 图像缩放处理
    function updateScaledImage() {
        if (!originalImage) return;

        const scaleFactor = scaleSlider.value / 100;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算新尺寸
        const newWidth = Math.round(originalImage.naturalWidth * scaleFactor);
        const newHeight = Math.round(originalImage.naturalHeight * scaleFactor);
        
        // 绘制缩放图像
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
        
        // 更新预览和尺寸信息
        canvas.toBlob(blob => {
            scaledImageBlob = blob;
            scaledPreview.src = URL.createObjectURL(blob);
            updateSizeInfo(scaledSize, newWidth, newHeight);
        }, 'image/jpeg', 0.9);
    }

    // 更新尺寸信息显示
    function updateSizeInfo(element, width, height) {
        element.innerHTML = `
            <h3>尺寸：${width} × ${height}px</h3>
            <div>宽高比：${(width/height).toFixed(2)}</div>
        `;
    }

    // 处理下载功能
    downloadBtn.addEventListener('click', () => {
        if (!scaledImageBlob) return;
        
        const url = URL.createObjectURL(scaledImageBlob);
        const a = document.createElement('a');
        a.download = `scaled-image-${Date.now()}.jpg`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    });

    // 初始化比例显示
    scaleValue.textContent = `${scaleSlider.value}%`;
});
