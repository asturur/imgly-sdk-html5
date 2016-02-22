var classes = {}
var currentClass = null

var TYPE_MAP = {
  number: 'Number',
  string: 'String',
  boolean: 'Boolean',
  object: 'Object',
  '*': '*',
  vector2: 'PhotoEditorSDK.Math.Vector2',
  color: 'PhotoEditorSDK.Color',
  configurable: 'PhotoEditorSDK.Configurable',
  array: 'Array'
}

exports.handlers = {
  newDoclet: function (e) {
    var doclet = e.doclet
    if (doclet.kind === 'class') {
      classes[doclet.memberof] = {
        options: {},
        longname: doclet.memberof,
        meta: doclet.meta
      }
      currentClass = classes[doclet.memberof]
    }

    // Collect available options
    if (doclet.kind === 'member' && doclet.memberof) {
      // Option declaration
      if (doclet.memberof.match(/#availableOptions$/)) {
        currentClass.options[doclet.name] = {
          type: null,
          value: null
        }
      }

      // Type definition
      var match = doclet.longname.match(/#availableOptions\.(\w+?)\.type$/)
      if (match) {
        currentClass.options[match[1]].type = doclet.meta.code.value
      }

      // Value definition
      match = doclet.longname.match(/#availableOptions\.(\w+?)\.default$/)
      if (match) {
        currentClass.options[match[1]].value = doclet.meta.code.value
      }
    }
  },
  parseComplete: function (e) {
    for (var className in classes) {
      var classInfo = classes[className]
      if (Object.keys(classInfo.options).length === 0) continue

      var options = classInfo.options
      var option, capitalized
      for (var name in options) {
        option = options[name]
        capitalized = name.charAt(0).toUpperCase() + name.slice(1)
        e.doclets.push({
          comment: '',
          description: 'Sets the ' + name,
          name: 'set' + capitalized,
          longname: classInfo.longname + '#set' + capitalized,
          kind: 'function',
          scope: 'instance',
          memberof: classInfo.longname,
          params: [
            {
              type: {
                names: [TYPE_MAP[option.type]]
              },
              name: name
            }
          ]
        })

        e.doclets.push({
          comment: '',
          description: 'Returns the ' + name,
          name: 'get' + capitalized,
          longname: classInfo.longname + '#get' + capitalized,
          kind: 'function',
          scope: 'instance',
          memberof: classInfo.longname,
          returns: [
            {
              type: {
                names: [TYPE_MAP[option.type]]
              },
              description: 'The ' + name,
              name: name
            }
          ]
        })
      }
    }
  }
}
