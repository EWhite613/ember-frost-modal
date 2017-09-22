import Ember from 'ember'
const {$, Component, on, run} = Ember
import layout from '../templates/components/frost-modal-dialog'
import tabbable from 'npm:tabbable'

let container
let lastElement
function checkFocus (e) {
  if (container.contains(e.target)) {
    lastElement = document.activeElement
    return
  } else {
    let focusableElements = tabbable(container)
    let lastIndex = $(focusableElements).index(lastElement)

    if (lastIndex > -1) {
      let next = focusableElements[lastIndex + 1] || focusableElements[0]
      next.focus()
      return
    }
    e.preventDefault()
    e.stopImmediatePropagation()
  }

  // Checking for a blur method here resolves a Firefox issue (#15)
  if (typeof e.target.blur === 'function') e.target.blur()
}
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
    container = this.get('element')
    document.addEventListener('focus', checkFocus, true)
  },
  willDestroyElement () {
    // let focusTrap = this.get('focusTrap')
    // if (focusTrap && focusTrap.deactivate) {
    //   focusTrap.deactivate()
    // }

    document.removeEventListener('focus', checkFocus, true)
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
