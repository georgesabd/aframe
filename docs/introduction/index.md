<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VR App</title>
  <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
</head>
<body>
  <a-scene box-handler environment="preset: forest">
    <!-- Green button to add boxes -->
    <a-box id="add-button" position="0 1.5 -3" color="green" depth="0.5" height="0.5" width="0.5"
           animation="property: position; dir: alternate; dur: 1000; to: 0 1.7 -3"
           event-set__click="_event: click; _target: #scene; _emit: addBox"></a-box>
    
    <!-- Blue button to delete boxes -->
    <a-box id="delete-button" position="1 1.5 -3" color="blue" depth="0.5" height="0.5" width="0.5"
           animation="property: position; dir: alternate; dur: 1000; to: 1 1.7 -3"
           event-set__click="_event: click; _target: #scene; _emit: deleteBoxes"></a-box>
  </a-scene>

  <script>
    AFRAME.registerComponent('box-handler', {
      init: function () {
        const sceneEl = this.el;
        
        // Handle adding boxes
        sceneEl.addEventListener('addBox', function () {
          const newBox = document.createElement('a-box');
          newBox.setAttribute('color', 'yellow');
          newBox.setAttribute('depth', '0.5');
          newBox.setAttribute('height', '0.5');
          newBox.setAttribute('width', '0.5');
          
          const x = (Math.random() * 6) - 3;
          const y = (Math.random() * 3) + 1;
          const z = (Math.random() * -6) - 2;
          newBox.setAttribute('position', `${x} ${y} ${z}`);
          
          sceneEl.appendChild(newBox);
        });

        // Handle deleting boxes
        sceneEl.addEventListener('deleteBoxes', function () {
          const boxes = sceneEl.querySelectorAll('a-box[color="yellow"]');
          boxes.forEach(box => sceneEl.removeChild(box));
        });
      }
    });
  </script>
</body>
</html>



