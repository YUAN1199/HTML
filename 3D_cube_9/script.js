// 初始化场景、相机、渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// 创建立方体
function createDiceFaceTexture(number, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 256;
  
  // 绘制背景
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 256, 256);
  
  // 绘制数字
  context.fillStyle = color;
  context.font = 'bold 100px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(number, 128, 128);
  
  return new THREE.CanvasTexture(canvas);
}

// 创建六个面的材质
const materials = [
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('1', '#ff0000') }), // 前
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('6', '#0000ff') }), // 后
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('2', '#00ff00') }), // 上
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('5', '#ffff00') }), // 下 
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('3', '#ff00ff') }), // 右
  new THREE.MeshBasicMaterial({ map: createDiceFaceTexture('4', '#00ffff') })  // 左
];

const geometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// 相机位置
camera.position.z = 5;

// 处理窗口调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 控制逻辑
document.getElementById('xRotation').addEventListener('input', updateRotation);
document.getElementById('yRotation').addEventListener('input', updateRotation);
document.getElementById('zRotation').addEventListener('input', updateRotation);

function updateRotation() {
  const x = document.getElementById('xRotation').value * Math.PI / 180;
  const y = document.getElementById('yRotation').value * Math.PI / 180;
  const z = document.getElementById('zRotation').value * Math.PI / 180;
  
  cube.rotation.set(x, y, z);
}
