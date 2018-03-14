/* global WheelEvent */
import Ember from 'ember'
const {Component, on, run} = Ember
import layout from '../templates/components/frost-modal-dialog'

export default Component.extend({

  // == Component properties ==================================================

  classNames: ['frost-modal-dialog'],
  attributeBindings: ['role'],
  role: 'dialog',
  layout,

  // == Events ================================================================

  // TODO overflow isn't triggered when content component size changes
  // BEGIN-SNIPPET dialog-overflow
  initOverflow: on('didInsertElement', function () {
    const scroll = this.$('.frost-modal-dialog-scroll').get(0)
    if (scroll.scrollHeight > scroll.clientHeight) {
      run.schedule('sync', () => {
        this.set('isOverflowYEnd', true)
      })
    }
  }),
  // END-SNIPPET
  didInsertElement () {
    const element = this.get('element')
    // document.addEventListener('focus', this._focusRestrict.bind(this, element), true)
    // Keep wheel confined to dialog
    element.addEventListener('wheel', this._scrollRestrict.bind(this, element), true)
  },
  // Functions ================================================================
  _scrollRestrict (element, event) {
    const eventTarget = element.getElementsByClassName('frost-modal-dialog-scroll')[0]
    if (this.get('isVisible') !== false && !eventTarget.contains(event.target)) {
      event.stopPropagation()
      event.preventDefault()
      let newEvent = new WheelEvent(event.type, event)
      eventTarget.dispatchEvent(newEvent)
    }
  },
  _focusRestrict (element, event) {
    if (this.get('isVisible') !== false && !element.contains(event.target)) {
      event.stopPropagation()
      event.preventDefault()
      element.focus()
    }
  },

  // == Actions ===============================================================

  actions: {
    scrollDown () {
      this.set('isOverflowYStart', true)
    },

    scrollUp () {
      this.set('isOverflowYEnd', true)
    },

    scrollYEnd () {
      this.set('isOverflowYEnd', false)
    },

    scrollYStart () {
      this.set('isOverflowYStart', false)
    }
  }

})
