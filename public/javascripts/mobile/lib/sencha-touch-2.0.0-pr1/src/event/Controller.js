Ext.define('Ext.event.Controller', {

    isFiring: false,

    listenerStack: null,

    constructor: function(info) {
        this.firingListeners = [];
        this.firingArguments = [];

        this.setInfo(info);

        return this;
    },

    setInfo: function(info) {
        this.info = info;
    },

    getInfo: function() {
        return this.info;
    },

    setListenerStack: function(listenerStack) {
        this.listenerStack = listenerStack;
    },

    fire: function(args, actions) {
        var listenerStack = this.listenerStack,
            firingListeners = this.firingListeners,
            firingArguments = this.firingArguments,
            push = firingListeners.push,
            beforeActions = [],
            afterActions = [],
            listeners, beforeListeners, currentListeners, afterListeners,
            i, ln, action, actionListener, fn;

        if (listenerStack) {
            listeners = listenerStack.listeners;
            beforeListeners = listeners.before;
            currentListeners = listeners.current;
            afterListeners = listeners.after;
        }

        if (!args) {
            args = [];
        }

        if (actions) {
            for (i = 0,ln = actions.length; i < ln; i++) {
                action = actions[i];
                fn = action.fn;

                actionListener = {
                    fn: fn,
                    scope: action.scope,
                    options: action.options || {},
                    isLateBinding: typeof fn == 'string'
                };

                if (action.order === 'before') {
                    beforeActions.push(actionListener);
                }
                else {
                    afterActions.push(actionListener);
                }
            }
        }

        firingListeners.length = 0;

        if (beforeListeners && beforeListeners.length > 0) {
            push.apply(firingListeners, listeners.before);
        }

        if (beforeActions.length > 0) {
            push.apply(firingListeners, beforeActions);
        }

        if (currentListeners && currentListeners.length > 0) {
            push.apply(firingListeners, listeners.current);
        }

        if (afterActions.length > 0) {
            push.apply(firingListeners, afterActions);
        }

        if (afterListeners && afterListeners.length > 0) {
            push.apply(firingListeners, listeners.after);
        }

        if (firingListeners.length < 1) {
            return this;
        }

        firingArguments.length = 0;
        firingArguments.push.apply(firingArguments, args);

        // Backwards compatibility
        firingArguments.push(null, this);

        this.doFire();

        return this;
    },

    doFire: function() {
        var listenerStack = this.listenerStack,
            firingListeners = this.firingListeners,
            firingArguments = this.firingArguments,
            optionsArgumentIndex = firingArguments.length - 2,
            i, ln, listener, options, fn, firingFn,
            boundFn, isLateBinding, scope, args, result;

        this.isPausing = false;
        this.isPaused = false;
        this.isStopped = false;
        this.isFiring = true;

        for (i = 0, ln = firingListeners.length; i < ln; i++) {
            listener = firingListeners[i];
            options = listener.options;
            fn = listener.fn;
            firingFn = listener.firingFn;
            boundFn = listener.boundFn;
            isLateBinding = listener.isLateBinding;
            scope = listener.scope;

            // Re-bind the callback if it has changed since the last time it's bound (overridden)
            if (isLateBinding && boundFn && boundFn !== scope[fn]) {
                boundFn = false;
                firingFn = false;
            }

            if (!boundFn) {
                if (isLateBinding) {
                    boundFn = scope[fn];

                    if (!boundFn) {
                        continue;
                    }
                }
                else {
                    boundFn = fn;
                }

                listener.boundFn = boundFn;
            }

            if (!firingFn) {
                firingFn = boundFn;

                if (options.buffer) {
                    firingFn = Ext.Function.createBuffered(firingFn, options.buffer, scope);
                }

                if (options.delay) {
                    firingFn = Ext.Function.createDelayed(firingFn, options.delay, scope);
                }

                listener.firingFn = firingFn;
            }

            firingArguments[optionsArgumentIndex] = options;

            args = firingArguments;

            if (options.args) {
                args = options.args.concat(args);
            }

            if (options.single === true && listenerStack) {
                listenerStack.remove(fn, scope, listener.order);
            }

            result = firingFn.apply(scope, args);

            if (result === false) {
                this.stop();
            }

            if (this.isStopped) {
                break;
            }
            else if (result && result instanceof Array) {
                firingArguments = this.firingArguments = result.concat([null, this]);
            }

            if (this.isPausing) {
                this.isPaused = true;
                firingListeners.splice(0, i + 1);
                return;
            }
        }

        this.isFiring = false;
        this.listenerStack = null;
        firingListeners.length = 0;
        firingArguments.length = 0;
        this.connectingController = null;
    },

    connect: function(controller) {
        this.connectingController = controller;
    },

    resume: function() {
        var connectingController = this.connectingController;

        this.isPausing = false;

        if (this.isPaused && this.firingListeners.length > 0) {
            this.isPaused = false;
            this.doFire();
        }

        if (connectingController) {
            connectingController.resume();
        }

        return this;
    },

    isInterrupted: function() {
        return this.isStopped || this.isPaused;
    },

    stop: function() {
        var connectingController = this.connectingController;

        this.isStopped = true;

        if (connectingController) {
            this.connectingController = null;
            connectingController.stop();
        }

        this.isFiring = false;

        this.listenerStack = null;

        return this;
    },

    pause: function() {
        var connectingController = this.connectingController;

        this.isPausing = true;

        if (connectingController) {
            connectingController.pause();
        }

        return this;
    }
});
