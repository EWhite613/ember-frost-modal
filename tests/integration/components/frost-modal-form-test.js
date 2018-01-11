import {expect} from 'chai'
import {$hook, initialize as initializeHook} from 'ember-hook'
import wait from 'ember-test-helpers/wait'
import {integration} from 'ember-test-utils/test-support/setup-component-test'
import {returnPromiseFromStub} from 'ember-test-utils/test-support/stub'
import hbs from 'htmlbars-inline-precompile'
import {afterEach, beforeEach, describe, it} from 'mocha'
import sinon from 'sinon'

import modalUtils from 'dummy/tests/helpers/ember-frost-modal'
import {deps as modalDeps} from 'ember-frost-modal/components/frost-modal-binding'

const test = integration('frost-modal-form')
describe(test.label, function () {
  test.setup()

  let props, sandbox

  beforeEach(function () {
    initializeHook()
    this.timeout(10000)
    sandbox = sinon.sandbox.create()
    sandbox.stub(modalDeps.Logger, 'log')

    props = {
      closeOnConfirm: true,
      confirm: {
        disabledText: 'Waiting',
        text: 'Confirm'
      },
      disableConfirmUntilOnConfirmResolves: true,
      hook: 'form-dialog',
      isFormVisible: true,
      simpleBunsenChange: sandbox.stub(),
      simpleBunsenModel: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string'
          },
          lastName: {
            type: 'string'
          },
          alias: {
            type: 'string',
            title: 'Nickname'
          },
          onlyChild: {
            type: 'boolean'
          },
          age: {
            type: 'number',
            title: 'Age'
          }
        },
        required: ['lastName']
      },
      simpleBunsenValue: {},
      onClose: sandbox.stub(),
      onConfirm: sandbox.stub()
    }

    this.setProperties(props)
    this.render(hbs`
      {{frost-modal-outlet}}

      {{frost-modal-form
        buttons=buttons
        cancel=cancel
        closeOnConfirm=closeOnConfirm
        closeAfterOnConfirmResolves=closeAfterOnConfirmResolves
        confirm=confirm
        disableConfirmUntilOnConfirmResolves=disableConfirmUntilOnConfirmResolves
        footer=footer
        form=(component 'frost-bunsen-form'
          bunsenModel=simpleBunsenModel
          hook='bunsen-form'
          onChange=simpleBunsenChange
          value=simpleBunsenValue
        )
        hook='form-dialog'
        isVisible=isFormVisible
        subtitle=subtitle
        title='Easy peasy'
        onConfirm=onConfirm
        onClose=onClose
      }}
    `)

    return wait()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should render', function () {
    expect($hook('form-dialog-modal')).to.have.length(1)
  })

  it('should close on cancel', function () {
    $hook('form-dialog-modal-cancel').click()

    return wait()
      .then(() => {
        expect(props.onClose, 'Is modal hidden').to.have.callCount(1)
      })
  })

  it('should trigger function on confirm click', function () {
    $hook('form-dialog-modal-confirm').click()

    return wait()
      .then(() => {
        expect(props.onConfirm.called, 'Is confirm called').to.equal(true)
      })
  })

  it('should close on confirm when closeOnConfirm=true', function () {
    $hook('form-dialog-modal-confirm').click()

    return wait()
      .then(() => {
        expect(props.onClose, 'Is modal hidden').to.have.callCount(1)
      })
  })

  it('should have confirm button with tabIndex === 0', function () {
    expect($hook('form-dialog-modal-confirm').prop('tabindex')).to.equal(0)
  })

  it('should have cancel button with tabIndex === 1', function () {
    expect($hook('form-dialog-modal-cancel').prop('tabindex')).to.equal(1)
  })

  describe('when cancel is given tabIndex: 0', function () {
    beforeEach(function () {
      this.set('cancel', {
        tabIndex: 0
      })

      return wait()
    })

    it('should have cancel button with tabIndex === 0', function () {
      expect($hook('form-dialog-modal-cancel').prop('tabindex')).to.equal(0)
    })
  })

  describe('when confirm is given tabIndex: 1', function () {
    beforeEach(function () {
      this.set('confirm', {
        tabIndex: 1
      })

      return wait()
    })

    it('should have confirm button with tabIndex === 1', function () {
      expect($hook('form-dialog-modal-confirm').prop('tabindex')).to.equal(1)
    })
  })

  describe('when closeOnConfirm is false', function () {
    beforeEach(function () {
      this.set('closeOnConfirm', false)
      return wait()
    })

    it('should stay open', function () {
      $hook('form-dialog-modal-confirm').click()
      expect($hook('form-dialog-modal'), 'Is modal hidden').to.have.length(1)
    })
  })

  describe('when onConfirm returns a promise', function () {
    let resolver

    beforeEach(function () {
      resolver = returnPromiseFromStub(props.onConfirm)
    })

    function itShouldBePromiseAware (desc, {closeOnConfirm, disableConfirmUntilOnConfirmResolves}) {
      describe(desc, function () {
        beforeEach(function () {
          this.setProperties({
            closeOnConfirm,
            disableConfirmUntilOnConfirmResolves
          })
        })

        describe('when Confirm is clicked', function () {
          beforeEach(function () {
            $hook('form-dialog-modal-confirm').click()
            return wait()
          })

          it('should call onConfirm()', function () {
            expect(props.onConfirm).to.have.callCount(1)
          })

          it('should not invoke onClose', function () {
            expect(props.onClose).to.have.callCount(0)
          })

          // State before promise is resolved

          if (disableConfirmUntilOnConfirmResolves) {
            it('should have a disabled Confirm button with the overridden disabled settings', function () {
              modalUtils.expectModalConfirmButtonWithState({text: 'Waiting', disabled: true})
            })
          } else {
            it('should have an enabled Confirm button', function () {
              modalUtils.expectModalConfirmButtonWithState({text: 'Confirm', disabled: false})
            })
          }

          describe('when the onConfirm promise resolves', function () {
            beforeEach(function () {
              resolver.resolve('success!')
              return wait()
            })

            it('should not log an error', function () {
              expect(modalDeps.Logger.log).to.have.callCount(0)
            })

            if (disableConfirmUntilOnConfirmResolves) {
              it('should have an enabled Confirm button', function () {
                modalUtils.expectModalConfirmButtonWithState({text: 'Confirm', disabled: false})
              })
            }

            if (closeOnConfirm) {
              it('should invoke `onClose`', function () {
                expect(props.onClose).to.have.callCount(1)
              })
            } else {
              it('should not invoke `onClose`', function () {
                expect(props.onClose).to.have.callCount(0)
              })
            }
          })
        })

        // When the onConfirm promise is rejected, the error bubbles
        describe('when the onConfirm promise rejects', function () {
          beforeEach(function () {
            resolver.reject('failure!')
            return wait()
          })

          it('should log an error', function () {
            expect(modalDeps.Logger.log).to.have.been.calledWith('failure!')
          })

          if (disableConfirmUntilOnConfirmResolves) {
            it('should have an enabled Confirm button', function () {
              modalUtils.expectModalConfirmButtonWithState({text: 'Confirm', disabled: false})
            })
          }

          it('should not invoke `onClose`', function () {
            expect(props.onClose).to.have.callCount(0)
          })
        })
      })
    }

    itShouldBePromiseAware('when disableConfirmUntilOnConfirmResolves is true (default)', {
      closeOnConfirm: true,
      disableConfirmUntilOnConfirmResolves: true
    })

    itShouldBePromiseAware('when disableConfirmUntilOnConfirmResolves is false', {
      closeOnConfirm: true,
      disableConfirmUntilOnConfirmResolves: false
    })

    itShouldBePromiseAware('when disableConfirmUntilOnConfirmResolves is true (default)', {
      closeOnConfirm: false,
      disableConfirmUntilOnConfirmResolves: true
    })

    itShouldBePromiseAware('when disableConfirmUntilOnConfirmResolves is false', {
      closeOnConfirm: false,
      disableConfirmUntilOnConfirmResolves: false
    })
  })

  describe('when onConfirm does not return a promise', function () {
    beforeEach(function () {
      props.onConfirm.returns(42)
    })

    it('should not override confirm state', function () {
      modalUtils.expectModalConfirmButtonWithState({text: 'Confirm', disabled: false})
    })
  })

  describe('when subtitle present', function () {
    beforeEach(function () {
      this.set('subtitle', 'Foo bar')
      return wait()
    })

    it('should render subtitle', function () {
      const $subtitle = this.$('.frost-modal-dialog-header-subtitle')
      expect($subtitle).to.have.length(1)
      expect($subtitle.text()).to.equal('Foo bar')
    })
  })

  describe('when subtitle not present', function () {
    beforeEach(function () {
      this.set('subtitle', undefined)
      return wait()
    })

    it('should not render subtitle DOM', function () {
      expect(this.$('.frost-modal-dialog-header-subtitle')).to.have.length(0)
    })
  })

  describe('when footer text present', function () {
    beforeEach(function () {
      this.set('footer', 'Foo bar')
      return wait()
    })

    it('should render footer text', function () {
      const $footer = this.$('.frost-modal-dialog-footer-content')
      expect($footer).to.have.length(1)
      expect($footer.text().trim()).to.equal('Foo bar')
    })
  })

  describe('when footer text not present', function () {
    beforeEach(function () {
      this.set('footer', undefined)
      return wait()
    })

    it('should not render footer text DOM', function () {
      expect(this.$('.frost-modal-dialog-footer-content')).to.have.length(0)
    })
  })

  describe('when buttons present', function () {
    beforeEach(function () {
      this.set('buttons', [
        {
          priority: 'secondary',
          text: 'Foo'
        },
        {
          priority: 'secondary',
          text: 'Bar'
        }
      ])

      return wait()
    })

    it('should render custom buttons plus cancel and create buttons', function () {
      expect(this.$('.frost-modal-dialog-footer button')).to.have.length(4)
    })

    it('should have first button with tabIndex of 0', function () {
      expect($hook('form-dialog-modal-button-0').prop('tabindex')).to.equal(0)
    })

    it('should have second button with tabIndex of 0', function () {
      expect($hook('form-dialog-modal-button-1').prop('tabindex')).to.equal(0)
    })
  })

  describe('when buttons are given tabIndex', function () {
    beforeEach(function () {
      this.set('buttons', [
        {
          priority: 'secondary',
          tabIndex: 2,
          text: 'Foo'
        },
        {
          priority: 'secondary',
          tabIndex: 1,
          text: 'Bar'
        }
      ])

      return wait()
    })

    it('should have first button with tabIndex === 2', function () {
      expect($hook('form-dialog-modal-button-0').prop('tabindex')).to.equal(2)
    })

    it('should have second button with tabIndex === 1', function () {
      expect($hook('form-dialog-modal-button-1').prop('tabindex')).to.equal(1)
    })
  })

  describe('when buttons not present', function () {
    beforeEach(function () {
      this.set('buttons', undefined)
      return wait()
    })

    it('should only render cancel and create buttons', function () {
      expect(this.$('.frost-modal-dialog-footer button')).to.have.length(2)
    })
  })
})
