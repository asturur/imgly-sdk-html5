/**
 * EventEmitter (ES6) from:
 * https://gist.github.com/bloodyowl/41b1de3388c626796eca
 */

import Log from '../../shared/log'
const DEFAULT_MAX_LISTENERS = 12

/**
 * Receives and emits events
 * @class
 * @memberof PhotoEditorSDK
 * @ignore
 */
class EventEmitter {
  /**
   * Creates an EventEmitter
   */
  constructor () {
    this._maxListeners = DEFAULT_MAX_LISTENERS
    this._events = {}
    this._pipeDestinations = []
  }

  /**
   * Pipes all events to the given EventEmitter
   * @param  {EventEmitter} destination
   */
  pipeEvents (destination) {
    this._pipeDestinations.push(destination)
  }

  /**
   * Stops piping events to the given EventEmitter
   * @param  {EventEmitter} destination
   */
  unpipeEvents (destination) {
    const i = this._pipeDestinations.indexOf(destination)
    if (i === -1) return
    this._pipeDestinations.splice(i, 1)
  }

  /**
   * Adds the given listener to the given type of events
   * @param  {String} type
   * @param  {Function} listener
   */
  on (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError()
    }

    let listeners = this._events[type] || (this._events[type] = [])
    if (listeners.indexOf(listener) !== -1) {
      return this
    }
    listeners.push(listener)

    if (listeners.length > this._maxListeners) {
      Log.warn('EventEmitter',
        `Possible memory leak detected, added ${listeners.length} \`${type}\` listeners (current limit is ${this._maxListeners})`
      )
      console.trace()
    }
    return this
  }

  /**
   * Adds the given listener to the given type of events and removes it
   * once it has been triggered
   * @param  {String} type
   * @param  {Function} listener
   */
  once (type, listener) {
    let eventsInstance = this
    function onceCallback () {
      eventsInstance.off(type, onceCallback)
      listener.apply(null, arguments)
    }
    return this.on(type, onceCallback)
  }

  /**
   * Removes the given listener from the given type of events
   * @param  {String} type
   * @param  {*} ...args
   */
  off (type, ...args) {
    if (args.length === 0) {
      this._events[type] = null
      return this
    }

    let listener = args[0]
    if (typeof listener !== 'function') {
      throw new TypeError()
    }

    let listeners = this._events[type]
    if (!listeners || !listeners.length) {
      return this
    }

    let indexOfListener = listeners.indexOf(listener)
    if (indexOfListener === -1) {
      return this
    }

    listeners.splice(indexOfListener, 1)
    return this
  }

  /**
   * Emits an event with the given type and arguments
   * @param  {String} type
   * @param  {*} ...args
   */
  emit (type, ...args) {
    this._pipeDestinations.forEach((dest) => {
      dest.emit(type, ...args)
    })

    let listeners = this._events[type]
    if (!listeners || !listeners.length) {
      return false
    }

    listeners.forEach(fn => fn.apply(null, args))

    return true
  }

  /**
   * Sets the maximum amonut of listeners before a warning is printed
   * @param {Number} newMaxListeners
   */
  setMaxListeners (newMaxListeners) {
    if (parseInt(newMaxListeners, 10) !== newMaxListeners) {
      throw new TypeError()
    }

    this._maxListeners = newMaxListeners
  }
}

export default EventEmitter
