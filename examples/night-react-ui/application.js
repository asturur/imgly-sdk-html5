/* global PhotoEditorSDK, Image */
window.onload = function () {
  var myImage = new Image()
  myImage.addEventListener('load', function () {
    /**
     * Initialize the UI
     */
    var editor = new PhotoEditorSDK.UI.NightReact({
      container: document.querySelector('#container'),
      image: myImage,
      responsive: true,
      logLevel: 'trace',
      assets: {
        baseUrl: '/build/assets',
        resolver: function (path) {
          return path
        }
      },
      language: 'en',
      operations: 'all',
      controlsOptions: {

      },
      additionalControls: [
        // {
        //   canvasControls: NoiseCanvasControls,
        //   controls: NoiseControl
        // }
      ],
      webcam: false
    })
    window.editorComponent = editor.run()
    window.editor = editor
  })

  myImage.src = 'test.jpg'
}
