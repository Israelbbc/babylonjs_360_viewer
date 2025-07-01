(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.babylonjs360Viewer = {
    attach: function (context, settings) {
      once('babylonjs-360-viewer', '.babylonjs-360-viewer', context).forEach(function (element) {
        const fileUrl = drupalSettings?.babylonjs_360_viewer?.file_url;
        const type = drupalSettings?.babylonjs_360_viewer?.type || 'photo';

        const canvas = element.querySelector('#babylon-360-canvas');
        if (!canvas || !fileUrl) return;

        const engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          alpha: true
        });
        engine.setHardwareScalingLevel(1);

        // Custom loading screen
        /*BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
          if (this._isLoading) return;
          this._isLoading = true;

          const loadingDiv = document.createElement("div");
          loadingDiv.id = "customLoadingScreenDiv";
          loadingDiv.style.position = 'absolute';
          loadingDiv.style.top = `${canvas.offsetTop}px`;
          loadingDiv.style.left = `${canvas.offsetLeft}px`;
          loadingDiv.style.width = `${canvas.clientWidth}px`;
          loadingDiv.style.height = `${canvas.clientHeight}px`;
          loadingDiv.style.backgroundColor = 'black';
          loadingDiv.style.zIndex = '1000';
          loadingDiv.style.display = 'flex';
          loadingDiv.style.alignItems = 'center';
          loadingDiv.style.justifyContent = 'center';

          const loadingImage = document.createElement('img');
          loadingImage.alt = 'Cargando...';
          loadingImage.style.width = '250px';
          loadingImage.style.height = '250px';
          loadingImage.src = drupalSettings.path.baseUrl + 'sites/default/files/babylonjs_viewer/screen-load.png';
          loadingDiv.appendChild(loadingImage);
          canvas.parentElement.appendChild(loadingDiv);
        };*/

        BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {
          const loadingDiv = document.getElementById('customLoadingScreenDiv');
          if (loadingDiv) loadingDiv.remove();
          this._isLoading = false;
        };

        engine.displayLoadingUI();

        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
        const camera = new BABYLON.ArcRotateCamera("camera", -(45 * Math.PI) / 180, Math.PI / 2, 1, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        scene.activeCamera = camera;

        // Guardamos estado inicial
        const initialCameraState = {
          alpha: camera.alpha,
          beta: camera.beta,
          radius: camera.radius,
          target: camera.target.clone()
        };

        if (type === 'video') {
          new BABYLON.VideoDome("video", [fileUrl], {
            resolution: 64,
            size: 1000,
            autoPlay: true,
            clickToPlay: true,
          }, scene);
        } else {
          new BABYLON.PhotoDome("panorama", fileUrl, {
            resolution: 64,
            size: 1000
          }, scene);
        }

        const controls = element.querySelector('.viewer-controls');
        const completeViewBtn = element.querySelector('#completeView');
        const icon = document.getElementById('completeViewIcon');

        const rotateStep = 0.5;
        const zoomStep = 50;
        const minRadius = 0;
        const maxRadius = 10000;

        // Zoom
        controls.querySelector('#zoomIn')?.addEventListener('click', () => {
          camera.radius = Math.max(minRadius, camera.radius - zoomStep);
        });
        controls.querySelector('#zoomOut')?.addEventListener('click', () => {
          camera.radius = Math.min(maxRadius, camera.radius + zoomStep);
        });

        // Rotación
        controls.querySelector('#rotateLeft')?.addEventListener('click', () => {
          camera.alpha += rotateStep;
        });
        controls.querySelector('#rotateRight')?.addEventListener('click', () => {
          camera.alpha -= rotateStep;
        });
        controls.querySelector('#rotateUp')?.addEventListener('click', () => {
          camera.beta += rotateStep;
        });
        controls.querySelector('#rotateDown')?.addEventListener('click', () => {
          camera.beta -= rotateStep;
        });

        // Reset
        controls.querySelector('#resetView')?.addEventListener('click', () => {
          Object.assign(camera, initialCameraState);
          camera.target = initialCameraState.target.clone();
        });

        // Fullscreen
        const isIos = /iP(ad|hone|od)/.test(navigator.userAgent);
        const toggleFullscreen = () => {
          const isFull = element.classList.contains('fullscreen-active');

          if (isIos || !element.requestFullscreen) {
            if (!isFull) {
              element.classList.add('fullscreen-active');
              element.style.position = 'fixed';
              element.style.top = '0';
              element.style.left = '0';
              element.style.width = '100vw';
              element.style.height = '100vh';
              element.style.zIndex = '9999';
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
              icon?.classList.replace('fa-expand', 'fa-compress');
            } else {
              element.classList.remove('fullscreen-active');
              element.removeAttribute('style');
              canvas.removeAttribute('style');
              canvas.style.width = '100%';
              canvas.style.aspectRatio = '2 / 1';
              scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
              icon?.classList.replace('fa-compress', 'fa-expand');
            }
            setTimeout(() => engine.resize(), 100);
          } else {
            if (!document.fullscreenElement) {
              element.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        };

        completeViewBtn?.addEventListener('click', toggleFullscreen);

        document.addEventListener('fullscreenchange', () => {
          const isFull = document.fullscreenElement === element;
          if (isFull) {
            element.classList.add('fullscreen-active');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
            icon?.classList.replace('fa-expand', 'fa-compress');
          } else {
            element.classList.remove('fullscreen-active');
            canvas.style.width = '100%';
            canvas.style.aspectRatio = '2 / 1';
            scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
            icon?.classList.replace('fa-compress', 'fa-expand');
          }
          setTimeout(() => engine.resize(), 100);
        });

        engine.runRenderLoop(() => scene.render());
        window.addEventListener('resize', () => engine.resize());
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
