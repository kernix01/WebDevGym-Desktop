(function () {
  const cameraKey = 'webdevgym_nexus_graph_camera_v2';
  if (!localStorage.getItem(cameraKey)) {
    localStorage.setItem(cameraKey, JSON.stringify({ x: 8, y: 20, scale: 0.68 }));
  }
})();

