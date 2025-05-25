let currentRotation = 0;
let currentImage = null;

// 图片上传处理
document.getElementById('upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = document.getElementById('preview');
        img.src = event.target.result;
        img.style.display = 'block';
        currentImage = img;
        currentRotation = 0;
        img.style.transform = `rotate(${currentRotation}deg)`;
    };
    
    reader.readAsDataURL(file);
});

// 图片旋转
document.getElementById('rotate').addEventListener('click', function() {
    currentRotation += 90;
    if(currentImage) {
        currentImage.style.transform = `rotate(${currentRotation}deg)`;
    }
});

// 图片下载
document.getElementById('download').addEventListener('click', function() {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = currentImage.naturalWidth;
    canvas.height = currentImage.naturalHeight;
    
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentRotation * Math.PI/180);
    ctx.drawImage(currentImage, -canvas.width/2, -canvas.height/2);
    
    const link = document.createElement('a');
    link.download = 'rotated-image.png';
    link.href = canvas.toDataURL();
    link.click();
});
