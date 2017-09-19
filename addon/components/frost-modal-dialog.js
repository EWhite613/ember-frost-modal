import Ember from 'ember'
const {Component, on, run, Logger} = Ember
import layout from '../templates/components/frost-modal-dialog'
import createFocusTrap from 'npm:focus-trap'

export default Component.extend({

  // == Component properties ==================================================

  classNames: ['frost-modal-dialog'],
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

    let element = this.get('element')
    let candidateSelectors = 'input,select,a[href],textarea,button,[tabindex]'
    // .has returns a Jquery object, hence need to check length
    if (this.$(element).find(candidateSelectors).has(':visible').length) {
      let focusTrap = createFocusTrap(element)
      try {
        focusTrap.activate()
        this.set('focusTrap', focusTrap)
      } catch (e) {
        // catch just incase our check isn't good enough
        Logger.error(e)
      }
    }
  },
  willDestroyElement () {
    let focusTrap = this.get('focusTrap')
    if (focusTrap && focusTrap.deactivate) {
      focusTrap.deactivate()
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
