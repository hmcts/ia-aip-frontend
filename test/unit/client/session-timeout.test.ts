import axios from 'axios';
import config from 'config';
import moment from 'moment';
import { paths } from '../../../app/paths';
import SessionTimeout from '../../../client/session-timeout';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Session Timeout @only', () => {
  let sandbox: sinon.SinonSandbox;
  let sessionTimeout: SessionTimeout;
  let extendSessionStub: sinon.SinonStub;
  let addListenersStub: sinon.SinonStub;
  let removeListenersStub: sinon.SinonStub;
  let stopCountersStub: sinon.SinonStub;
  let startCounterStub: sinon.SinonStub;
  let resetModalMessageStub: sinon.SinonStub;
  let signOutStub: sinon.SinonStub;
  let openModalStub: sinon.SinonStub;
  let startModalCountdownStub: sinon.SinonStub;
  let axiosStub: sinon.SinonStub;
  let restartCountersStub: sinon.SinonStub;
  let closeModalStub: sinon.SinonStub;
  let clock: sinon.SinonFakeTimers;
  let modalElement: HTMLElement;
  let modalOverlayElement: HTMLElement;
  let modalCountdownElement: HTMLElement;
  let focusableElements: NodeListOf<Element>;
  let firstFocusableElement: HTMLElement;
  let lastFocusableElement: HTMLElement;
  let bodyElement: HTMLElement;

  before(() => {
    document.body.innerHTML =
    `<div class="timeout-modal" id="timeout-modal">
      <p id="modal-countdown">the countdown</p>
      <button id="extend-session">Extend</button>
    </div>
    <div class="modal-overlay" id="modal-overlay" tabindex="-1" aria-hidden="true"></div>`;
    modalElement = document.querySelector('#timeout-modal');
    modalOverlayElement = document.querySelector('#modal-overlay');
    modalCountdownElement = document.querySelector('#modal-countdown');
    focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusableElement = focusableElements[0] as HTMLElement;
    lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    bodyElement = document.querySelector('body');
    sessionTimeout = new SessionTimeout();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('init', () => {
    it('should call addListeners and extend session', () => {
      addListenersStub = sandbox.stub(sessionTimeout, 'addListeners');
      extendSessionStub = sandbox.stub(sessionTimeout, 'extendSession');
      sessionTimeout.init();
      expect(addListenersStub).to.have.been.called.calledOnce;
      expect(extendSessionStub).to.have.been.called;
    });
  });

  describe('addListeners', () => {
    it('should add click listener and call extendSession when click on button', () => {
      extendSessionStub = sandbox.stub(sessionTimeout, 'extendSession');
      let extendButton = document.querySelector('#extend-session');
      sessionTimeout.addListeners();
      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20
      });
      extendButton.dispatchEvent(evt);
      expect(extendSessionStub).to.have.been.called.calledOnce;
    });
  });

  describe('removeListeners', () => {
    it('should remove click listener and dont call extendSession when click on button', () => {
      extendSessionStub = sandbox.stub(sessionTimeout, 'extendSession');
      let extendButton = document.querySelector('#extend-session');
      sessionTimeout.removeListeners();
      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20
      });
      extendButton.dispatchEvent(evt);
      expect(extendSessionStub).not.to.have.been.called.calledOnce;
    });
  });

  describe('stop/start/restartCounters', () => {
    it('should stop counters', () => {
      sinon.spy(clock, 'clearTimeout');
      sinon.spy(clock, 'clearInterval');
      sessionTimeout.stopCounters();

      expect(clock.clearTimeout).to.have.been.calledTwice;
      expect(clock.clearInterval).to.have.been.calledOnce;
    });

    it('should restart counters', () => {
      stopCountersStub = sandbox.stub(sessionTimeout, 'stopCounters');
      startCounterStub = sandbox.stub(sessionTimeout, 'startCounter');
      resetModalMessageStub = sandbox.stub(sessionTimeout, 'resetModalMessage');
      sessionTimeout.restartCounters();

      expect(stopCountersStub).to.have.been.calledOnce;
      expect(startCounterStub).to.have.been.calledOnce;
      expect(resetModalMessageStub).to.have.been.calledOnce;
    });

    it('should startCounter countdown and call relevant functions', () => {
      sessionTimeout.sessionExpirationTime = moment().add(config.get('session.cookie.maxAgeInMs'), 'milliseconds').format();
      signOutStub = sandbox.stub(sessionTimeout, 'signOut');
      openModalStub = sandbox.stub(sessionTimeout, 'openModal');
      startModalCountdownStub = sandbox.stub(sessionTimeout, 'startModalCountdown');
      sessionTimeout.startCounter();
      clock.tick((sessionTimeout.sessionTimeoutCountdown - sessionTimeout.bufferSessionExtension) + 1);
      expect(openModalStub).to.have.been.calledOnce;
      expect(startModalCountdownStub).to.have.been.calledOnce;

      clock.tick(sessionTimeout.sessionTimeoutCountdown + 1);
      expect(signOutStub).to.have.been.calledOnce;
    });
  });

  describe('resetModalMessage', () => {
    it('should restart modal content to the initial description', () => {
      sessionTimeout.resetModalMessage();

      expect(modalCountdownElement.innerHTML).to.be.equal(i18n.components.timeoutModal.initialDescription);
    });
  });

  describe('startModalCountdown', () => {
    it('should update modal description', () => {
      sessionTimeout.startModalCountdown();
      clock.tick(2001);

      expect(modalCountdownElement.innerHTML).to.be.equal(`${i18n.components.timeoutModal.description[0]} 1:59 ${i18n.components.timeoutModal.description[1]}`);
    });
  });

  describe('open/close modal', () => {
    it('should open modal', () => {
      const bodyEventListenerStub = sandbox.stub(document.querySelector('body'), 'addEventListener');
      const focusStub = sandbox.stub(firstFocusableElement, 'focus');
      const disableScrollStub = sandbox.stub(sessionTimeout, 'disableScroll');
      sessionTimeout.openModal();
      const modalAriaHiddenAttr = modalElement.getAttribute('aria-hidden');
      const overlayAriaHiddenAttr = modalOverlayElement.getAttribute('aria-hidden');

      expect(modalAriaHiddenAttr).to.equal(null);
      expect(overlayAriaHiddenAttr).to.equal(null);
      expect(focusStub).to.have.been.calledOnce;
      expect(disableScrollStub).to.have.been.calledOnce;
      expect(bodyEventListenerStub).to.have.been.calledOnce;
    });

    it('should close modal', () => {
      const removeEventListenerStub = sandbox.stub(document.querySelector('body'), 'removeEventListener');
      const enableScrollStub = sandbox.stub(sessionTimeout, 'enableScroll');
      sessionTimeout.closeModal();
      const ariaHiddenAttr = modalElement.getAttribute('aria-hidden');
      const overlayAriaHiddenAttr = modalOverlayElement.getAttribute('aria-hidden');

      expect(ariaHiddenAttr).to.equal('true');
      expect(overlayAriaHiddenAttr).to.equal('true');
      expect(removeEventListenerStub).to.have.been.called;
      expect(enableScrollStub).to.have.been.calledOnce;
    });
  });

  describe('extendSession', () => {
    it('should extend session and call restartCounters and closeModal', (done) => {
      const resolved = new Promise((r) => r({ data: { timeout: 1000 } }));
      axiosStub = sandbox.stub(axios, 'get').withArgs(paths.session.extendSession).returns(resolved);

      restartCountersStub = sandbox.stub(sessionTimeout, 'restartCounters');
      closeModalStub = sandbox.stub(sessionTimeout, 'closeModal');
      removeListenersStub = sandbox.stub(sessionTimeout, 'removeListeners');
      stopCountersStub = sandbox.stub(sessionTimeout, 'stopCounters');

      sessionTimeout.extendSession().then(() => {
        expect(sessionTimeout.sessionExpirationTime).to.be.equal(1000);
        expect(restartCountersStub).to.have.been.calledOnce;
      }).then(done, done);
    });

    it('should not extend session and call removeListeners and stopCounters', (done) => {
      const rejected = new Promise((_, r) => r());
      axiosStub = sandbox.stub(axios, 'get').withArgs(paths.session.extendSession).returns(rejected);

      restartCountersStub = sandbox.stub(sessionTimeout, 'restartCounters');
      closeModalStub = sandbox.stub(sessionTimeout, 'closeModal');
      removeListenersStub = sandbox.stub(sessionTimeout, 'removeListeners');
      stopCountersStub = sandbox.stub(sessionTimeout, 'stopCounters');

      sessionTimeout.extendSession().catch(() => {
        expect(removeListenersStub).to.have.been.calledOnce;
        expect(stopCountersStub).to.have.been.calledOnce;
      }).then(done, done);
    });
  });

  describe('keyDownListener', () => {
    it('should focus on first modal focusable element if modal does not contain activeElement', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab'
      });
      const preventDefaultStub = sandbox.stub(event, 'preventDefault');
      const focusStub = sandbox.stub(firstFocusableElement, 'focus');
      sessionTimeout.keyDownEventListener(event);
      expect(preventDefaultStub).to.have.been.calledOnce;
      expect(focusStub).to.have.been.calledOnce;
    });

    it('should focus on firstFocusableElement if there is only 1 focusable element on modal', () => {
      firstFocusableElement.focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab'
      });
      const preventDefaultStub = sandbox.stub(event, 'preventDefault');
      const focusStub = sandbox.stub(firstFocusableElement, 'focus');
      sessionTimeout.keyDownEventListener(event);
      expect(preventDefaultStub).to.have.been.calledOnce;
      expect(focusStub).to.have.been.calledOnce;
    });

    it('should focus on firstFocusableElement if Tabbing while focus in lastFocusableElement', () => {
      modalElement.append('<button id="cancel">Cancel</button>');
      firstFocusableElement.focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab'
      });
      lastFocusableElement.focus();

      const preventDefaultStub = sandbox.stub(event, 'preventDefault');
      const firstFocusableElementFocusStub = sandbox.stub(firstFocusableElement, 'focus');
      sessionTimeout.keyDownEventListener(event);
      expect(preventDefaultStub).to.have.been.calledOnce;
      expect(firstFocusableElementFocusStub).to.have.been.calledOnce;
    });

    it('should focus on lastFocusableElement if Shift+Tabbing while focus in firstFocusableElement', () => {
      modalElement.append('<button id="cancel">Cancel</button>');
      firstFocusableElement.focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true
      });
      firstFocusableElement.focus();

      const preventDefaultStub = sandbox.stub(event, 'preventDefault');
      const lastFocusableElementFocusStub = sandbox.stub(lastFocusableElement, 'focus');
      sessionTimeout.keyDownEventListener(event);
      expect(preventDefaultStub).to.have.been.calledOnce;
      expect(lastFocusableElementFocusStub).to.have.been.calledOnce;
    });
  });

  describe('Enable/Disable body scroll', () => {
    it('should disable scroll', () => {
      sessionTimeout.disableScroll();
      expect(bodyElement.style.getPropertyValue('overflow')).to.be.equal('hidden');
      expect(bodyElement.style.getPropertyValue('position')).to.be.equal('fixed');
      expect(bodyElement.style.getPropertyValue('width')).to.be.equal('100%');
    });

    it('should enable scroll', () => {
      const windowScrollToStub = sandbox.stub(window, 'scrollTo');
      sessionTimeout.enableScroll();
      expect(bodyElement.style.getPropertyValue('overflow')).to.be.equal('');
      expect(bodyElement.style.getPropertyValue('position')).to.be.equal('');
      expect(bodyElement.style.getPropertyValue('width')).to.be.equal('');

      expect(windowScrollToStub).to.have.been.calledOnce;
    });
  });
});
