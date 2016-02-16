/* global PhotoEditorSDK, Image */
window.onload = function () {
  var editor
  function run (preferredRenderer) {
    editor = new PhotoEditorSDK.UI.NightReact({
      preferredRenderer: preferredRenderer || 'canvas',
      container: document.querySelector('#container'),
      image: myImage,
      // logLevel: 'info',
      assets: {
        baseUrl: '/build/assets',
        resolver: function (path) {
          return path
        }
      },
      language: 'en'
    })
  }

  /**
   * Load initial image, initialize UI
   */
  var myImage = new Image()
  myImage.addEventListener('load', function () {
    run()
  })
  myImage.src = 'test.jpg'

  /**
   * Handle links
   */
  var webglLink = document.body.querySelector('#webgl')
  var canvasLink = document.body.querySelector('#canvas')
  webglLink.addEventListener('click', function (e) {
    e.preventDefault()
    editor.dispose()
    canvasLink.classList.remove('active')
    webglLink.classList.add('active')
    run('webgl')
  })

  canvasLink.addEventListener('click', function (e) {
    e.preventDefault()
    editor.dispose()
    webglLink.classList.remove('active')
    canvasLink.classList.add('active')
    run('canvas')
  })

}
