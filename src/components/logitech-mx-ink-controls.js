var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
var emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
var onButtonEvent = trackedControlsUtils.onButtonEvent;

// See Profiles Registry:
// https://github.com/immersive-web/webxr-input-profiles/tree/master/packages/registry
// TODO: Add a more robust system for deriving gamepad name.
var GAMEPAD_ID = 'logitech-mx-ink';
var AFRAME_CDN_ROOT = require('../constants').AFRAME_CDN_ROOT;
var LOGITECH_MX_INK_MODEL_GLB_BASE_URL = AFRAME_CDN_ROOT + 'controllers/logitech/';

/**
 * Button IDs:
 * 0 - trigger
 * 1 - grip
 * 3 - X / A
 * 4 - Y / B
 *
*/
var INPUT_MAPPING_WEBXR = {
  left: {
    buttons: ['trigger', 'squeeze', 'none', 'none', 'touchpad', 'tip', 'dock']
  },
  right: {
    buttons: ['trigger', 'squeeze', 'none', 'none', 'touchpad', 'tip', 'dock']
  }
};

/**
 * Logitech MX Ink Controls
 */
module.exports.Component = registerComponent('logitech-mx-ink-controls', {
  schema: {
    hand: {default: 'left'},
    model: {default: true},
    orientationOffset: {type: 'vec3'}
  },

  mapping: INPUT_MAPPING_WEBXR,

  init: function () {
    var self = this;
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self, self.data.hand); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self, self.data.hand); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self, self.data.hand); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self, self.data.hand); };
    this.bindMethods();
  },

  update: function () {
    var data = this.data;
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
  },

  bindMethods: function () {
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.removeControllersUpdateListener = this.removeControllersUpdateListener.bind(this);
    this.onAxisMoved = this.onAxisMoved.bind(this);
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('axismove', this.onAxisMoved);
    el.addEventListener('model-loaded', this.onModelLoaded);
    this.controllerEventsActive = true;
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('axismove', this.onAxisMoved);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    el.sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    el.sceneEl.removeEventListener('exit-vr', this.onExitVR);
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    checkControllerPresentAndSetup(this, GAMEPAD_ID, {
      hand: this.data.hand,
      iterateControllerProfiles: true
    });
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    el.setAttribute('tracked-controls', {
      hand: data.hand,
      idPrefix: GAMEPAD_ID,
      orientationOffset: data.orientationOffset,
      space: 'gripSpace'
    });
    // Load model.
    if (!this.data.model) { return; }
    this.el.setAttribute('gltf-model', LOGITECH_MX_INK_MODEL_GLB_BASE_URL + 'logitech-mx-ink.glb');
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    this.checkIfControllerPresent();
  },

  onButtonChanged: function (evt) {
    var button = this.mapping[this.data.hand].buttons[evt.detail.id];
    var analogValue;

    if (!button) { return; }
    if (button === 'trigger') {
      analogValue = evt.detail.state.value;
      console.log('analog value of trigger press: ' + analogValue);
    }

    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    if (evt.target !== this.el || !this.data.model) { return; }

    this.el.emit('controllermodelready', {
      name: 'logitech-mx-ink-controls',
      model: this.data.model,
      rayOrigin: new THREE.Vector3(0, 0, 0)
    });

    if (this.el.sceneEl.is('ar-mode')) {
      this.el.getObject3D('mesh').visible = false;
    }
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping.axes, evt);
  }
});
