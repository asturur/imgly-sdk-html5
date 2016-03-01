/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default {
  EVENTS: {
    RENDER: 'render',
    EXPORT: 'export',
    ZOOM: 'zoom',
    ZOOM_DONE: 'zoom:done',
    ZOOM_UNDO: 'zoom:undo',
    OPERATION_CREATED: 'operation:created',
    OPERATION_UPDATED: 'operation:updated',
    OPERATION_REMOVED: 'operation:removed',
    FEATURES_DISABLED: 'editor:features:disabled',
    FEATURES_ENABLED: 'editor:features:enabled',
    FEATURES_UPDATED: 'editor:features:updated',
    COLORPICKER_OPEN: 'colorpicker:open',
    HISTORY_UPDATED: 'history:update',
    HISTORY_UNDO: 'history:undo',
    WINDOW_RESIZE: 'window:resize',
    CONTROLS_SWITCHED: 'controls:switched'
  },
  DEFAULTS: {
    CROP_RATIOS: [
      { name: 'custom', ratio: '*', selected: true },
      { name: 'square', ratio: 1 },
      { name: '4-3', ratio: 1.33 },
      { name: '16-9', ratio: 1.77 }
    ],
    FONTS: [
      { name: 'helvetica', fontFamily: 'Helvetica', fontWeight: 'normal' },
      { name: 'verdana', fontFamily: 'Verdana', fontWeight: 'normal' },
      { name: 'timesnewroman', fontFamily: 'Times New Roman', fontWeight: 'normal' },
      { name: 'impact', fontFamily: 'Impact', fontWeight: 'normal', default: true }
    ],
    STICKERS: [
      {
        'name': 'glasses-nerd',
        'label': 'Nerd glasses',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/glasses-nerd.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/glasses-nerd.png',
            'width': 221,
            'height': 91
          }
        }
      },
      {
        'name': 'glasses-normal',
        'label': 'Normal glasses',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/glasses-normal.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/glasses-normal.png',
            'width': 249,
            'height': 87
          }
        }
      },
      {
        'name': 'glasses-shutter-green',
        'label': 'Green shutter glasses',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/glasses-shutter-green.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/glasses-shutter-green.png',
            'width': 235,
            'height': 89
          }
        }
      },
      {
        'name': 'glasses-shutter-yellow',
        'label': 'Yellow shutter glasses',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/glasses-shutter-yellow.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/glasses-shutter-yellow.png',
            'width': 236,
            'height': 89
          }
        }
      },
      {
        'name': 'glasses-sun',
        'label': 'Sun glasses',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/glasses-sun.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/glasses-sun.png',
            'width': 250,
            'height': 87
          }
        }
      },
      {
        'name': 'hat-cap',
        'label': 'Cap',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/hat-cap.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/hat-cap.png',
            'width': 237,
            'height': 189
          }
        }
      },
      {
        'name': 'hat-cylinder',
        'label': 'Cylinder',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/hat-cylinder.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/hat-cylinder.png',
            'width': 225,
            'height': 176
          }
        }
      },
      {
        'name': 'hat-party',
        'label': 'Party hat',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/hat-party.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/hat-party.png',
            'width': 140,
            'height': 226
          }
        }
      },
      {
        'name': 'hat-sheriff',
        'label': 'Sheriff hat',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/hat-sheriff.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/hat-sheriff.png',
            'width': 251,
            'height': 129
          }
        }
      },
      {
        'name': 'heart',
        'label': 'Heart',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/heart.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/heart.png',
            'width': 185,
            'height': 174
          }
        }
      },
      {
        'name': 'mustache-long',
        'label': 'Long mustache',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/mustache-long.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/mustache-long.png',
            'width': 199,
            'height': 182
          }
        }
      },
      {
        'name': 'mustache1',
        'label': 'Brown mustache',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/mustache1.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/mustache1.png',
            'width': 238,
            'height': 106
          }
        }
      },
      {
        'name': 'mustache2',
        'label': 'Black mustache',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/mustache2.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/mustache2.png',
            'width': 250,
            'height': 82
          }
        }
      },
      {
        'name': 'mustache3',
        'label': 'Brown mustache',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/mustache3.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/mustache3.png',
            'width': 250,
            'height': 94
          }
        }
      },
      {
        'name': 'pipe',
        'label': 'Pipe',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/pipe.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/pipe.png',
            'width': 240,
            'height': 112
          }
        }
      },
      {
        'name': 'snowflake',
        'label': 'Snow flake',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/snowflake.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/snowflake.png',
            'width': 204,
            'height': 171
          }
        }
      },
      {
        'name': 'star',
        'label': 'Star',
        'images': {
          'mediaThumb': {
            'uri': 'stickers/thumb/star.png',
            'width': 100,
            'height': 100
          },
          'mediaBase': {
            'uri': 'stickers/base/star.png',
            'width': 201,
            'height': 191
          }
        }
      }
    ]
  }
}
