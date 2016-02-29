/* global PhotoEditorSDK, Image */
window.onload = function () {
  var editor
  function run (preferredRenderer) {
    editor = new PhotoEditorSDK.UI.NightReact({
      preferredRenderer: preferredRenderer || 'webgl',
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

    editor.on(PhotoEditorSDK.UI.NightReact.Constants.EVENTS.OPERATION_CREATED, function () {
      console.log('operation created', arguments)
    })

    editor.on(PhotoEditorSDK.UI.NightReact.Constants.EVENTS.OPERATION_UPDATED, function () {
      console.log('operation updated', arguments)
    })

    editor.on(PhotoEditorSDK.UI.NightReact.Constants.EVENTS.CONTROLS_SWITCHED, function (controls) {
      console.log('controls switched to', controls)
    })

    editor.on(PhotoEditorSDK.UI.NightReact.Constants.EVENTS.HISTORY_UNDO, function (controls) {
      console.log('history undone')
    })

    editor.on(PhotoEditorSDK.UI.NightReact.Constants.EVENTS.EXPORT, function (result) {
      console.log('export', result)
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
