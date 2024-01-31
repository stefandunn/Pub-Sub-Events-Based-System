(() => {
  class ElementArtifact {
    element = document;

    constructor(element = document) {
      this.element = element;
    }
  }

  class Emitter extends ElementArtifact {
    send(eventName, data) {
      const { bubbles, cancelable, composed, ...eventData } = data || {};
      let event;
      if (eventData) {
        event = new CustomEvent(eventName, {
          detail: eventData,
          bubbles,
          cancelable,
          composed,
        });
      } else {
        event = new Event(eventName, { bubbles, cancelable, composed });
      }

      this.element.dispatchEvent(event);
    }
  }

  class Listener extends ElementArtifact {
    handlers = [];
    listenerSetup = false;
    eventName;

    constructor(element, eventName) {
      super(element);
      this.eventName = eventName;
      this.runThroughHandlers = this.runThroughHandlers.bind(this);
    }

    cleanupHandlers() {
      this.handlers = this.handlers.filter((handler) => {
        if (typeof handler.times === "number") {
          return handler.times > handler.runCount;
        }
        return true;
      });
    }

    runThroughHandlers(e) {
      this.handlers.forEach((handler, index) => {
        handler.callback(e);
        this.handlers[index].runCount++;
      });

      this.cleanupHandlers();
    }

    setupListener() {
      this.element.addEventListener(this.eventName, this.runThroughHandlers);
      this.listenerSetup = true;
    }

    addCallback(callback, times) {
      this.handlers.push({ callback, times, runCount: 0 });
      if (!this.listenerSetup) {
        this.setupListener();
      }
    }

    removeCallback(callback) {
      this.handlers = this.handlers.filter(
        (handler) => handler.callback !== callback
      );
    }

    removeAllCallbacks() {
      this.handlers = [];
    }
  }

  class PubSub extends ElementArtifact {
    listeners = {};
    attached = [];

    constructor(element) {
      super(element);
      this.getListener = this.getListener.bind(this);
      this.listen = this.listen.bind(this);
      this.listenOnce = this.listenOnce.bind(this);
      this.listenTimes = this.listenTimes.bind(this);
      this.attach = this.attach.bind(this);
      this.emit = this.emit.bind(this);
    }

    emit(eventName, data) {
      return new Emitter(this.element).send(eventName, data);
    }

    getListener(eventName) {
      if (!this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName] = new Listener(this.element, eventName);
      }
      return this.listeners[eventName];
    }

    listen(eventName, callback) {
      if (Array.isArray(eventName)) {
        eventName.forEach((evName) => {
          this.listen(evName, callback);
        });
      } else {
        this.getListener(eventName).addCallback(callback);
      }
    }

    listenTimes(eventName, times, callback) {
      if (Array.isArray(eventName)) {
        eventName.forEach((evName) => {
          this.listenTimes(evName, times, callback);
        });
      } else {
        this.getListener(eventName).addCallback(callback, times);
      }
    }

    listenOnce(eventName, callback) {
      if (Array.isArray(eventName)) {
        eventName.forEach((evName) => {
          this.listenOnce(evName, callback);
        });
      } else {
        this.listenTimes(eventName, 1, callback);
      }
    }

    unlisten(eventName, callback) {
      if (Array.isArray(eventName)) {
        eventName.forEach((evName) => {
          this.unlisten(evName, callback);
        });
      } else {
        const listener = this.getListener(eventName);
        if (typeof callback === "function") {
          listener.removeCallback(callback);
        }
        if (typeof callback === "undefined") {
          listener.removeAllCallbacks();
        }
      }
    }

    attach(element) {
      const attachedPubSub = this.attached.find((pubsubber) =>
        pubsubber.element.isSameNode(element)
      );
      if (!attachedPubSub) {
        const newPubSubber = new PubSub(element);
        this.attached.push(newPubSubber);
        return newPubSubber;
      }
      return attachedPubSub;
    }
  }

  window.pubsub = new PubSub();

  function dispatchReady() {
    const readyEv = new Event("pubsub:ready");
    document.dispatchEvent(readyEv);
  }

  document.addEventListener("DOMContentLoaded", dispatchReady);
})();
