var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState2(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef3(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect3(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback2(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback2;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect3;
        exports.useId = useId;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo;
        exports.useReducer = useReducer;
        exports.useRef = useRef3;
        exports.useState = useState2;
        exports.useSyncExternalStore = useSyncExternalStore;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// src/games/arcade/billiards-club/index.jsx
var import_react2 = __toESM(require_react(), 1);

// src/utils/useGameRuntimeBridge.js
var import_react = __toESM(require_react(), 1);
var toSafeNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, numeric);
};
function useGameRuntimeBridge(state, buildTextPayload, advanceTimeHandler) {
  const stateRef = (0, import_react.useRef)(state);
  const payloadBuilderRef = (0, import_react.useRef)(buildTextPayload);
  const advanceTimeRef = (0, import_react.useRef)(advanceTimeHandler);
  (0, import_react.useEffect)(() => {
    stateRef.current = state;
  }, [state]);
  (0, import_react.useEffect)(() => {
    payloadBuilderRef.current = buildTextPayload;
  }, [buildTextPayload]);
  (0, import_react.useEffect)(() => {
    advanceTimeRef.current = advanceTimeHandler;
  }, [advanceTimeHandler]);
  (0, import_react.useEffect)(() => {
    const renderState = () => {
      try {
        return JSON.stringify(payloadBuilderRef.current(stateRef.current));
      } catch (error) {
        return JSON.stringify({
          mode: "error",
          message: "render_state_failed"
        });
      }
    };
    const advanceTime = (ms = 0) => {
      const safeMs = toSafeNumber(ms);
      const handler = advanceTimeRef.current;
      if (typeof handler === "function") {
        return handler(safeMs);
      }
      return void 0;
    };
    window.render_game_to_text = renderState;
    window.advanceTime = advanceTime;
    return () => {
      if (window.render_game_to_text === renderState) {
        window.render_game_to_text = void 0;
      }
      if (window.advanceTime === advanceTime) {
        window.advanceTime = void 0;
      }
    };
  }, []);
}

// src/games/arcade/billiards-club/index.jsx
var TABLE_WIDTH = 960;
var TABLE_HEIGHT = 540;
var PLAY_LEFT = 86;
var PLAY_TOP = 82;
var PLAY_RIGHT = TABLE_WIDTH - 86;
var PLAY_BOTTOM = TABLE_HEIGHT - 82;
var TABLE_CENTER_X = (PLAY_LEFT + PLAY_RIGHT) / 2;
var TABLE_CENTER_Y = (PLAY_TOP + PLAY_BOTTOM) / 2;
var HEAD_STRING_X = PLAY_LEFT + (PLAY_RIGHT - PLAY_LEFT) * 0.24;
var FOOT_SPOT_X = PLAY_LEFT + (PLAY_RIGHT - PLAY_LEFT) * 0.74;
var BALL_RADIUS = 11.2;
var BALL_DIAMETER = BALL_RADIUS * 2;
var CORNER_POCKET_RADIUS = 26;
var SIDE_POCKET_RADIUS = 23;
var FIXED_DT = 1 / 120;
var MAX_FRAME_MS = 50;
var ROLL_DECEL = 138;
var STOP_SPEED = 5;
var RESTITUTION = 0.985;
var AI_ACTION_SLOWDOWN = 5.2;
var AIM_STEP = Math.PI / 180 * 1.6;
var POWER_STEP = 0.05;
var PLACE_NUDGE_STEP = 9;
var PLACE_NUDGE_FINE_STEP = 4;
var MAX_LOG_ITEMS = 6;
var PLAYER_HUMAN = 0;
var PLAYER_AI = 1;
var MODE_PRESETS = {
  "eight-ball": {
    label: { es: "Bola 8", en: "8-Ball" },
    summary: {
      es: "Mesa abierta, lisas/rayas y cierre cantando la 8.",
      en: "Open table, solids/stripes assignment, and a called 8-ball finish."
    }
  },
  "nine-ball": {
    label: { es: "Bola 9", en: "9-Ball" },
    summary: {
      es: "Orden numerico, blanca en mano y regla de tres faltas.",
      en: "Numerical order, cue-ball in hand fouls, and the three-foul rule."
    }
  },
  "ten-ball": {
    label: { es: "Bola 10", en: "10-Ball" },
    summary: {
      es: "Tiro cantado, push out y reposicion de la 10.",
      en: "Called-shot discipline, push out, and legal 10-ball spotting."
    }
  },
  "carom-libre": {
    label: { es: "Carambola Libre", en: "Free Carom" },
    summary: {
      es: "Mesa sin troneras con 3 bolas: puntua al contactar las dos bolas objetivas en un mismo tiro.",
      en: "Pocketless 3-ball table: score by contacting both object balls in a single shot."
    }
  },
  kelly: {
    label: { es: "Kelly", en: "Kelly" },
    summary: {
      es: "Modalidad recreativa multi-jugador: cada jugador tiene bola objetivo propia y gana quien emboca la suya.",
      en: "Recreational multiplayer variant: each player has a personal target ball and wins by pocketing it."
    }
  }
};
var DIFFICULTY_PRESETS = {
  casual: {
    label: { es: "Recreativo", en: "Casual" },
    aimNoise: 0.11,
    powerNoise: 0.16,
    pickSpread: 5,
    thinkMs: 760,
    placeStepX: 92,
    placeStepY: 84,
    allowBankShots: false,
    bankShotWeight: 210,
    pushOutScoreThreshold: 760,
    safetyRiskThreshold: 980,
    safetyChanceOnRisk: 0.24,
    safetyChanceOnContact: 0.36,
    keyBallBonus: 12,
    powerDistanceWeight: 0.16,
    placementBias: 0.14
  },
  club: {
    label: { es: "Club", en: "Club" },
    aimNoise: 0.045,
    powerNoise: 0.09,
    pickSpread: 2,
    thinkMs: 560,
    placeStepX: 74,
    placeStepY: 66,
    allowBankShots: true,
    bankShotWeight: 116,
    pushOutScoreThreshold: 860,
    safetyRiskThreshold: 900,
    safetyChanceOnRisk: 0.2,
    safetyChanceOnContact: 0.26,
    keyBallBonus: 22,
    powerDistanceWeight: 0.26,
    placementBias: 0.1
  },
  pro: {
    label: { es: "Pro", en: "Pro" },
    aimNoise: 0.013,
    powerNoise: 0.035,
    pickSpread: 1,
    thinkMs: 460,
    placeStepX: 56,
    placeStepY: 52,
    allowBankShots: true,
    bankShotWeight: 56,
    pushOutScoreThreshold: 935,
    safetyRiskThreshold: 840,
    safetyChanceOnRisk: 0.16,
    safetyChanceOnContact: 0.18,
    keyBallBonus: 36,
    powerDistanceWeight: 0.38,
    placementBias: 0.06
  }
};
var AI_ACTION_LABELS = {
  idle: "IA en espera.",
  scan: "IA analizando mesa y rutas posibles.",
  autoPlace: "IA autocolocando blanca en mano.",
  setPocket: "IA cantando tronera objetivo.",
  adjustAim: "IA ajustando angulo de tiro.",
  adjustPower: "IA calibrando potencia.",
  pushOut: "IA preparando push out.",
  safety: "IA preparando safety tactico.",
  shoot: "IA ejecutando tiro."
};
var BALL_COLORS = {
  1: "#facc15",
  2: "#2563eb",
  3: "#ef4444",
  4: "#7c3aed",
  5: "#f97316",
  6: "#16a34a",
  7: "#881337",
  8: "#111827",
  9: "#facc15",
  10: "#2563eb",
  11: "#ef4444",
  12: "#7c3aed",
  13: "#f97316",
  14: "#16a34a",
  15: "#881337"
};
var POCKETS = [
  { id: "tl", label: { es: "Sup. izq.", en: "Top left" }, x: PLAY_LEFT - 10, y: PLAY_TOP - 10, radius: CORNER_POCKET_RADIUS },
  { id: "tm", label: { es: "Sup. centro", en: "Top center" }, x: TABLE_CENTER_X, y: PLAY_TOP - 6, radius: SIDE_POCKET_RADIUS },
  { id: "tr", label: { es: "Sup. dcha.", en: "Top right" }, x: PLAY_RIGHT + 10, y: PLAY_TOP - 10, radius: CORNER_POCKET_RADIUS },
  { id: "bl", label: { es: "Inf. izq.", en: "Bottom left" }, x: PLAY_LEFT - 10, y: PLAY_BOTTOM + 10, radius: CORNER_POCKET_RADIUS },
  { id: "bm", label: { es: "Inf. centro", en: "Bottom center" }, x: TABLE_CENTER_X, y: PLAY_BOTTOM + 6, radius: SIDE_POCKET_RADIUS },
  { id: "br", label: { es: "Inf. dcha.", en: "Bottom right" }, x: PLAY_RIGHT + 10, y: PLAY_BOTTOM + 10, radius: CORNER_POCKET_RADIUS }
];
var UI_COPY = {
  es: {
    title: "Billar Pool Club",
    subtitle: "Pool arcade-profesional con fisica top-down, modos Bola 8/Bola 9/Bola 10, push out, safety y IA tactica.",
    start: "Empezar",
    nextRack: "Siguiente rack",
    restartRack: "Repetir rack",
    newMatch: "Nuevo match",
    fullscreen: "Pantalla completa",
    orientationHorizontal: "Mesa horizontal",
    orientationVertical: "Mesa vertical",
    gameMode: "Modo de juego",
    aiMode: "Modo IA",
    participants: "Participantes",
    modeGoal: "Objetivo del modo:",
    leader: "Lider",
    pointsUnit: "puntos",
    winsUnit: "victorias",
    onTable: "en mesa",
    pocketed: "embocada",
    turn: "Turno",
    mode: "Modo",
    raceTo: "Objetivo: al mejor de",
    tableOpen: "Mesa abierta",
    ballInHand: "Blanca en mano",
    pushOutAvailable: "Push out disponible",
    safetyActive: "Safety activo",
    openTableButton: "Abrir mesa",
    rackClosedTitle: "Rack cerrado",
    prepareNextRack: "Preparar siguiente rack",
    matchFinishedTitle: "Match finalizado",
    backToMenu: "Volver al menu",
    scoreboard: "Marcador",
    group: "Grupo",
    remaining: "Restantes",
    targetBall: "Bola objetivo",
    foulsInRow: "Faltas seguidas",
    telemetry: "Telemetria",
    legalTarget: "Objetivo legal",
    power: "Potencia",
    angle: "Angulo",
    lowestBall: "Bola mas baja",
    pushOut: "Push out",
    yes: "si",
    no: "no",
    declared: "declarado",
    calledPocket: "Tronera cantada",
    aiConsole: "Cabina IA",
    analyzing: "analizando",
    standby: "standby",
    aiLedGroup: "Indicadores LED de acciones IA",
    aiTurn: "Turno IA",
    autoPlace: "Auto colocar",
    pocket: "Tronera",
    aimAdjust: "Ajuste angulo",
    powerAdjust: "Ajuste potencia",
    shoot: "Tirar",
    plan: "Plan",
    planPot: "tronera directa",
    planKick: "trayectoria alternativa",
    planContact: "contacto",
    ball: "bola",
    decision: "Decision",
    choosePocket: "Elige tronera",
    callShot: "Cantar tiro",
    callEight: "Cantar la 8",
    aimMinus: "Aim -",
    aimPlus: "Aim +",
    powerMinus: "- Potencia",
    powerPlus: "+ Potencia",
    safety: "Safety",
    shootButton: "Tirar",
    optionalMouseAim: "Raton opcional para apuntar.",
    help1: "A/D ajustan el taco en fase de apuntado.",
    help2: "W/S regulan potencia.",
    help3: "En blanca en mano: flechas o WASD mueven la bola.",
    help4: "Enter/Space fijan la blanca (Shift = ajuste fino).",
    help5: "O push out, V safety.",
    help6: "1/2 resuelven decisiones.",
    help7: "Space tira.",
    mobileHintPlace: "Pad tactil: mueve la blanca en mano en cuatro direcciones.",
    mobileHintAim: "Pad tactil: izquierda/derecha apuntan, arriba/abajo ajustan potencia.",
    mobileControlsAria: "Controles tactiles de billar",
    up: "Arriba",
    left: "Izquierda",
    right: "Derecha",
    down: "Abajo",
    placeCueBall: "Fijar blanca",
    autoCueBall: "Auto blanca",
    speedToUnderstand: "Rompe, gestiona faltas, usa push out/safety cuando toque y gana un duelo al mejor de",
    racksUnit: "racks",
    racks: "racks."
  },
  en: {
    title: "Pool Club Billiards",
    subtitle: "Arcade-professional top-down pool with 8-ball/9-ball/10-ball rules, push out, safety, and tactical AI.",
    start: "Start",
    nextRack: "Next rack",
    restartRack: "Replay rack",
    newMatch: "New match",
    fullscreen: "Fullscreen",
    orientationHorizontal: "Horizontal table",
    orientationVertical: "Vertical table",
    gameMode: "Game mode",
    aiMode: "AI mode",
    participants: "Players",
    modeGoal: "Mode objective:",
    leader: "Leader",
    pointsUnit: "points",
    winsUnit: "wins",
    onTable: "on table",
    pocketed: "pocketed",
    turn: "Turn",
    mode: "Mode",
    raceTo: "Target: race to",
    tableOpen: "Open table",
    ballInHand: "Cue ball in hand",
    pushOutAvailable: "Push out available",
    safetyActive: "Safety active",
    openTableButton: "Open table",
    rackClosedTitle: "Rack over",
    prepareNextRack: "Prepare next rack",
    matchFinishedTitle: "Match over",
    backToMenu: "Back to menu",
    scoreboard: "Scoreboard",
    group: "Group",
    remaining: "Remaining",
    targetBall: "Target ball",
    foulsInRow: "Fouls in a row",
    telemetry: "Telemetry",
    legalTarget: "Legal target",
    power: "Power",
    angle: "Angle",
    lowestBall: "Lowest ball",
    pushOut: "Push out",
    yes: "yes",
    no: "no",
    declared: "declared",
    calledPocket: "Called pocket",
    aiConsole: "AI cockpit",
    analyzing: "analyzing",
    standby: "standby",
    aiLedGroup: "AI action LED indicators",
    aiTurn: "AI turn",
    autoPlace: "Auto place",
    pocket: "Pocket",
    aimAdjust: "Aim adjust",
    powerAdjust: "Power adjust",
    shoot: "Shoot",
    plan: "Plan",
    planPot: "direct pot",
    planKick: "alternative rail route",
    planContact: "contact shot",
    ball: "ball",
    decision: "Decision",
    choosePocket: "Choose pocket",
    callShot: "Call shot",
    callEight: "Call the 8",
    aimMinus: "Aim -",
    aimPlus: "Aim +",
    powerMinus: "- Power",
    powerPlus: "+ Power",
    safety: "Safety",
    shootButton: "Shoot",
    optionalMouseAim: "Mouse aiming is optional.",
    help1: "A/D fine-tune cue angle during aiming.",
    help2: "W/S adjust power.",
    help3: "With ball in hand: arrows or WASD move the cue ball.",
    help4: "Enter/Space confirms cue ball placement (Shift = fine nudge).",
    help5: "O for push out, V for safety.",
    help6: "1/2 resolve decision prompts.",
    help7: "Space shoots.",
    mobileHintPlace: "Touch pad: move the cue ball in hand in four directions.",
    mobileHintAim: "Touch pad: left/right aim, up/down adjust power.",
    mobileControlsAria: "Billiards touch controls",
    up: "Up",
    left: "Left",
    right: "Right",
    down: "Down",
    placeCueBall: "Lock cue ball",
    autoCueBall: "Auto place",
    speedToUnderstand: "Break, manage fouls, use push out/safety when needed, and win a duel race to",
    racksUnit: "racks",
    racks: "racks."
  }
};
var STATUS_LABELS = {
  menu: { es: "menu", en: "menu" },
  aim: { es: "apuntando", en: "aiming" },
  placing: { es: "colocando blanca", en: "placing cue ball" },
  moving: { es: "bolas en movimiento", en: "balls in motion" },
  "ai-thinking": { es: "IA pensando", en: "AI thinking" },
  decision: { es: "decision", en: "decision" },
  "rack-over": { es: "rack cerrado", en: "rack over" },
  "match-over": { es: "match finalizado", en: "match over" }
};
function resolveLocale() {
  if (typeof navigator === "undefined" || typeof navigator.language !== "string")
    return "en";
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}
function localizeLabel(label, locale) {
  if (typeof label === "string")
    return label;
  return label?.[locale] ?? label?.es ?? "";
}
function modeLabel(modeKey, locale) {
  return localizeLabel(MODE_PRESETS[modeKey]?.label, locale) || modeKey;
}
function modeSummary(modeKey, locale) {
  return localizeLabel(MODE_PRESETS[modeKey]?.summary, locale) || "";
}
function difficultyLabel(difficultyKey, locale) {
  return localizeLabel(DIFFICULTY_PRESETS[difficultyKey]?.label, locale) || difficultyKey;
}
function pocketLabel(pocketId, locale) {
  const pocket = POCKETS.find((entry) => entry.id === pocketId);
  if (!pocket)
    return null;
  return localizeLabel(pocket.label, locale) || pocketId;
}
function localizePlayerName(name, locale) {
  if (locale === "es" || !name)
    return name;
  let out = String(name);
  out = out.replace(/^Tu$/i, "You");
  out = out.replace(/^IA\s+/i, "AI ");
  out = out.replace(/\bRecreativo\b/g, "Casual");
  return out;
}
function statusLabel(status, locale) {
  return STATUS_LABELS[status]?.[locale] ?? status;
}
function modeHasPockets(modeKey) {
  return modeKey !== "carom-libre";
}
function isKellyMode(modeKey) {
  return modeKey === "kelly";
}
function isCaromMode(modeKey) {
  return modeKey === "carom-libre";
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
function normalizeAngle(angle) {
  let next = angle;
  while (next <= -Math.PI)
    next += Math.PI * 2;
  while (next > Math.PI)
    next -= Math.PI * 2;
  return next;
}
function lerpAngle(start, end, t) {
  const delta = normalizeAngle(end - start);
  return normalizeAngle(start + delta * clamp(t, 0, 1));
}
function scaleAiDuration(durationMs) {
  return Math.max(40, Math.round(durationMs * AI_ACTION_SLOWDOWN));
}
function createAiLedState(active = {}) {
  return {
    turn: Boolean(active.turn),
    autoPlace: Boolean(active.autoPlace),
    pocket: Boolean(active.pocket),
    aim: Boolean(active.aim),
    power: Boolean(active.power),
    pushOut: Boolean(active.pushOut),
    safety: Boolean(active.safety),
    shoot: Boolean(active.shoot)
  };
}
function ballGroupFromNumber(number) {
  if (number >= 1 && number <= 7)
    return "solids";
  if (number >= 9 && number <= 15)
    return "stripes";
  return null;
}
function groupLabel(group, locale = "es") {
  if (group === "solids")
    return locale === "es" ? "lisas" : "solids";
  if (group === "stripes")
    return locale === "es" ? "rayas" : "stripes";
  return locale === "es" ? "abierta" : "open table";
}
function localizeRuntimeText(text, locale) {
  if (locale === "es" || text == null)
    return text;
  let out = String(text);
  const replacements = [
    [/Configura la mesa y pulsa Empezar\./g, "Set up the table and press Start."],
    [/Push out no disponible en esta entrada\./g, "Push out is not available on this visit."],
    [/Elige una tronera para cantar (.+) antes de tirar\./g, "Choose a pocket to call $1 before shooting."],
    [/La 8 se recoloca tras el saque\./g, "The 8 is spotted again after the break."],
    [/Safety declarado para el proximo tiro\./g, "Safety declared for the next shot."],
    [/Safety cancelado\./g, "Safety cancelled."],
    [/Blanca colocada automaticamente\./g, "Cue ball auto-placed."],
    [/Blanca en mano fijada con teclado\./g, "Cue ball in hand locked from keyboard controls."],
    [/Blanca en mano colocada\./g, "Cue ball in hand placed."],
    [/Posicion invalida para la blanca\./g, "Invalid cue-ball position."],
    [/La IA no encontro tiro claro y cede la mesa\./g, "AI found no clear shot and gives up the table."],
    [/Scratch: la blanca cae en tronera\./g, "Scratch: the cue ball drops into a pocket."],
    [/Falta: bola objetiva fuera de la mesa\./g, "Foul: object ball left the table."],
    [/Falta: no hubo contacto con una bola objetiva\./g, "Foul: no contact with an object ball."],
    [/Falta: primero debias tocar la (\d+)\./g, "Foul: you had to hit the $1 first."],
    [/Falta: con mesa resuelta debes tocar primero la 8\./g, "Foul: with your group cleared, you must hit the 8 first."],
    [/Falta: con mesa abierta no puedes tocar primero la 8\./g, "Foul: on an open table you cannot hit the 8 first."],
    [/Falta: debias tocar primero una (lisas|rayas|abierta)\./g, "Foul: you had to hit a $1 ball first."],
    [/Falta: ninguna bola toco banda tras el contacto\./g, "Foul: no ball hit a rail after contact."],
    [/Saque ilegal: menos de cuatro bolas objetivas tocaron banda\./g, "Illegal break: fewer than four object balls reached a rail."],
    [/gana por tres faltas consecutivas\./g, "wins by three consecutive fouls."],
    [/queda avisado con dos faltas seguidas\./g, "is now on two fouls in a row."],
    [/decide tras push out\./g, "decides after push out."],
    [/acepta la mesa tras push out\./g, "accepts the table after push out."],
    [/devuelve el tiro a /g, "passes the shot back to "],
    [/mantiene la entrada\. Push out disponible\./g, "keeps control. Push out available."],
    [/entra con opcion de push out\./g, "comes in with a push out option."],
    [/mantiene la entrada\./g, "keeps control."],
    [/toma el turno\./g, "takes the turn."],
    [/decide tras safety con bola legal embocada\./g, "decides after a safety with a legal pocketed ball."],
    [/acepta la mesa tras safety\./g, "accepts the table after safety."],
    [/entra tras safety\./g, "comes in after safety."],
    [/decide tras tiro cantado no valido\./g, "decides after an invalid called shot."],
    [/acepta la mesa tras tiro no cantado\./g, "accepts the table after an uncalled shot."],
    [/emboca la 10 legalmente y gana el rack\./g, "pockets the 10 legally and wins the rack."],
    [/emboca la 10 antes de tiempo: se repone y sigue\./g, "pockets the 10 early: it is spotted and play continues."],
    [/mantiene la entrada con tiro cantado valido\./g, "keeps control with a valid called shot."],
    [/tira a tronera\./g, "shoots for the pocket."],
    [/tira con trayectoria alternativa por banda\./g, "shoots using an alternate rail route."],
    [/tira de seguridad\./g, "plays a safety shot."],
    [/declara push out\./g, "declares push out."],
    [/juega un safety\./g, "plays a safety."],
    [/ejecuta el tiro\./g, "takes the shot."],
    [/Dificultad /g, "Difficulty "],
    [/Tronera cantada: /g, "Called pocket: "],
    [/Jugar mesa/g, "Play table"],
    [/Devolver tiro/g, "Pass shot back"],
    [/rompe en /g, "breaks in "],
    [/toma /g, "takes "],
    [/sigue en mesa con /g, "stays at the table with "],
    [/bola\(s\) de su grupo\./g, "ball(s) of their group."],
    [/entra a mesa\./g, "comes to the table."],
    [/gana: 8 ilegal o en tronera incorrecta\./g, "wins: illegal 8-ball or wrong pocket."],
    [/cierra la 8 en /g, "finishes the 8 in "],
    [/emboca la 9 y gana el rack\./g, "pockets the 9 and wins the rack."],
    [/IA en espera\./g, "AI idle."],
    [/IA analizando mesa y rutas posibles\./g, "AI analyzing table and possible routes."],
    [/IA autocolocando blanca en mano\./g, "AI auto-placing cue ball in hand."],
    [/IA cantando tronera objetivo\./g, "AI calling target pocket."],
    [/IA ajustando angulo de tiro\./g, "AI adjusting shot angle."],
    [/IA calibrando potencia\./g, "AI calibrating shot power."],
    [/IA preparando push out\./g, "AI preparing push out."],
    [/IA preparando safety tactico\./g, "AI preparing tactical safety."],
    [/IA ejecutando tiro\./g, "AI executing shot."]
  ];
  replacements.forEach(([pattern, value]) => {
    out = out.replace(pattern, value);
  });
  out = out.replace(/\bBola 8\b/g, "8-Ball");
  out = out.replace(/\bBola 9\b/g, "9-Ball");
  out = out.replace(/\bBola 10\b/g, "10-Ball");
  out = out.replace(/\blisas\b/g, "solids");
  out = out.replace(/\brayas\b/g, "stripes");
  out = out.replace(/\babierta\b/g, "open table");
  out = out.replace(/\bIA\b/g, "AI");
  out = out.replace(/Sup\. izq\./g, "Top left");
  out = out.replace(/Sup\. centro/g, "Top center");
  out = out.replace(/Sup\. dcha\./g, "Top right");
  out = out.replace(/Inf\. izq\./g, "Bottom left");
  out = out.replace(/Inf\. centro/g, "Bottom center");
  out = out.replace(/Inf\. dcha\./g, "Bottom right");
  out = out.replace(/tronera cantada/g, "called pocket");
  return out;
}
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
function distancePointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0)
    return Math.hypot(px - x1, py - y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
  const sx = x1 + dx * t;
  const sy = y1 + dy * t;
  return Math.hypot(px - sx, py - sy);
}
function shuffle(values) {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
function makeCueBall(x, y) {
  return {
    id: "cue",
    number: 0,
    x,
    y,
    vx: 0,
    vy: 0,
    pocketed: false,
    stripe: false,
    color: "#f8fafc",
    lastPocketId: null
  };
}
function makeObjectBall(number, x, y) {
  return {
    id: `ball-${number}`,
    number,
    x,
    y,
    vx: 0,
    vy: 0,
    pocketed: false,
    stripe: number >= 9,
    color: BALL_COLORS[number] ?? "#64748b",
    lastPocketId: null
  };
}
function buildTriangleRackPositions() {
  const positions = [];
  const xSpacing = BALL_RADIUS * 1.82;
  const ySpacing = BALL_RADIUS * 1.04;
  for (let row = 0; row < 5; row += 1) {
    for (let index = 0; index <= row; index += 1) {
      positions.push({
        x: FOOT_SPOT_X + row * xSpacing,
        y: TABLE_CENTER_Y + (index * 2 - row) * ySpacing
      });
    }
  }
  return positions;
}
function buildDiamondRackPositions() {
  const offsets = [1, 2, 3, 2, 1];
  const positions = [];
  const xSpacing = BALL_RADIUS * 1.82;
  const ySpacing = BALL_RADIUS * 1.04;
  offsets.forEach((count, row) => {
    for (let index = 0; index < count; index += 1) {
      positions.push({
        x: FOOT_SPOT_X + row * xSpacing,
        y: TABLE_CENTER_Y + (index * 2 - (count - 1)) * ySpacing
      });
    }
  });
  return positions;
}
function buildTenBallRackPositions() {
  const offsets = [1, 2, 3, 4];
  const positions = [];
  const xSpacing = BALL_RADIUS * 1.82;
  const ySpacing = BALL_RADIUS * 1.04;
  offsets.forEach((count, row) => {
    for (let index = 0; index < count; index += 1) {
      positions.push({
        x: FOOT_SPOT_X + row * xSpacing,
        y: TABLE_CENTER_Y + (index * 2 - (count - 1)) * ySpacing
      });
    }
  });
  return positions;
}
function buildEightBallNumbers() {
  const solids = shuffle([1, 2, 3, 4, 5, 6, 7]);
  const stripes = shuffle([9, 10, 11, 12, 13, 14, 15]);
  const cornerLeft = solids.pop();
  const cornerRight = stripes.pop();
  const apexCandidates = shuffle([...solids, ...stripes]);
  const apex = apexCandidates[0];
  const pool = shuffle([
    ...solids.filter((value) => value !== apex),
    ...stripes.filter((value) => value !== apex)
  ]);
  const numbers = new Array(15).fill(null);
  numbers[0] = apex;
  numbers[4] = 8;
  numbers[10] = cornerLeft;
  numbers[14] = cornerRight;
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] == null) {
      numbers[i] = pool.shift();
    }
  }
  return numbers;
}
function buildKellyNumbers() {
  return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
}
function buildCaromBalls() {
  return [
    makeCueBall(PLAY_LEFT + 160, TABLE_CENTER_Y),
    makeObjectBall(1, TABLE_CENTER_X + 90, TABLE_CENTER_Y - 48),
    makeObjectBall(2, TABLE_CENTER_X + 190, TABLE_CENTER_Y + 54)
  ];
}
function buildRackBalls(modeKey) {
  if (isCaromMode(modeKey)) {
    return buildCaromBalls();
  }
  const cue = makeCueBall(HEAD_STRING_X - 74, TABLE_CENTER_Y);
  if (modeKey === "nine-ball") {
    const positions2 = buildDiamondRackPositions();
    const rest = shuffle([2, 3, 4, 5, 6, 7, 8]);
    const numbers2 = [1, rest[0], rest[1], rest[2], 9, rest[3], rest[4], rest[5], rest[6]];
    return [cue, ...positions2.map((position, index) => makeObjectBall(numbers2[index], position.x, position.y))];
  }
  if (modeKey === "ten-ball") {
    const positions2 = buildTenBallRackPositions();
    const rest = shuffle([2, 3, 4, 5, 6, 7, 8, 9]);
    const numbers2 = new Array(10).fill(null);
    numbers2[0] = 1;
    numbers2[4] = 10;
    let ptr = 0;
    for (let i = 0; i < numbers2.length; i += 1) {
      if (numbers2[i] == null) {
        numbers2[i] = rest[ptr];
        ptr += 1;
      }
    }
    return [cue, ...positions2.map((position, index) => makeObjectBall(numbers2[index], position.x, position.y))];
  }
  if (isKellyMode(modeKey)) {
    const positions2 = buildTriangleRackPositions();
    const numbers2 = buildKellyNumbers();
    return [cue, ...positions2.map((position, index) => makeObjectBall(numbers2[index], position.x, position.y))];
  }
  const positions = buildTriangleRackPositions();
  const numbers = buildEightBallNumbers();
  return [cue, ...positions.map((position, index) => makeObjectBall(numbers[index], position.x, position.y))];
}
function createPlayers(difficultyKey, locale, modeKey, participantCount = 2) {
  if (!isKellyMode(modeKey)) {
    return [
      { name: locale === "es" ? "Tu" : "You", type: "human", group: null, racksWon: 0, foulsInRow: 0, kellyTarget: null },
      { name: `${locale === "es" ? "IA" : "AI"} ${difficultyLabel(difficultyKey, locale)}`, type: "ai", group: null, racksWon: 0, foulsInRow: 0, kellyTarget: null }
    ];
  }
  const total = clamp(Math.round(Number(participantCount) || 2), 2, 15);
  return Array.from({ length: total }, (_, index) => ({
    name: index === 0 ? locale === "es" ? "Tu" : "You" : `${locale === "es" ? "IA" : "AI"} ${index}`,
    type: index === 0 ? "human" : "ai",
    group: null,
    racksWon: 0,
    foulsInRow: 0,
    kellyTarget: null
  }));
}
function createRuntimeState(modeKey = "eight-ball", difficultyKey = "club", locale = resolveLocale(), participantCount = 2) {
  const initialMessage = locale === "es" ? "Configura la mesa y pulsa Empezar." : "Set up the table and press Start.";
  return {
    locale,
    modeKey,
    difficultyKey,
    participantCount: isKellyMode(modeKey) ? clamp(Math.round(Number(participantCount) || 2), 2, 15) : 2,
    raceTo: isCaromMode(modeKey) ? 10 : isKellyMode(modeKey) ? 1 : 3,
    players: createPlayers(difficultyKey, locale, modeKey, participantCount),
    currentPlayer: PLAYER_HUMAN,
    breakerIndex: PLAYER_HUMAN,
    nextBreaker: isKellyMode(modeKey) ? 1 : PLAYER_AI,
    phase: "menu",
    balls: [],
    tableOpen: modeKey === "eight-ball",
    breakShot: true,
    pushOutAvailable: false,
    ballInHand: { active: false, restrictHeadString: false },
    cueControl: { angle: 0, power: 0.74 },
    safetyDeclared: false,
    calledPocketId: null,
    shot: null,
    pendingDecision: null,
    aiTimerMs: 0,
    rackWinner: null,
    matchWinner: null,
    message: initialMessage,
    log: [initialMessage],
    aiRoutine: null,
    aiLeds: createAiLedState(),
    aiAction: AI_ACTION_LABELS.idle,
    aiPlanPreview: null,
    fullscreen: false,
    shotCount: 0
  };
}
function cloneWins(players) {
  return players.map((player) => player.racksWon);
}
function nextPlayerIndex(state, fromIndex = state.currentPlayer) {
  if (!isKellyMode(state.modeKey)) {
    return fromIndex === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  }
  if (!state.players.length)
    return 0;
  return (fromIndex + 1) % state.players.length;
}
function assignKellyTargets(state) {
  if (!isKellyMode(state.modeKey))
    return;
  const drawPool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  state.players.forEach((player, index) => {
    player.group = null;
    player.foulsInRow = 0;
    player.kellyTarget = drawPool[index] ?? null;
  });
}
function getCueBall(state) {
  return state.balls.find((ball) => ball.id === "cue") ?? null;
}
function getBallById(state, ballId) {
  return state.balls.find((ball) => ball.id === ballId) ?? null;
}
function getActiveBalls(state) {
  return state.balls.filter((ball) => !ball.pocketed);
}
function addLog(state, text) {
  state.message = text;
  state.log = [text, ...state.log.filter((entry) => entry !== text)].slice(0, MAX_LOG_ITEMS);
}
function clearAiTelemetry(state) {
  state.aiRoutine = null;
  state.aiPlanPreview = null;
  state.aiAction = AI_ACTION_LABELS.idle;
  state.aiLeds = createAiLedState();
}
function setAiTelemetry(state, action, leds = {}) {
  const aiTurnActive = state.players[state.currentPlayer]?.type === "ai";
  state.aiAction = action;
  state.aiLeds = createAiLedState({ turn: aiTurnActive, ...leds });
}
function ballMatchesGroup(ball, group) {
  if (!ball || !group)
    return false;
  return ballGroupFromNumber(ball.number) === group;
}
function countRemainingGroupBalls(state, playerIndex) {
  const group = state.players[playerIndex]?.group;
  if (!group)
    return 0;
  return state.balls.filter((ball) => !ball.pocketed && ballMatchesGroup(ball, group)).length;
}
function getLowestNumber(state) {
  const numbers = state.balls.filter((ball) => !ball.pocketed && ball.number > 0).map((ball) => ball.number).sort((a, b) => a - b);
  return numbers[0] ?? null;
}
function getLegalNumbers(state, playerIndex) {
  if (isCaromMode(state.modeKey)) {
    return state.balls.filter((ball) => !ball.pocketed && ball.number > 0).map((ball) => ball.number);
  }
  if (isKellyMode(state.modeKey)) {
    const target = state.players[playerIndex]?.kellyTarget ?? null;
    if (target == null)
      return [];
    const targetBall = state.balls.find((ball) => ball.number === target);
    return targetBall && !targetBall.pocketed ? [target] : [];
  }
  if (state.modeKey === "nine-ball" || state.modeKey === "ten-ball") {
    const lowest = getLowestNumber(state);
    return lowest == null ? [] : [lowest];
  }
  const player = state.players[playerIndex];
  if (state.tableOpen || !player.group) {
    return state.balls.filter((ball) => !ball.pocketed && ball.number > 0 && ball.number !== 8).map((ball) => ball.number);
  }
  const remainingGroup = countRemainingGroupBalls(state, playerIndex);
  if (remainingGroup === 0) {
    return state.balls.filter((ball) => !ball.pocketed && ball.number === 8).map((ball) => ball.number);
  }
  return state.balls.filter((ball) => !ball.pocketed && ballMatchesGroup(ball, player.group)).map((ball) => ball.number);
}
function needsPocketCall(state, playerIndex) {
  if (state.modeKey === "ten-ball") {
    const legalNumbers = getLegalNumbers(state, playerIndex);
    return !state.breakShot && !state.safetyDeclared && legalNumbers.length > 0;
  }
  if (state.modeKey !== "eight-ball")
    return false;
  if (state.tableOpen)
    return false;
  const player = state.players[playerIndex];
  if (!player.group)
    return false;
  return countRemainingGroupBalls(state, playerIndex) === 0;
}
function supportsPushOut(modeKey) {
  return modeKey === "nine-ball" || modeKey === "ten-ball";
}
function supportsSafetyCall(modeKey) {
  return modeKey === "eight-ball" || modeKey === "ten-ball";
}
function setCueControlForTurn(state) {
  const cueBall = getCueBall(state);
  if (!cueBall)
    return;
  const legalNumbers = getLegalNumbers(state, state.currentPlayer);
  const targetBall = state.balls.find((ball) => !ball.pocketed && legalNumbers.includes(ball.number));
  state.cueControl.angle = targetBall ? Math.atan2(targetBall.y - cueBall.y, targetBall.x - cueBall.x) : 0;
  state.cueControl.power = state.breakShot ? 0.9 : clamp(state.cueControl.power || 0.58, 0.18, 1);
}
function isCuePlacementValid(state, x, y, restrictHeadString) {
  if (x < PLAY_LEFT + BALL_RADIUS + 2 || x > PLAY_RIGHT - BALL_RADIUS - 2)
    return false;
  if (y < PLAY_TOP + BALL_RADIUS + 2 || y > PLAY_BOTTOM - BALL_RADIUS - 2)
    return false;
  if (restrictHeadString && x > HEAD_STRING_X - BALL_RADIUS - 2)
    return false;
  const pocketCollision = POCKETS.some((pocket) => distance(x, y, pocket.x, pocket.y) < pocket.radius - 3);
  if (pocketCollision)
    return false;
  return state.balls.every((ball) => {
    if (ball.id === "cue" || ball.pocketed)
      return true;
    return distance(x, y, ball.x, ball.y) > BALL_DIAMETER + 1;
  });
}
function findNearestPlacement(state, preferredX, preferredY, restrictHeadString) {
  const xMin = PLAY_LEFT + BALL_RADIUS + 8;
  const xMax = restrictHeadString ? HEAD_STRING_X - BALL_RADIUS - 8 : PLAY_RIGHT - BALL_RADIUS - 8;
  const yMin = PLAY_TOP + BALL_RADIUS + 8;
  const yMax = PLAY_BOTTOM - BALL_RADIUS - 8;
  let best = null;
  for (let y = yMin; y <= yMax; y += BALL_DIAMETER * 1.05) {
    for (let x = xMin; x <= xMax; x += BALL_DIAMETER * 1.05) {
      if (!isCuePlacementValid(state, x, y, restrictHeadString))
        continue;
      const score = distance(x, y, preferredX, preferredY);
      if (!best || score < best.score) {
        best = { x, y, score };
      }
    }
  }
  if (best)
    return best;
  return {
    x: clamp(preferredX, xMin, xMax),
    y: clamp(preferredY, yMin, yMax),
    score: 9999
  };
}
function prepareCueBallForPlacement(state, restrictHeadString) {
  const cueBall = getCueBall(state);
  if (!cueBall)
    return;
  const preferredX = restrictHeadString ? HEAD_STRING_X - 100 : PLAY_LEFT + 120;
  const placement = findNearestPlacement(state, preferredX, TABLE_CENTER_Y, restrictHeadString);
  cueBall.pocketed = false;
  cueBall.vx = 0;
  cueBall.vy = 0;
  cueBall.x = placement.x;
  cueBall.y = placement.y;
}
function moveToTurnStart(state) {
  if (state.matchWinner != null || state.rackWinner != null)
    return;
  if (state.pendingDecision) {
    if (state.pendingDecision.chooserIndex === PLAYER_HUMAN) {
      state.currentPlayer = PLAYER_HUMAN;
      state.phase = "decision";
      return;
    }
    resolvePendingDecisionIfAi(state);
    return;
  }
  if (state.modeKey === "ten-ball") {
    state.calledPocketId = null;
  } else if (!needsPocketCall(state, state.currentPlayer)) {
    state.calledPocketId = null;
  }
  setCueControlForTurn(state);
  if (state.currentPlayer === PLAYER_HUMAN) {
    clearAiTelemetry(state);
    state.phase = state.ballInHand.active ? "placing" : "aim";
  } else {
    state.phase = "ai-thinking";
    state.aiTimerMs = scaleAiDuration(Math.round(DIFFICULTY_PRESETS[state.difficultyKey].thinkMs * 0.42));
    state.aiRoutine = null;
    state.aiPlanPreview = null;
    setAiTelemetry(state, AI_ACTION_LABELS.scan);
  }
}
function startRack(state, breakerIndex) {
  state.players.forEach((player) => {
    player.group = null;
    player.foulsInRow = 0;
    if (!isKellyMode(state.modeKey)) {
      player.kellyTarget = null;
    }
  });
  state.balls = buildRackBalls(state.modeKey);
  if (isKellyMode(state.modeKey)) {
    assignKellyTargets(state);
  }
  state.currentPlayer = breakerIndex;
  state.breakerIndex = breakerIndex;
  state.nextBreaker = nextPlayerIndex(state, breakerIndex);
  state.tableOpen = state.modeKey === "eight-ball";
  state.breakShot = !isCaromMode(state.modeKey);
  state.pushOutAvailable = false;
  state.ballInHand = { active: false, restrictHeadString: false };
  state.safetyDeclared = false;
  state.shot = null;
  state.pendingDecision = null;
  state.calledPocketId = null;
  state.rackWinner = null;
  state.matchWinner = null;
  state.shotCount = 0;
  if (isCaromMode(state.modeKey)) {
    addLog(state, state.locale === "es" ? `${state.players[breakerIndex].name} abre la serie de carambola.` : `${state.players[breakerIndex].name} opens the carom inning.`);
  } else if (isKellyMode(state.modeKey)) {
    const assignmentPreview = state.players.slice(0, 6).map((player) => `${player.name}: ${player.kellyTarget ?? "-"}`).join(" | ");
    const remainingAssignments = state.players.length - 6;
    const assignmentSuffix = remainingAssignments > 0 ? state.locale === "es" ? ` | +${remainingAssignments} mas` : ` | +${remainingAssignments} more` : "";
    const assignments = `${assignmentPreview}${assignmentSuffix}`;
    addLog(state, state.locale === "es" ? `${state.players[breakerIndex].name} rompe en Kelly. Objetivos -> ${assignments}.` : `${state.players[breakerIndex].name} breaks in Kelly. Targets -> ${assignments}.`);
  } else {
    addLog(state, `${state.players[breakerIndex].name} rompe en ${modeLabel(state.modeKey, state.locale)}.`);
  }
  moveToTurnStart(state);
}
function findSpotPlacement(state) {
  const cue = getCueBall(state);
  const occupied = (x, y) => state.balls.some((ball) => {
    if (ball.pocketed)
      return false;
    if (cue && ball.id === cue.id)
      return false;
    return distance(x, y, ball.x, ball.y) < BALL_DIAMETER + 1;
  });
  const offsets = [0, BALL_DIAMETER, -BALL_DIAMETER, BALL_DIAMETER * 2, -BALL_DIAMETER * 2, BALL_DIAMETER * 3, -BALL_DIAMETER * 3];
  for (const offset of offsets) {
    const x = FOOT_SPOT_X;
    const y = TABLE_CENTER_Y + offset;
    if (!occupied(x, y))
      return { x, y };
  }
  return { x: FOOT_SPOT_X, y: TABLE_CENTER_Y };
}
function respotBall(state, number) {
  const ball = state.balls.find((entry) => entry.number === number);
  if (!ball)
    return;
  const placement = findSpotPlacement(state);
  ball.pocketed = false;
  ball.x = placement.x;
  ball.y = placement.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.lastPocketId = null;
}
function segmentClear(state, x1, y1, x2, y2, ignoreIds = /* @__PURE__ */ new Set(), clearance = BALL_DIAMETER * 0.96) {
  return state.balls.every((ball) => {
    if (ball.pocketed || ignoreIds.has(ball.id))
      return true;
    return distancePointToSegment(ball.x, ball.y, x1, y1, x2, y2) > clearance;
  });
}
function choosePocketPlans(state, playerIndex, cueX, cueY) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const legalBalls = state.balls.filter((ball) => !ball.pocketed && legalNumbers.includes(ball.number));
  const plans = [];
  legalBalls.forEach((ball) => {
    POCKETS.forEach((pocket) => {
      const dx = pocket.x - ball.x;
      const dy = pocket.y - ball.y;
      const length = Math.hypot(dx, dy);
      if (length < 1)
        return;
      const nx = dx / length;
      const ny = dy / length;
      const contactX = ball.x - nx * BALL_DIAMETER;
      const contactY = ball.y - ny * BALL_DIAMETER;
      if (contactX < PLAY_LEFT || contactX > PLAY_RIGHT || contactY < PLAY_TOP || contactY > PLAY_BOTTOM)
        return;
      if (!segmentClear(state, ball.x, ball.y, pocket.x, pocket.y, /* @__PURE__ */ new Set([ball.id, "cue"]), BALL_DIAMETER * 0.92))
        return;
      if (!segmentClear(state, cueX, cueY, contactX, contactY, /* @__PURE__ */ new Set([ball.id, "cue"]), BALL_DIAMETER * 0.92))
        return;
      const cueDistance = distance(cueX, cueY, contactX, contactY);
      const objectDistance = distance(ball.x, ball.y, pocket.x, pocket.y);
      const aimAngle = Math.atan2(contactY - cueY, contactX - cueX);
      const centerAngle = Math.atan2(ball.y - cueY, ball.x - cueX);
      const cutPenalty = Math.abs(normalizeAngle(aimAngle - centerAngle));
      const isKeyBall = ball.number === 8 || ball.number === 9 || ball.number === 10;
      const score = cueDistance + objectDistance * 0.82 + cutPenalty * 180 + (isKeyBall ? -22 : 0);
      const basePower = clamp(0.34 + cueDistance / 560 + objectDistance / 920, 0.28, 0.88);
      plans.push({
        type: "pot",
        route: "direct",
        ballId: ball.id,
        ballNumber: ball.number,
        pocketId: pocket.id,
        angle: aimAngle,
        power: basePower,
        score,
        cueDistance,
        objectDistance,
        cutPenalty
      });
    });
  });
  plans.sort((a, b) => a.score - b.score);
  return plans;
}
function chooseFallbackPlan(state, playerIndex, cueX, cueY) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const legalBalls = state.balls.filter((ball) => !ball.pocketed && legalNumbers.includes(ball.number)).sort((a, b) => distance(cueX, cueY, a.x, a.y) - distance(cueX, cueY, b.x, b.y));
  const target = legalBalls[0];
  if (!target)
    return null;
  return {
    type: "contact",
    route: "direct",
    ballId: target.id,
    ballNumber: target.number,
    pocketId: null,
    angle: Math.atan2(target.y - cueY, target.x - cueX),
    power: state.breakShot ? 0.92 : 0.48,
    score: 9999,
    cueDistance: distance(cueX, cueY, target.x, target.y),
    objectDistance: 0,
    cutPenalty: 0
  };
}
function computeBankBouncePoint(cueX, cueY, targetX, targetY, railId) {
  const cushionLeft = PLAY_LEFT + BALL_RADIUS;
  const cushionRight = PLAY_RIGHT - BALL_RADIUS;
  const cushionTop = PLAY_TOP + BALL_RADIUS;
  const cushionBottom = PLAY_BOTTOM - BALL_RADIUS;
  if (railId === "left" || railId === "right") {
    const railX = railId === "left" ? cushionLeft : cushionRight;
    const mirroredX = railX * 2 - targetX;
    const denominator2 = mirroredX - cueX;
    if (Math.abs(denominator2) < 1e-4)
      return null;
    const t2 = (railX - cueX) / denominator2;
    if (t2 <= 0.06 || t2 >= 0.94)
      return null;
    const y = cueY + (targetY - cueY) * t2;
    if (y < cushionTop || y > cushionBottom)
      return null;
    return { x: railX, y };
  }
  const railY = railId === "top" ? cushionTop : cushionBottom;
  const mirroredY = railY * 2 - targetY;
  const denominator = mirroredY - cueY;
  if (Math.abs(denominator) < 1e-4)
    return null;
  const t = (railY - cueY) / denominator;
  if (t <= 0.06 || t >= 0.94)
    return null;
  const x = cueX + (targetX - cueX) * t;
  if (x < cushionLeft || x > cushionRight)
    return null;
  return { x, y: railY };
}
function chooseBankPlans(state, playerIndex, cueX, cueY, difficulty) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const legalBalls = state.balls.filter((ball) => !ball.pocketed && legalNumbers.includes(ball.number)).sort((a, b) => distance(cueX, cueY, a.x, a.y) - distance(cueX, cueY, b.x, b.y)).slice(0, difficulty.allowBankShots ? 5 : 0);
  const rails = ["left", "right", "top", "bottom"];
  const plans = [];
  legalBalls.forEach((ball) => {
    rails.forEach((railId) => {
      const bounce = computeBankBouncePoint(cueX, cueY, ball.x, ball.y, railId);
      if (!bounce)
        return;
      const ignoreIds = /* @__PURE__ */ new Set([ball.id, "cue"]);
      if (!segmentClear(state, cueX, cueY, bounce.x, bounce.y, ignoreIds, BALL_DIAMETER * 0.84))
        return;
      if (!segmentClear(state, bounce.x, bounce.y, ball.x, ball.y, ignoreIds, BALL_DIAMETER * 0.9))
        return;
      let pocketId = POCKETS[0].id;
      let nearestPocketDistance = Number.POSITIVE_INFINITY;
      POCKETS.forEach((pocket) => {
        const d = distance(ball.x, ball.y, pocket.x, pocket.y);
        if (d < nearestPocketDistance) {
          nearestPocketDistance = d;
          pocketId = pocket.id;
        }
      });
      const cueDistance = distance(cueX, cueY, bounce.x, bounce.y);
      const objectDistance = distance(bounce.x, bounce.y, ball.x, ball.y);
      const totalDistance = cueDistance + objectDistance;
      const aimAngle = Math.atan2(bounce.y - cueY, bounce.x - cueX);
      const centerAngle = Math.atan2(ball.y - cueY, ball.x - cueX);
      const cutPenalty = Math.abs(normalizeAngle(aimAngle - centerAngle));
      const score = totalDistance + cutPenalty * 240 + nearestPocketDistance * 0.1 + difficulty.bankShotWeight;
      const power = clamp(0.42 + totalDistance / 980 + cutPenalty * 0.2, 0.3, 0.95);
      plans.push({
        type: "kick",
        route: `bank-${railId}`,
        ballId: ball.id,
        ballNumber: ball.number,
        pocketId,
        angle: aimAngle,
        power,
        score,
        cueDistance,
        objectDistance,
        cutPenalty
      });
    });
  });
  plans.sort((a, b) => a.score - b.score);
  return plans;
}
function evaluateAiPlanScore(state, playerIndex, plan, difficulty) {
  if (isKellyMode(state.modeKey) || isCaromMode(state.modeKey)) {
    return plan.score;
  }
  const opponentIndex = playerIndex === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  let score = plan.score;
  const ownFouls = state.players[playerIndex]?.foulsInRow ?? 0;
  const opponentFouls = state.players[opponentIndex]?.foulsInRow ?? 0;
  const isKeyBall = plan.ballNumber === 8 || plan.ballNumber === 9 || plan.ballNumber === 10;
  if (plan.type === "kick" && !difficulty.allowBankShots) {
    score += 180;
  }
  if (isKeyBall) {
    score -= difficulty.keyBallBonus;
  }
  score += ownFouls * 26;
  score -= opponentFouls * 11;
  score += (plan.cutPenalty ?? 0) * 90;
  if (state.modeKey === "eight-ball") {
    const ownRemaining = countRemainingGroupBalls(state, playerIndex);
    const opponentRemaining = countRemainingGroupBalls(state, opponentIndex);
    if (ownRemaining > 0 && opponentRemaining > 0) {
      score += (ownRemaining - opponentRemaining) * 5;
    }
  }
  return score;
}
function tuneAiPower(state, plan, difficulty) {
  const cueDistance = plan.cueDistance ?? 280;
  const objectDistance = plan.objectDistance ?? 0;
  const travelDistance = cueDistance + objectDistance * 0.72;
  const distanceFactor = clamp((travelDistance - 250) / 760, 0, 1);
  const routeBoost = plan.type === "kick" ? 0.09 : 0;
  const cutBoost = clamp((plan.cutPenalty ?? 0) / 1.2, 0, 1) * 0.07;
  const breakBoost = state.breakShot ? 0.14 : 0;
  const dynamicBias = (distanceFactor - 0.45) * difficulty.powerDistanceWeight;
  return clamp(plan.power + dynamicBias + routeBoost + cutBoost + breakBoost, 0.2, 1);
}
function shouldAiDeclareSafety(state, plan, difficulty, forcePushOut) {
  if (forcePushOut)
    return false;
  if (!supportsSafetyCall(state.modeKey) || state.breakShot)
    return false;
  const riskyShot = plan.type !== "pot" || plan.score >= difficulty.safetyRiskThreshold || (plan.cutPenalty ?? 0) > 0.7;
  if (!riskyShot)
    return false;
  const chance = plan.type === "pot" ? difficulty.safetyChanceOnRisk : difficulty.safetyChanceOnContact;
  return Math.random() < chance;
}
function chooseAiPlan(state, playerIndex, cueX, cueY, options = {}) {
  const difficulty = DIFFICULTY_PRESETS[state.difficultyKey];
  const deterministic = Boolean(options.deterministic);
  if (isCaromMode(state.modeKey)) {
    const objectBalls = state.balls.filter((ball) => !ball.pocketed && ball.number > 0).sort((a, b) => distance(cueX, cueY, a.x, a.y) - distance(cueX, cueY, b.x, b.y));
    const firstObject = objectBalls[0];
    if (!firstObject)
      return null;
    const baseAngle = Math.atan2(firstObject.y - cueY, firstObject.x - cueX);
    return {
      type: "contact",
      route: "direct",
      ballId: firstObject.id,
      ballNumber: firstObject.number,
      pocketId: null,
      angle: baseAngle + (deterministic ? 0 : (Math.random() * 2 - 1) * difficulty.aimNoise * 0.35),
      power: clamp(0.66 + (deterministic ? 0 : (Math.random() * 2 - 1) * difficulty.powerNoise * 0.4), 0.4, 0.95),
      score: distance(cueX, cueY, firstObject.x, firstObject.y),
      cueDistance: distance(cueX, cueY, firstObject.x, firstObject.y),
      objectDistance: 0,
      cutPenalty: 0,
      tacticalScore: distance(cueX, cueY, firstObject.x, firstObject.y)
    };
  }
  const directPlans = choosePocketPlans(state, playerIndex, cueX, cueY);
  const bankPlans = difficulty.allowBankShots ? chooseBankPlans(state, playerIndex, cueX, cueY, difficulty).slice(0, 8) : [];
  const ranked = [...directPlans.slice(0, 12), ...bankPlans].map((plan) => ({
    ...plan,
    tacticalScore: evaluateAiPlanScore(state, playerIndex, plan, difficulty)
  })).sort((a, b) => a.tacticalScore - b.tacticalScore);
  const fallback = chooseFallbackPlan(state, playerIndex, cueX, cueY);
  const spread = deterministic ? 1 : difficulty.pickSpread;
  const selectedPlan = ranked[Math.min(Math.floor(Math.random() * spread), Math.max(ranked.length - 1, 0))] ?? fallback;
  if (!selectedPlan)
    return null;
  const tunedPower = tuneAiPower(state, selectedPlan, difficulty);
  return {
    ...selectedPlan,
    angle: selectedPlan.angle + (deterministic ? 0 : (Math.random() * 2 - 1) * difficulty.aimNoise),
    power: clamp(tunedPower + (deterministic ? 0 : (Math.random() * 2 - 1) * difficulty.powerNoise), 0.2, 1)
  };
}
function chooseAiPlacement(state, playerIndex, restrictHeadString) {
  const difficulty = DIFFICULTY_PRESETS[state.difficultyKey];
  const xStart = PLAY_LEFT + 90;
  const xEnd = restrictHeadString ? HEAD_STRING_X - 20 : PLAY_RIGHT - 120;
  const yStart = PLAY_TOP + 70;
  const yEnd = PLAY_BOTTOM - 70;
  const stepX = difficulty.placeStepX;
  const stepY = difficulty.placeStepY;
  let best = null;
  for (let y = yStart; y <= yEnd; y += stepY) {
    for (let x = xStart; x <= xEnd; x += stepX) {
      if (!isCuePlacementValid(state, x, y, restrictHeadString))
        continue;
      const plan = chooseAiPlan(state, playerIndex, x, y, { deterministic: true });
      if (!plan)
        continue;
      const score = plan.tacticalScore + distance(x, y, HEAD_STRING_X - 80, TABLE_CENTER_Y) * difficulty.placementBias;
      if (!best || score < best.score) {
        best = { x, y, score };
      }
    }
  }
  if (best)
    return best;
  return findNearestPlacement(state, restrictHeadString ? HEAD_STRING_X - 90 : PLAY_LEFT + 120, TABLE_CENTER_Y, restrictHeadString);
}
function assignGroup(state, playerIndex, group) {
  if (!group)
    return;
  state.players[playerIndex].group = group;
  state.players[1 - playerIndex].group = group === "solids" ? "stripes" : "solids";
  state.tableOpen = false;
  addLog(state, `${state.players[playerIndex].name} toma ${groupLabel(group, state.locale)}.`);
}
function setTurnFoulCount(state, playerIndex, foul) {
  if (state.modeKey !== "nine-ball" && state.modeKey !== "ten-ball")
    return;
  state.players[playerIndex].foulsInRow = foul ? state.players[playerIndex].foulsInRow + 1 : 0;
}
function createShotContext(state, playerIndex, options = {}) {
  const legalNumbers = getLegalNumbers(state, playerIndex);
  const requiredFirstNumber = legalNumbers[0] ?? null;
  return {
    playerIndex,
    breakShot: state.breakShot,
    startTableOpen: state.tableOpen,
    requiredFirstNumber,
    calledBallNumber: isKellyMode(state.modeKey) ? state.players[playerIndex]?.kellyTarget ?? requiredFirstNumber : requiredFirstNumber,
    shooterGroup: state.players[playerIndex].group,
    canShootBlack: needsPocketCall(state, playerIndex),
    calledPocketId: options.calledPocketId ?? state.calledPocketId,
    isPushOut: Boolean(options.isPushOut),
    safetyDeclared: Boolean(options.safetyDeclared),
    firstHitBallId: null,
    railAfterContact: false,
    breakRailContacts: /* @__PURE__ */ new Set(),
    pocketedIds: [],
    outOfTableIds: [],
    cuePocketed: false,
    cueObjectHitOrder: []
  };
}
function startShot(state, angle, power, options = {}) {
  const cueBall = getCueBall(state);
  if (!cueBall || cueBall.pocketed)
    return false;
  if (!(state.phase === "aim" || state.phase === "placing"))
    return false;
  if (state.currentPlayer !== PLAYER_HUMAN)
    return false;
  if (state.phase === "placing") {
    state.phase = "aim";
  }
  const forcePushOut = Boolean(options.forcePushOut);
  if (forcePushOut && !(state.pushOutAvailable && supportsPushOut(state.modeKey))) {
    addLog(state, "Push out no disponible en esta entrada.");
    return false;
  }
  if (!forcePushOut && needsPocketCall(state, state.currentPlayer) && !state.calledPocketId) {
    const ballName = state.modeKey === "ten-ball" ? "la bola legal" : "la 8";
    addLog(state, `Elige una tronera para cantar ${ballName} antes de tirar.`);
    return false;
  }
  const useSafety = !forcePushOut && state.safetyDeclared && supportsSafetyCall(state.modeKey) && !state.breakShot;
  const speed = lerp(300, state.breakShot ? 1700 : 1460, clamp(power, 0.18, 1));
  cueBall.vx = Math.cos(angle) * speed;
  cueBall.vy = Math.sin(angle) * speed;
  state.phase = "moving";
  state.shotCount += 1;
  state.shot = createShotContext(state, state.currentPlayer, {
    calledPocketId: forcePushOut ? null : state.calledPocketId,
    isPushOut: forcePushOut,
    safetyDeclared: useSafety
  });
  state.pushOutAvailable = false;
  state.pendingDecision = null;
  state.safetyDeclared = false;
  if (forcePushOut) {
    addLog(state, `${state.players[state.currentPlayer].name} declara push out.`);
  } else if (useSafety) {
    addLog(state, `${state.players[state.currentPlayer].name} juega un safety.`);
  } else {
    addLog(state, `${state.players[state.currentPlayer].name} ejecuta el tiro.`);
  }
  return true;
}
function switchTurn(state, options = {}) {
  const { ballInHand = false, restrictHeadString = false, reason = null, pushOutAvailable = false } = options;
  state.breakShot = false;
  state.currentPlayer = nextPlayerIndex(state, state.currentPlayer);
  state.pendingDecision = null;
  state.safetyDeclared = false;
  state.pushOutAvailable = pushOutAvailable;
  state.ballInHand = { active: ballInHand, restrictHeadString };
  if (ballInHand) {
    prepareCueBallForPlacement(state, restrictHeadString);
  }
  if (reason)
    addLog(state, reason);
  moveToTurnStart(state);
}
function continueTurn(state, options = {}) {
  const { reason = null, pushOutAvailable = false } = options;
  state.breakShot = false;
  state.pendingDecision = null;
  state.safetyDeclared = false;
  state.pushOutAvailable = pushOutAvailable;
  state.ballInHand = { active: false, restrictHeadString: false };
  if (reason)
    addLog(state, reason);
  moveToTurnStart(state);
}
function finishRack(state, winnerIndex, reason) {
  state.players[winnerIndex].racksWon += 1;
  state.rackWinner = winnerIndex;
  clearAiTelemetry(state);
  state.pendingDecision = null;
  state.pushOutAvailable = false;
  state.safetyDeclared = false;
  state.ballInHand = { active: false, restrictHeadString: false };
  state.calledPocketId = null;
  addLog(state, reason);
  if (state.players[winnerIndex].racksWon >= state.raceTo) {
    state.matchWinner = winnerIndex;
    state.phase = "match-over";
  } else {
    state.phase = "rack-over";
  }
}
function queueTakeOrPassDecision(state, {
  type,
  chooserIndex,
  returnToIndex,
  prompt,
  takeReason,
  passReason
}) {
  const locale = state.locale ?? "es";
  state.pendingDecision = {
    type,
    chooserIndex,
    returnToIndex,
    prompt,
    options: [
      { id: "take", label: locale === "es" ? "Jugar mesa" : "Play table" },
      { id: "pass-back", label: locale === "es" ? "Devolver tiro" : "Pass shot back" }
    ],
    takeReason,
    passReason
  };
  state.breakShot = false;
  state.pushOutAvailable = false;
  state.safetyDeclared = false;
  state.calledPocketId = null;
  addLog(state, prompt);
}
function pickAiDecision(state, chooserIndex) {
  const cueBall = getCueBall(state);
  if (!cueBall)
    return "take";
  const plans = choosePocketPlans(state, chooserIndex, cueBall.x, cueBall.y);
  const bestScore = plans[0]?.score ?? Infinity;
  return bestScore < 830 ? "take" : "pass-back";
}
function resolvePendingDecision(state, optionId) {
  const decision = state.pendingDecision;
  if (!decision)
    return;
  const pick = optionId ?? "take";
  const take = pick !== "pass-back";
  state.pendingDecision = null;
  state.breakShot = false;
  state.pushOutAvailable = false;
  state.safetyDeclared = false;
  state.ballInHand = { active: false, restrictHeadString: false };
  if (take) {
    state.currentPlayer = decision.chooserIndex;
    if (decision.takeReason)
      addLog(state, decision.takeReason);
  } else {
    state.currentPlayer = decision.returnToIndex;
    if (decision.passReason)
      addLog(state, decision.passReason);
  }
  moveToTurnStart(state);
}
function resolvePendingDecisionIfAi(state) {
  if (!state.pendingDecision)
    return false;
  if (state.pendingDecision.chooserIndex === PLAYER_HUMAN) {
    state.currentPlayer = PLAYER_HUMAN;
    state.phase = "decision";
    return true;
  }
  const option = pickAiDecision(state, state.pendingDecision.chooserIndex);
  resolvePendingDecision(state, option);
  return true;
}
function evaluateCaromShot(state, shot, shooterIndex) {
  const shooter = state.players[shooterIndex];
  const cueHits = new Set(shot.cueObjectHitOrder ?? []);
  const foul = shot.cuePocketed || shot.outOfTableIds.length > 0;
  if (foul) {
    switchTurn(state, {
      reason: state.locale === "es" ? "Falta en carambola: turno cedido." : "Carom foul: turn lost."
    });
    return;
  }
  if (cueHits.size >= 2) {
    shooter.racksWon += 1;
    if (shooter.racksWon >= state.raceTo) {
      state.matchWinner = shooterIndex;
      state.phase = "match-over";
      addLog(state, state.locale === "es" ? `${shooter.name} gana la serie de carambola (${shooter.racksWon}/${state.raceTo}).` : `${shooter.name} wins the carom set (${shooter.racksWon}/${state.raceTo}).`);
      clearAiTelemetry(state);
      return;
    }
    continueTurn(state, {
      reason: state.locale === "es" ? `Carambola valida de ${shooter.name}. Punto ${shooter.racksWon}/${state.raceTo}.` : `Valid carom by ${shooter.name}. Point ${shooter.racksWon}/${state.raceTo}.`
    });
    return;
  }
  switchTurn(state, {
    reason: state.locale === "es" ? `${shooter.name} no completa carambola. Cambia el turno.` : `${shooter.name} does not complete a carom. Turn changes.`
  });
}
function kellyTargetOwner(state, number) {
  return state.players.findIndex((player) => player.kellyTarget === number);
}
function evaluateKellyShot(state, shot, shooterIndex) {
  const shooter = state.players[shooterIndex];
  const firstHitBall = shot.firstHitBallId ? getBallById(state, shot.firstHitBallId) : null;
  const pocketedBalls = shot.pocketedIds.map((ballId) => getBallById(state, ballId)).filter(Boolean);
  const ownTarget = shooter.kellyTarget ?? null;
  const illegalFirstContact = Boolean(ownTarget != null && firstHitBall && firstHitBall.number !== ownTarget);
  const foul = ownTarget == null || shot.cuePocketed || !firstHitBall || illegalFirstContact || shot.outOfTableIds.length > 0;
  const ownTargetPocketed = ownTarget != null && pocketedBalls.some((ball) => ball.number === ownTarget);
  pocketedBalls.forEach((ball) => {
    if (ball.number <= 0)
      return;
    const ownerIndex = kellyTargetOwner(state, ball.number);
    if (ownerIndex === -1 || ownerIndex === shooterIndex)
      return;
    respotBall(state, ball.number);
  });
  if (ownTargetPocketed && !foul) {
    finishRack(state, shooterIndex, state.locale === "es" ? `${shooter.name} emboca su bola objetivo (${ownTarget}) y gana Kelly.` : `${shooter.name} pockets their target ball (${ownTarget}) and wins Kelly.`);
    return;
  }
  if (foul) {
    if (ownTargetPocketed) {
      respotBall(state, ownTarget);
    }
    const foulReason = state.locale === "es" ? ownTarget == null ? `${shooter.name} no tiene bola objetivo asignada.` : !firstHitBall ? `${shooter.name} falla contacto legal en Kelly.` : illegalFirstContact ? `${shooter.name} golpea primero una bola incorrecta en Kelly.` : `Falta de ${shooter.name} en Kelly.` : ownTarget == null ? `${shooter.name} has no assigned target ball.` : !firstHitBall ? `${shooter.name} misses legal contact in Kelly.` : illegalFirstContact ? `${shooter.name} hits the wrong first ball in Kelly.` : `${shooter.name} commits a Kelly foul.`;
    switchTurn(state, {
      ballInHand: true,
      reason: foulReason
    });
    return;
  }
  switchTurn(state, {
    reason: state.locale === "es" ? `${shooter.name} no emboca su objetivo.` : `${shooter.name} does not pocket their target.`
  });
}
function evaluateShot(state) {
  const shot = state.shot;
  if (!shot)
    return;
  state.shot = null;
  const shooterIndex = shot.playerIndex;
  const opponentIndex = shooterIndex === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
  const shooter = state.players[shooterIndex];
  const opponent = state.players[opponentIndex];
  const firstHitBall = shot.firstHitBallId ? getBallById(state, shot.firstHitBallId) : null;
  const pocketedBalls = shot.pocketedIds.map((ballId) => getBallById(state, ballId)).filter(Boolean);
  const objectPocketed = pocketedBalls.filter((ball) => ball.number > 0);
  const pocketedEight = pocketedBalls.find((ball) => ball.number === 8) ?? null;
  const pocketedNine = pocketedBalls.find((ball) => ball.number === 9) ?? null;
  const pocketedTen = pocketedBalls.find((ball) => ball.number === 10) ?? null;
  const objectOutOfTable = shot.outOfTableIds.map((ballId) => getBallById(state, ballId)).filter((ball) => ball && ball.number > 0);
  const remainingObjectBalls = state.balls.filter((ball) => !ball.pocketed && ball.number > 0);
  let foulReason = null;
  if (isCaromMode(state.modeKey)) {
    evaluateCaromShot(state, shot, shooterIndex);
    return;
  }
  if (isKellyMode(state.modeKey)) {
    evaluateKellyShot(state, shot, shooterIndex);
    return;
  }
  if (shot.cuePocketed) {
    foulReason = "Scratch: la blanca cae en tronera.";
  }
  if (objectOutOfTable.length > 0) {
    foulReason = foulReason ?? "Falta: bola objetiva fuera de la mesa.";
  }
  if (!shot.isPushOut) {
    if (!firstHitBall) {
      foulReason = foulReason ?? "Falta: no hubo contacto con una bola objetiva.";
    }
    if (state.modeKey === "nine-ball" || state.modeKey === "ten-ball") {
      const requiredFirst = shot.requiredFirstNumber ?? (state.modeKey === "nine-ball" ? 9 : 10);
      if (firstHitBall && firstHitBall.number !== requiredFirst) {
        foulReason = foulReason ?? `Falta: primero debias tocar la ${requiredFirst}.`;
      }
    } else if (firstHitBall) {
      if (shot.canShootBlack) {
        if (firstHitBall.number !== 8) {
          foulReason = foulReason ?? "Falta: con mesa resuelta debes tocar primero la 8.";
        }
      } else if (shot.startTableOpen) {
        if (firstHitBall.number === 8) {
          foulReason = foulReason ?? "Falta: con mesa abierta no puedes tocar primero la 8.";
        }
      } else if (shooter.group && !ballMatchesGroup(firstHitBall, shooter.group)) {
        foulReason = foulReason ?? `Falta: debias tocar primero una ${groupLabel(shooter.group, state.locale)}.`;
      }
    }
    if (objectPocketed.length === 0 && !shot.railAfterContact) {
      foulReason = foulReason ?? "Falta: ninguna bola toco banda tras el contacto.";
    }
  }
  if (shot.breakShot && objectPocketed.length === 0 && shot.breakRailContacts.size < 4) {
    foulReason = foulReason ?? "Saque ilegal: menos de cuatro bolas objetivas tocaron banda.";
  }
  if (state.modeKey === "eight-ball") {
    if (pocketedEight) {
      if (shot.breakShot) {
        respotBall(state, 8);
        addLog(state, "La 8 se recoloca tras el saque.");
      } else {
        const correctPocket = shot.calledPocketId && pocketedEight.lastPocketId === shot.calledPocketId;
        if (!shot.canShootBlack || foulReason || !correctPocket) {
          finishRack(state, opponentIndex, `${state.players[opponentIndex].name} gana: 8 ilegal o en tronera incorrecta.`);
          return;
        }
        finishRack(state, shooterIndex, `${shooter.name} cierra la 8 en ${pocketLabel(shot.calledPocketId, state.locale) ?? "tronera cantada"}.`);
        return;
      }
    }
    if (!foulReason && shot.startTableOpen && !shot.breakShot) {
      const firstScoringBall = objectPocketed.find((ball) => ball.number !== 8);
      if (firstScoringBall && !shooter.group) {
        assignGroup(state, shooterIndex, ballGroupFromNumber(firstScoringBall.number));
      }
    }
    if (foulReason) {
      switchTurn(state, { ballInHand: true, restrictHeadString: false, reason: foulReason });
      return;
    }
    setTurnFoulCount(state, shooterIndex, false);
    if (shot.safetyDeclared) {
      switchTurn(state, { reason: `${opponent.name} entra tras safety declarado.` });
      return;
    }
    const activeGroup = state.players[shooterIndex].group;
    const ownPocketed = activeGroup ? objectPocketed.filter((ball) => ballMatchesGroup(ball, activeGroup)).length : 0;
    if (ownPocketed > 0) {
      continueTurn(state, { reason: `${shooter.name} sigue en mesa con ${ownPocketed} bola(s) de su grupo.` });
      return;
    }
    switchTurn(state, { reason: `${opponent.name} entra a mesa.` });
    return;
  }
  if (state.modeKey === "nine-ball") {
    if (pocketedNine && foulReason) {
      respotBall(state, 9);
    }
    if (foulReason) {
      setTurnFoulCount(state, shooterIndex, true);
      if (state.players[shooterIndex].foulsInRow >= 3) {
        finishRack(state, opponentIndex, `${opponent.name} gana por tres faltas consecutivas.`);
        return;
      }
      const warning = state.players[shooterIndex].foulsInRow === 2 ? ` ${shooter.name} queda avisado con dos faltas seguidas.` : "";
      switchTurn(state, { ballInHand: true, reason: `${foulReason}${warning}` });
      return;
    }
    setTurnFoulCount(state, shooterIndex, false);
    if (pocketedNine) {
      finishRack(state, shooterIndex, `${shooter.name} emboca la 9 y gana el rack.`);
      return;
    }
    if (shot.isPushOut) {
      queueTakeOrPassDecision(state, {
        type: "push-out-choice",
        chooserIndex: opponentIndex,
        returnToIndex: shooterIndex,
        prompt: `${opponent.name} decide tras push out.`,
        takeReason: `${opponent.name} acepta la mesa tras push out.`,
        passReason: `${opponent.name} devuelve el tiro a ${shooter.name}.`
      });
      resolvePendingDecisionIfAi(state);
      return;
    }
    if (shot.breakShot) {
      if (objectPocketed.length > 0) {
        continueTurn(state, { reason: `${shooter.name} mantiene la entrada. Push out disponible.`, pushOutAvailable: true });
      } else {
        switchTurn(state, { reason: `${opponent.name} entra con opcion de push out.`, pushOutAvailable: true });
      }
      return;
    }
    if (objectPocketed.length > 0) {
      continueTurn(state, { reason: `${shooter.name} mantiene la entrada.` });
      return;
    }
    switchTurn(state, { reason: `${opponent.name} toma el turno.` });
    return;
  }
  if (pocketedTen && foulReason) {
    respotBall(state, 10);
  }
  if (foulReason) {
    setTurnFoulCount(state, shooterIndex, true);
    if (state.players[shooterIndex].foulsInRow >= 3) {
      finishRack(state, opponentIndex, `${opponent.name} gana por tres faltas consecutivas.`);
      return;
    }
    const warning = state.players[shooterIndex].foulsInRow === 2 ? ` ${shooter.name} queda avisado con dos faltas seguidas.` : "";
    switchTurn(state, { ballInHand: true, reason: `${foulReason}${warning}` });
    return;
  }
  setTurnFoulCount(state, shooterIndex, false);
  if (shot.isPushOut) {
    queueTakeOrPassDecision(state, {
      type: "push-out-choice",
      chooserIndex: opponentIndex,
      returnToIndex: shooterIndex,
      prompt: `${opponent.name} decide tras push out.`,
      takeReason: `${opponent.name} acepta la mesa tras push out.`,
      passReason: `${opponent.name} devuelve el tiro a ${shooter.name}.`
    });
    resolvePendingDecisionIfAi(state);
    return;
  }
  if (shot.breakShot) {
    if (pocketedTen) {
      respotBall(state, 10);
    }
    if (objectPocketed.length > 0 || pocketedTen) {
      continueTurn(state, { reason: `${shooter.name} mantiene la entrada. Push out disponible.`, pushOutAvailable: true });
    } else {
      switchTurn(state, { reason: `${opponent.name} entra con opcion de push out.`, pushOutAvailable: true });
    }
    return;
  }
  const calledPocketId = shot.calledPocketId;
  const calledBallNumber = shot.calledBallNumber;
  const calledBallPocketed = objectPocketed.find((ball) => ball.number === calledBallNumber && calledPocketId && ball.lastPocketId === calledPocketId);
  const legalObjectPocketed = objectPocketed.some((ball) => ball.number === calledBallNumber);
  if (shot.safetyDeclared) {
    if (pocketedTen)
      respotBall(state, 10);
    if (legalObjectPocketed) {
      queueTakeOrPassDecision(state, {
        type: "ten-ball-return-choice",
        chooserIndex: opponentIndex,
        returnToIndex: shooterIndex,
        prompt: `${opponent.name} decide tras safety con bola legal embocada.`,
        takeReason: `${opponent.name} acepta la mesa tras safety.`,
        passReason: `${opponent.name} devuelve el tiro a ${shooter.name}.`
      });
      resolvePendingDecisionIfAi(state);
      return;
    }
    switchTurn(state, { reason: `${opponent.name} entra tras safety.` });
    return;
  }
  if (!calledBallPocketed) {
    if (pocketedTen)
      respotBall(state, 10);
    queueTakeOrPassDecision(state, {
      type: "ten-ball-return-choice",
      chooserIndex: opponentIndex,
      returnToIndex: shooterIndex,
      prompt: `${opponent.name} decide tras tiro cantado no valido.`,
      takeReason: `${opponent.name} acepta la mesa tras tiro no cantado.`,
      passReason: `${opponent.name} devuelve el tiro a ${shooter.name}.`
    });
    resolvePendingDecisionIfAi(state);
    return;
  }
  if (calledBallPocketed.number === 10) {
    if (remainingObjectBalls.length === 0) {
      finishRack(state, shooterIndex, `${shooter.name} emboca la 10 legalmente y gana el rack.`);
      return;
    }
    respotBall(state, 10);
    continueTurn(state, { reason: `${shooter.name} emboca la 10 antes de tiempo: se repone y sigue.` });
    return;
  }
  if (pocketedTen)
    respotBall(state, 10);
  continueTurn(state, { reason: `${shooter.name} mantiene la entrada con tiro cantado valido.` });
}
function markRailContact(state, ball) {
  if (!state.shot)
    return;
  if (state.shot.firstHitBallId) {
    state.shot.railAfterContact = true;
  }
  if (state.shot.breakShot && ball.number > 0) {
    state.shot.breakRailContacts.add(ball.id);
  }
}
function pocketBall(state, ball, pocketId) {
  if (ball.pocketed)
    return;
  ball.pocketed = true;
  ball.vx = 0;
  ball.vy = 0;
  ball.lastPocketId = pocketId;
  if (state.shot) {
    state.shot.pocketedIds.push(ball.id);
    if (ball.id === "cue") {
      state.shot.cuePocketed = true;
    } else {
      state.shot.railAfterContact = true;
    }
  }
}
function knockBallOffTable(state, ball) {
  if (ball.pocketed)
    return;
  ball.pocketed = true;
  ball.vx = 0;
  ball.vy = 0;
  ball.lastPocketId = "out";
  if (state.shot) {
    state.shot.pocketedIds.push(ball.id);
    state.shot.outOfTableIds.push(ball.id);
    if (ball.id === "cue") {
      state.shot.cuePocketed = true;
    } else {
      state.shot.railAfterContact = true;
    }
  }
}
function rayCircleIntersection(originX, originY, dirX, dirY, centerX, centerY, radius) {
  const ox = originX - centerX;
  const oy = originY - centerY;
  const b = 2 * (ox * dirX + oy * dirY);
  const c = ox * ox + oy * oy - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0)
    return null;
  const root = Math.sqrt(discriminant);
  const t1 = (-b - root) / 2;
  const t2 = (-b + root) / 2;
  if (t1 > 0)
    return t1;
  if (t2 > 0)
    return t2;
  return null;
}
function getAimPreview(state) {
  const cueBall = getCueBall(state);
  if (!cueBall || cueBall.pocketed)
    return null;
  const dirX = Math.cos(state.cueControl.angle);
  const dirY = Math.sin(state.cueControl.angle);
  let hit = null;
  state.balls.forEach((ball) => {
    if (ball.id === "cue" || ball.pocketed)
      return;
    const t = rayCircleIntersection(cueBall.x, cueBall.y, dirX, dirY, ball.x, ball.y, BALL_DIAMETER * 0.96);
    if (t != null && (!hit || t < hit.t)) {
      hit = { t, ball };
    }
  });
  const tBounds = [];
  if (dirX > 0)
    tBounds.push((PLAY_RIGHT - cueBall.x) / dirX);
  if (dirX < 0)
    tBounds.push((PLAY_LEFT - cueBall.x) / dirX);
  if (dirY > 0)
    tBounds.push((PLAY_BOTTOM - cueBall.y) / dirY);
  if (dirY < 0)
    tBounds.push((PLAY_TOP - cueBall.y) / dirY);
  const wallT = tBounds.filter((value) => value > 0).sort((a, b) => a - b)[0] ?? 160;
  const distanceToUse = hit ? Math.min(hit.t, wallT) : wallT;
  return {
    x1: cueBall.x,
    y1: cueBall.y,
    x2: cueBall.x + dirX * distanceToUse,
    y2: cueBall.y + dirY * distanceToUse,
    hitBall: hit?.ball ?? null
  };
}
function updatePhysics(state, dt) {
  const hasPockets = modeHasPockets(state.modeKey);
  const activeBalls = getActiveBalls(state);
  activeBalls.forEach((ball) => {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
  });
  for (const ball of activeBalls) {
    const outMargin = BALL_DIAMETER * 1.8;
    if (ball.x < PLAY_LEFT - outMargin || ball.x > PLAY_RIGHT + outMargin || ball.y < PLAY_TOP - outMargin || ball.y > PLAY_BOTTOM + outMargin) {
      knockBallOffTable(state, ball);
      continue;
    }
    if (hasPockets) {
      const pocket = POCKETS.find((entry) => distance(ball.x, ball.y, entry.x, entry.y) < entry.radius - (ball.id === "cue" ? 3 : 1));
      if (pocket) {
        pocketBall(state, ball, pocket.id);
        continue;
      }
    }
    const nearCornerY = Math.abs(ball.y - PLAY_TOP) < 48 || Math.abs(ball.y - PLAY_BOTTOM) < 48;
    const canBounceVerticalRail = !hasPockets || !nearCornerY;
    if (ball.x - BALL_RADIUS <= PLAY_LEFT && canBounceVerticalRail) {
      ball.x = PLAY_LEFT + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * RESTITUTION;
      markRailContact(state, ball);
    }
    if (ball.x + BALL_RADIUS >= PLAY_RIGHT && canBounceVerticalRail) {
      ball.x = PLAY_RIGHT - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * RESTITUTION;
      markRailContact(state, ball);
    }
    const nearCornerX = Math.abs(ball.x - PLAY_LEFT) < 52 || Math.abs(ball.x - PLAY_RIGHT) < 52;
    const nearSideX = Math.abs(ball.x - TABLE_CENTER_X) < 42;
    const canBounceHorizontalRail = !hasPockets || !(nearCornerX || nearSideX);
    if (ball.y - BALL_RADIUS <= PLAY_TOP && canBounceHorizontalRail) {
      ball.y = PLAY_TOP + BALL_RADIUS;
      ball.vy = Math.abs(ball.vy) * RESTITUTION;
      markRailContact(state, ball);
    }
    if (ball.y + BALL_RADIUS >= PLAY_BOTTOM && canBounceHorizontalRail) {
      ball.y = PLAY_BOTTOM - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * RESTITUTION;
      markRailContact(state, ball);
    }
  }
  for (let i = 0; i < activeBalls.length; i += 1) {
    const ballA = activeBalls[i];
    if (ballA.pocketed)
      continue;
    for (let j = i + 1; j < activeBalls.length; j += 1) {
      const ballB = activeBalls[j];
      if (ballB.pocketed)
        continue;
      const dx = ballB.x - ballA.x;
      const dy = ballB.y - ballA.y;
      const distanceBetween = Math.hypot(dx, dy);
      if (distanceBetween <= 0 || distanceBetween >= BALL_DIAMETER)
        continue;
      const nx = dx / distanceBetween;
      const ny = dy / distanceBetween;
      const overlap = BALL_DIAMETER - distanceBetween;
      ballA.x -= nx * overlap * 0.5;
      ballA.y -= ny * overlap * 0.5;
      ballB.x += nx * overlap * 0.5;
      ballB.y += ny * overlap * 0.5;
      const relativeVelocity = (ballB.vx - ballA.vx) * nx + (ballB.vy - ballA.vy) * ny;
      if (relativeVelocity < 0) {
        const impulse = -(1 + RESTITUTION) * relativeVelocity * 0.5;
        ballA.vx -= impulse * nx;
        ballA.vy -= impulse * ny;
        ballB.vx += impulse * nx;
        ballB.vy += impulse * ny;
      }
      if (state.shot && !state.shot.firstHitBallId) {
        if (ballA.id === "cue" && ballB.number > 0) {
          state.shot.firstHitBallId = ballB.id;
        }
        if (ballB.id === "cue" && ballA.number > 0) {
          state.shot.firstHitBallId = ballA.id;
        }
      }
      if (state.shot) {
        if (ballA.id === "cue" && ballB.number > 0 && !state.shot.cueObjectHitOrder.includes(ballB.id)) {
          state.shot.cueObjectHitOrder.push(ballB.id);
        }
        if (ballB.id === "cue" && ballA.number > 0 && !state.shot.cueObjectHitOrder.includes(ballA.id)) {
          state.shot.cueObjectHitOrder.push(ballA.id);
        }
      }
    }
  }
  state.balls.forEach((ball) => {
    if (ball.pocketed)
      return;
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed <= STOP_SPEED) {
      ball.vx = 0;
      ball.vy = 0;
      return;
    }
    const nextSpeed = Math.max(0, speed - ROLL_DECEL * dt);
    const ratio = nextSpeed / speed;
    ball.vx *= ratio;
    ball.vy *= ratio;
  });
  const allStopped = state.balls.every((ball) => ball.pocketed || Math.hypot(ball.vx, ball.vy) <= STOP_SPEED);
  if (allStopped) {
    state.balls.forEach((ball) => {
      ball.vx = 0;
      ball.vy = 0;
    });
    evaluateShot(state);
  }
}
function createAiPlanPreview(plan, forcePushOut, useSafety, calledPocketId, targetPower) {
  return {
    type: plan.type,
    route: plan.route,
    ballNumber: plan.ballNumber ?? null,
    pocketId: calledPocketId ?? plan.pocketId ?? null,
    power: Number(targetPower.toFixed(2)),
    score: Number((plan.tacticalScore ?? plan.score).toFixed(1)),
    forcePushOut,
    safety: useSafety
  };
}
function buildAiRoutine(state) {
  const cueBall = getCueBall(state);
  if (!cueBall)
    return null;
  const difficulty = DIFFICULTY_PRESETS[state.difficultyKey];
  const hasBallInHand = state.ballInHand.active;
  const placement = hasBallInHand ? chooseAiPlacement(state, state.currentPlayer, state.ballInHand.restrictHeadString) : null;
  const shotX = placement?.x ?? cueBall.x;
  const shotY = placement?.y ?? cueBall.y;
  const canPushOut = state.pushOutAvailable && supportsPushOut(state.modeKey);
  let forcePushOut = false;
  let plan = chooseAiPlan(state, state.currentPlayer, shotX, shotY);
  if (canPushOut) {
    const directPlans = choosePocketPlans(state, state.currentPlayer, shotX, shotY);
    const bestScore = directPlans[0]?.score ?? Number.POSITIVE_INFINITY;
    forcePushOut = directPlans.length === 0 || bestScore > difficulty.pushOutScoreThreshold;
    if (forcePushOut) {
      plan = chooseFallbackPlan(state, state.currentPlayer, shotX, shotY);
    }
  }
  if (!plan)
    return null;
  const calledPocketId = needsPocketCall(state, state.currentPlayer) && !forcePushOut ? plan.pocketId ?? POCKETS[0].id : null;
  const useSafety = shouldAiDeclareSafety(state, plan, difficulty, forcePushOut);
  const targetPower = forcePushOut ? clamp(plan.power * 0.62, 0.22, 0.56) : plan.power;
  const steps = [];
  if (hasBallInHand && placement) {
    steps.push({
      kind: "auto-place",
      durationMs: scaleAiDuration(Math.max(170, Math.round(difficulty.thinkMs * 0.35))),
      x: placement.x,
      y: placement.y
    });
  }
  if (calledPocketId) {
    steps.push({
      kind: "set-pocket",
      durationMs: scaleAiDuration(Math.max(110, Math.round(difficulty.thinkMs * 0.2))),
      pocketId: calledPocketId
    });
  }
  steps.push({
    kind: "adjust-aim",
    durationMs: scaleAiDuration(Math.max(140, Math.round(difficulty.thinkMs * 0.28))),
    targetAngle: plan.angle
  });
  steps.push({
    kind: "adjust-power",
    durationMs: scaleAiDuration(Math.max(130, Math.round(difficulty.thinkMs * 0.24))),
    targetPower
  });
  if (forcePushOut) {
    steps.push({ kind: "push-out", durationMs: scaleAiDuration(110) });
  } else if (useSafety) {
    steps.push({ kind: "safety", durationMs: scaleAiDuration(110) });
  }
  steps.push({ kind: "shoot", durationMs: scaleAiDuration(95) });
  state.aiPlanPreview = createAiPlanPreview(plan, forcePushOut, useSafety, calledPocketId, targetPower);
  return {
    plan,
    placement,
    calledPocketId,
    forcePushOut,
    useSafety,
    targetAngle: plan.angle,
    targetPower,
    steps,
    stepIndex: 0,
    stepElapsedMs: 0
  };
}
function executeAiShot(state, routine) {
  const cueBall = getCueBall(state);
  if (!cueBall) {
    clearAiTelemetry(state);
    return;
  }
  if (state.ballInHand.active) {
    state.ballInHand = { active: false, restrictHeadString: false };
  }
  if (needsPocketCall(state, state.currentPlayer) && !routine.forcePushOut && !state.calledPocketId) {
    state.calledPocketId = routine.calledPocketId ?? POCKETS[0].id;
  }
  state.cueControl.angle = routine.targetAngle;
  state.cueControl.power = routine.targetPower;
  const speed = lerp(280, state.breakShot ? 1700 : 1460, clamp(routine.targetPower, 0.18, 1));
  cueBall.vx = Math.cos(routine.targetAngle) * speed;
  cueBall.vy = Math.sin(routine.targetAngle) * speed;
  state.phase = "moving";
  state.shotCount += 1;
  state.shot = createShotContext(state, state.currentPlayer, {
    calledPocketId: routine.forcePushOut ? null : state.calledPocketId,
    isPushOut: routine.forcePushOut,
    safetyDeclared: routine.useSafety
  });
  state.pushOutAvailable = false;
  state.pendingDecision = null;
  state.safetyDeclared = false;
  state.aiRoutine = null;
  setAiTelemetry(state, AI_ACTION_LABELS.shoot, { shoot: true });
  if (routine.forcePushOut) {
    addLog(state, `${state.players[state.currentPlayer].name} declara push out.`);
  } else if (routine.useSafety) {
    addLog(state, `${state.players[state.currentPlayer].name} juega un safety.`);
  } else {
    const shotType = routine.plan.type === "pot" ? "a tronera" : routine.plan.type === "kick" ? "con trayectoria alternativa por banda" : "de seguridad";
    addLog(state, `${state.players[state.currentPlayer].name} tira ${shotType}.`);
  }
}
function startAiStep(state, step) {
  step.started = true;
  if (step.kind === "auto-place") {
    const cueBall = getCueBall(state);
    step.startX = cueBall?.x ?? step.x;
    step.startY = cueBall?.y ?? step.y;
    setAiTelemetry(state, AI_ACTION_LABELS.autoPlace, { autoPlace: true });
    return;
  }
  if (step.kind === "set-pocket") {
    state.calledPocketId = step.pocketId;
    setAiTelemetry(state, AI_ACTION_LABELS.setPocket, { pocket: true });
    return;
  }
  if (step.kind === "adjust-aim") {
    step.startAngle = state.cueControl.angle;
    setAiTelemetry(state, AI_ACTION_LABELS.adjustAim, { aim: true });
    return;
  }
  if (step.kind === "adjust-power") {
    step.startPower = state.cueControl.power;
    setAiTelemetry(state, AI_ACTION_LABELS.adjustPower, { power: true });
    return;
  }
  if (step.kind === "push-out") {
    setAiTelemetry(state, AI_ACTION_LABELS.pushOut, { pushOut: true });
    return;
  }
  if (step.kind === "safety") {
    state.safetyDeclared = true;
    setAiTelemetry(state, AI_ACTION_LABELS.safety, { safety: true });
    return;
  }
  setAiTelemetry(state, AI_ACTION_LABELS.shoot, { shoot: true });
}
function applyAiStepProgress(state, step, progress) {
  if (step.kind === "auto-place") {
    const cueBall = getCueBall(state);
    if (!cueBall)
      return;
    cueBall.x = lerp(step.startX, step.x, progress);
    cueBall.y = lerp(step.startY, step.y, progress);
    cueBall.pocketed = false;
    cueBall.vx = 0;
    cueBall.vy = 0;
    return;
  }
  if (step.kind === "adjust-aim") {
    state.cueControl.angle = lerpAngle(step.startAngle, step.targetAngle, progress);
    return;
  }
  if (step.kind === "adjust-power") {
    state.cueControl.power = clamp(lerp(step.startPower, step.targetPower, progress), 0.18, 1);
  }
}
function completeAiStep(state, routine, step) {
  if (step.kind === "auto-place") {
    const cueBall = getCueBall(state);
    if (cueBall) {
      cueBall.x = step.x;
      cueBall.y = step.y;
      cueBall.pocketed = false;
      cueBall.vx = 0;
      cueBall.vy = 0;
    }
    state.ballInHand = { active: false, restrictHeadString: false };
    return false;
  }
  if (step.kind === "set-pocket") {
    state.calledPocketId = step.pocketId;
    return false;
  }
  if (step.kind === "adjust-aim") {
    state.cueControl.angle = step.targetAngle;
    return false;
  }
  if (step.kind === "adjust-power") {
    state.cueControl.power = step.targetPower;
    return false;
  }
  if (step.kind === "shoot") {
    executeAiShot(state, routine);
    return true;
  }
  return false;
}
function updateAi(state, dt) {
  if (state.pendingDecision) {
    resolvePendingDecisionIfAi(state);
    return;
  }
  if (state.aiTimerMs > 0) {
    state.aiTimerMs -= dt * 1e3;
    setAiTelemetry(state, AI_ACTION_LABELS.scan);
    return;
  }
  if (!state.aiRoutine) {
    state.aiRoutine = buildAiRoutine(state);
    if (!state.aiRoutine) {
      switchTurn(state, { reason: "La IA no encontro tiro claro y cede la mesa." });
      return;
    }
  }
  const step = state.aiRoutine.steps[state.aiRoutine.stepIndex];
  if (!step) {
    executeAiShot(state, state.aiRoutine);
    return;
  }
  if (!step.started) {
    startAiStep(state, step);
  }
  const durationMs = Math.max(40, step.durationMs || 100);
  state.aiRoutine.stepElapsedMs += dt * 1e3;
  const progress = clamp(state.aiRoutine.stepElapsedMs / durationMs, 0, 1);
  applyAiStepProgress(state, step, progress);
  if (progress >= 1) {
    const finishedShot = completeAiStep(state, state.aiRoutine, step);
    if (finishedShot)
      return;
    state.aiRoutine.stepIndex += 1;
    state.aiRoutine.stepElapsedMs = 0;
  }
}
function advanceSimulation(state, milliseconds) {
  const safeMs = clamp(milliseconds, 0, 4e3);
  let remaining = safeMs / 1e3;
  while (remaining > 0) {
    const step = Math.min(FIXED_DT, remaining);
    if (state.phase === "moving") {
      updatePhysics(state, step);
    } else if (state.phase === "ai-thinking") {
      updateAi(state, step);
    }
    remaining -= step;
  }
}
function drawTable(ctx, state, preview, placementGhost) {
  ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  const ambient = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
  ambient.addColorStop(0, "#2a180e");
  ambient.addColorStop(1, "#140d07");
  ctx.fillStyle = ambient;
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  const wood = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
  wood.addColorStop(0, "#8b5a2b");
  wood.addColorStop(0.45, "#5f3417");
  wood.addColorStop(1, "#3c2213");
  ctx.fillStyle = wood;
  drawRoundedRect(ctx, 28, 24, TABLE_WIDTH - 56, TABLE_HEIGHT - 48, 34);
  ctx.fill();
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  drawRoundedRect(ctx, 48, 44, TABLE_WIDTH - 96, TABLE_HEIGHT - 88, 26);
  ctx.fill();
  const felt = ctx.createLinearGradient(PLAY_LEFT, PLAY_TOP, PLAY_RIGHT, PLAY_BOTTOM);
  felt.addColorStop(0, "#0d7f55");
  felt.addColorStop(0.5, "#0f6f4c");
  felt.addColorStop(1, "#09593d");
  ctx.fillStyle = felt;
  drawRoundedRect(ctx, PLAY_LEFT - 10, PLAY_TOP - 10, PLAY_RIGHT - PLAY_LEFT + 20, PLAY_BOTTOM - PLAY_TOP + 20, 24);
  ctx.fill();
  const sheen = ctx.createRadialGradient(TABLE_CENTER_X - 120, TABLE_CENTER_Y - 90, 40, TABLE_CENTER_X, TABLE_CENTER_Y, 360);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(PLAY_LEFT - 10, PLAY_TOP - 10, PLAY_RIGHT - PLAY_LEFT + 20, PLAY_BOTTOM - PLAY_TOP + 20);
  ctx.strokeStyle = "rgba(229, 231, 235, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(HEAD_STRING_X, PLAY_TOP + 18);
  ctx.lineTo(HEAD_STRING_X, PLAY_BOTTOM - 18);
  ctx.stroke();
  ctx.fillStyle = "rgba(248, 250, 252, 0.34)";
  ctx.beginPath();
  ctx.arc(FOOT_SPOT_X, TABLE_CENTER_Y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(HEAD_STRING_X, TABLE_CENTER_Y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(250, 204, 21, 0.52)";
  for (let i = 1; i <= 7; i += 1) {
    const x = PLAY_LEFT + (PLAY_RIGHT - PLAY_LEFT) / 8 * i;
    const yTop = PLAY_TOP - 24;
    const yBottom = PLAY_BOTTOM + 24;
    ctx.beginPath();
    ctx.moveTo(x, yTop - 5);
    ctx.lineTo(x + 5, yTop);
    ctx.lineTo(x, yTop + 5);
    ctx.lineTo(x - 5, yTop);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, yBottom - 5);
    ctx.lineTo(x + 5, yBottom);
    ctx.lineTo(x, yBottom + 5);
    ctx.lineTo(x - 5, yBottom);
    ctx.closePath();
    ctx.fill();
  }
  if (modeHasPockets(state.modeKey)) {
    POCKETS.forEach((pocket) => {
      const selected = state.calledPocketId === pocket.id;
      ctx.beginPath();
      ctx.fillStyle = selected ? "#fde68a" : "#05080f";
      ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
      ctx.fill();
      if (selected) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(250, 204, 21, 0.8)";
        ctx.lineWidth = 3;
        ctx.arc(pocket.x, pocket.y, pocket.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
  if (preview) {
    const aiGuide = state.phase === "ai-thinking" && state.players[state.currentPlayer]?.type === "ai";
    const legal = preview.hitBall ? getLegalNumbers(state, state.currentPlayer).includes(preview.hitBall.number) : false;
    ctx.strokeStyle = aiGuide ? "rgba(250, 204, 21, 0.94)" : legal ? "rgba(125, 211, 252, 0.86)" : "rgba(248, 113, 113, 0.72)";
    ctx.lineWidth = aiGuide ? 4.2 : 2.4;
    ctx.setLineDash(aiGuide ? [14, 6] : [10, 8]);
    ctx.beginPath();
    ctx.moveTo(preview.x1, preview.y1);
    ctx.lineTo(preview.x2, preview.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (preview.hitBall) {
      ctx.beginPath();
      ctx.strokeStyle = aiGuide ? "rgba(250, 204, 21, 0.98)" : legal ? "rgba(125, 211, 252, 0.9)" : "rgba(248, 113, 113, 0.82)";
      ctx.lineWidth = aiGuide ? 3 : 2;
      ctx.arc(preview.hitBall.x, preview.hitBall.y, BALL_RADIUS + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (placementGhost) {
    ctx.save();
    ctx.globalAlpha = placementGhost.valid ? 0.58 : 0.32;
    ctx.fillStyle = placementGhost.valid ? "#f8fafc" : "#f87171";
    ctx.beginPath();
    ctx.arc(placementGhost.x, placementGhost.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const activeBalls = state.balls.filter((ball) => !ball.pocketed).sort((a, b) => {
    if (a.id === "cue")
      return -1;
    if (b.id === "cue")
      return 1;
    return a.number - b.number;
  });
  activeBalls.forEach((ball) => {
    ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
    ctx.beginPath();
    ctx.ellipse(ball.x + 3, ball.y + 5, BALL_RADIUS * 0.96, BALL_RADIUS * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    if (ball.id === "cue") {
      const cueGradient = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, BALL_RADIUS + 3);
      cueGradient.addColorStop(0, "#ffffff");
      cueGradient.addColorStop(1, "#d7dee8");
      ctx.fillStyle = cueGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      return;
    }
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ball.stripe ? "#f8fafc" : ball.color;
    ctx.fill();
    if (ball.stripe) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = ball.color;
      ctx.fillRect(ball.x - BALL_RADIUS, ball.y - BALL_RADIUS * 0.48, BALL_DIAMETER, BALL_RADIUS * 0.96);
      ctx.restore();
    }
    const glossy = ctx.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, BALL_RADIUS + 2);
    glossy.addColorStop(0, "rgba(255, 255, 255, 0.42)");
    glossy.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glossy;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(15, 23, 42, 0.32)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = `${ball.number >= 10 ? 8 : 9}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(ball.number), ball.x, ball.y + 0.5);
  });
  const cueBall = getCueBall(state);
  if ((state.phase === "aim" || state.phase === "placing") && cueBall && !cueBall.pocketed) {
    const backAngle = state.cueControl.angle + Math.PI;
    const cueLength = 162 + state.cueControl.power * 118;
    const startX = cueBall.x + Math.cos(backAngle) * (BALL_RADIUS + 8 + state.cueControl.power * 14);
    const startY = cueBall.y + Math.sin(backAngle) * (BALL_RADIUS + 8 + state.cueControl.power * 14);
    const endX = cueBall.x + Math.cos(backAngle) * cueLength;
    const endY = cueBall.y + Math.sin(backAngle) * cueLength;
    const cueGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    cueGradient.addColorStop(0, "#f4d3a2");
    cueGradient.addColorStop(0.5, "#bb7a37");
    cueGradient.addColorStop(1, "#5b3415");
    ctx.strokeStyle = cueGradient;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}
function buildSnapshot(state) {
  const locale = state.locale ?? "es";
  const cueBall = getCueBall(state);
  const legalNumbers = getLegalNumbers(state, state.currentPlayer);
  return {
    locale,
    mode: "billiards_pool",
    variant: state.modeKey,
    status: state.phase,
    statusLabel: statusLabel(state.phase, locale),
    participantCount: state.participantCount ?? 2,
    hasPockets: modeHasPockets(state.modeKey),
    coordinates: "origin_top_left_x_right_y_down_table_pixels",
    modeLabel: modeLabel(state.modeKey, locale),
    difficultyKey: state.difficultyKey,
    difficultyLabel: difficultyLabel(state.difficultyKey, locale),
    raceTo: state.raceTo,
    currentPlayer: state.currentPlayer,
    currentPlayerName: localizePlayerName(state.players[state.currentPlayer]?.name ?? "-", locale),
    breakerIndex: state.breakerIndex,
    nextBreaker: state.nextBreaker,
    tableOpen: state.tableOpen,
    breakShot: state.breakShot,
    pushOutAvailable: state.pushOutAvailable,
    ballInHand: state.ballInHand.active,
    restrictHeadString: state.ballInHand.restrictHeadString,
    safetyDeclared: state.safetyDeclared,
    calledPocketId: state.calledPocketId,
    calledPocketLabel: pocketLabel(state.calledPocketId, locale),
    needsPocketCall: needsPocketCall(state, state.currentPlayer),
    pendingDecision: state.pendingDecision ? {
      type: state.pendingDecision.type,
      chooserIndex: state.pendingDecision.chooserIndex,
      prompt: localizeRuntimeText(state.pendingDecision.prompt, locale),
      options: state.pendingDecision.options.map((option) => ({
        ...option,
        label: localizeRuntimeText(option.label, locale)
      }))
    } : null,
    canDeclarePushOut: state.phase === "aim" && state.currentPlayer === PLAYER_HUMAN && state.pushOutAvailable && supportsPushOut(state.modeKey),
    canDeclareSafety: state.phase === "aim" && state.currentPlayer === PLAYER_HUMAN && !state.breakShot && supportsSafetyCall(state.modeKey),
    legalTargets: legalNumbers,
    lowestBall: getLowestNumber(state),
    cueControl: {
      angleRadians: state.cueControl.angle,
      angleDegrees: Math.round(state.cueControl.angle * 180 / Math.PI),
      power: Number(state.cueControl.power.toFixed(2))
    },
    ai: {
      action: localizeRuntimeText(state.aiAction, locale),
      leds: state.aiLeds,
      planPreview: state.aiPlanPreview,
      thinking: state.phase === "ai-thinking"
    },
    players: state.players.map((player, index) => {
      const targetBall = player.kellyTarget != null ? state.balls.find((ball) => ball.number === player.kellyTarget) : null;
      return {
        name: localizePlayerName(player.name, locale),
        type: player.type,
        group: player.group,
        groupLabel: groupLabel(player.group, locale),
        kellyTarget: player.kellyTarget ?? null,
        kellyTargetPocketed: targetBall ? targetBall.pocketed : null,
        remainingGroupBalls: countRemainingGroupBalls(state, index),
        racksWon: player.racksWon,
        foulsInRow: player.foulsInRow
      };
    }),
    cueBall: cueBall ? {
      x: Number(cueBall.x.toFixed(1)),
      y: Number(cueBall.y.toFixed(1)),
      vx: Number(cueBall.vx.toFixed(1)),
      vy: Number(cueBall.vy.toFixed(1)),
      pocketed: cueBall.pocketed
    } : null,
    balls: state.balls.filter((ball) => ball.number > 0).map((ball) => ({
      id: ball.id,
      number: ball.number,
      group: ballGroupFromNumber(ball.number),
      x: Number(ball.x.toFixed(1)),
      y: Number(ball.y.toFixed(1)),
      vx: Number(ball.vx.toFixed(1)),
      vy: Number(ball.vy.toFixed(1)),
      pocketed: ball.pocketed,
      lastPocketId: ball.lastPocketId
    })),
    rackWinner: state.rackWinner,
    matchWinner: state.matchWinner,
    shotCount: state.shotCount,
    message: localizeRuntimeText(state.message, locale),
    log: state.log.map((entry) => localizeRuntimeText(entry, locale)),
    controls: {
      keyboard: locale === "es" ? "A/D (o flechas) giran en apuntado, W/S potencia, en blanca en mano flechas/WASD mueven bola, Enter/Space confirman o tiran, P autocoloca, O push out, V safety, R reinicia rack, N siguiente, F fullscreen" : "A/D (or arrows) adjust aim, W/S adjust power, with ball in hand arrows/WASD move the cue ball, Enter/Space confirm or shoot, P auto-places, O push out, V safety, R restarts rack, N next rack, F fullscreen.",
      mouse: locale === "es" ? "Mueve para apuntar y clic para colocar blanca en mano si lo prefieres" : "Move to aim and click to place cue ball in hand if needed.",
      touch: locale === "es" ? "Usa los botones tactiles de apuntado/potencia y Tirar." : "Use on-screen aim/power controls and Shoot."
    }
  };
}
function eventToWorld(canvas, event, options = {}) {
  const { rotateTable = false } = options;
  const rect = canvas.getBoundingClientRect();
  const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;
  if (!source)
    return null;
  const normalizedX = clamp((source.clientX - rect.left) / rect.width, 0, 1);
  const normalizedY = clamp((source.clientY - rect.top) / rect.height, 0, 1);
  if (rotateTable) {
    return {
      x: (1 - normalizedY) * TABLE_WIDTH,
      y: normalizedX * TABLE_HEIGHT
    };
  }
  return {
    x: normalizedX * TABLE_WIDTH,
    y: normalizedY * TABLE_HEIGHT
  };
}
function readMobileViewport() {
  if (typeof window === "undefined")
    return { isMobile: false, isPortrait: false };
  const width = Math.max(window.innerWidth || 0, document.documentElement?.clientWidth || 0);
  const height = Math.max(window.innerHeight || 0, document.documentElement?.clientHeight || 0);
  return { isMobile: width <= 920, isPortrait: height >= width };
}
function createRuntime({ canvas, onSnapshot, onFullscreenRequest, isTableRotated = () => false, locale = resolveLocale() }) {
  const ctx = canvas.getContext("2d");
  const runtime = {
    canvas,
    ctx,
    state: createRuntimeState("eight-ball", "club", locale, 2),
    pointer: { x: TABLE_CENTER_X, y: TABLE_CENTER_Y, active: false },
    lastFrame: 0,
    rafId: 0,
    publish() {
      onSnapshot(buildSnapshot(this.state));
    },
    draw() {
      const preview = this.state.phase === "aim" || this.state.phase === "placing" || this.state.phase === "ai-thinking" ? getAimPreview(this.state) : null;
      const placementGhost = this.state.phase === "placing" && this.pointer.active ? {
        x: this.pointer.x,
        y: this.pointer.y,
        valid: isCuePlacementValid(this.state, this.pointer.x, this.pointer.y, this.state.ballInHand.restrictHeadString)
      } : null;
      drawTable(ctx, this.state, preview, placementGhost);
    },
    refresh() {
      this.publish();
      this.draw();
    },
    resetToMenu(modeKey = this.state.modeKey, difficultyKey = this.state.difficultyKey, participantCount = this.state.participantCount ?? 2) {
      this.state = createRuntimeState(modeKey, difficultyKey, this.state.locale ?? locale, participantCount);
      this.refresh();
    },
    startMatch() {
      const nextState = createRuntimeState(
        this.state.modeKey,
        this.state.difficultyKey,
        this.state.locale ?? locale,
        this.state.participantCount ?? 2
      );
      startRack(nextState, PLAYER_HUMAN);
      this.state = nextState;
      this.refresh();
    },
    restartRack() {
      if (this.state.phase === "menu") {
        this.startMatch();
        return;
      }
      const wins = cloneWins(this.state.players);
      const nextState = createRuntimeState(
        this.state.modeKey,
        this.state.difficultyKey,
        this.state.locale ?? locale,
        this.state.participantCount ?? 2
      );
      nextState.players.forEach((player, index) => {
        player.racksWon = wins[index];
      });
      startRack(nextState, this.state.breakerIndex);
      this.state = nextState;
      this.refresh();
    },
    nextRack() {
      if (!(this.state.phase === "rack-over" || this.state.phase === "match-over"))
        return;
      if (this.state.phase === "match-over") {
        this.resetToMenu();
        return;
      }
      const wins = cloneWins(this.state.players);
      const nextState = createRuntimeState(
        this.state.modeKey,
        this.state.difficultyKey,
        this.state.locale ?? locale,
        this.state.participantCount ?? 2
      );
      nextState.players.forEach((player, index) => {
        player.racksWon = wins[index];
      });
      startRack(nextState, this.state.nextBreaker);
      this.state = nextState;
      this.refresh();
    },
    setMode(modeKey) {
      if (this.state.phase !== "menu")
        return;
      if (!MODE_PRESETS[modeKey])
        return;
      const participantCount = isKellyMode(modeKey) ? this.state.participantCount ?? 2 : 2;
      this.resetToMenu(modeKey, this.state.difficultyKey, participantCount);
    },
    setParticipantCount(participantCount) {
      if (this.state.phase !== "menu")
        return;
      const normalized = clamp(Math.round(Number(participantCount) || 2), 2, 15);
      const nextCount = isKellyMode(this.state.modeKey) ? normalized : 2;
      this.resetToMenu(this.state.modeKey, this.state.difficultyKey, nextCount);
    },
    setDifficulty(difficultyKey) {
      if (this.state.phase !== "menu")
        return;
      if (!DIFFICULTY_PRESETS[difficultyKey])
        return;
      const localeKey = this.state.locale ?? locale;
      this.state.difficultyKey = difficultyKey;
      if (isKellyMode(this.state.modeKey)) {
        this.state.players.forEach((player, index) => {
          if (index === PLAYER_HUMAN) {
            player.name = localeKey === "es" ? "Tu" : "You";
          } else {
            player.name = `${localeKey === "es" ? "IA" : "AI"} ${index}`;
          }
        });
      } else {
        this.state.players[PLAYER_AI].name = `${localeKey === "es" ? "IA" : "AI"} ${difficultyLabel(difficultyKey, localeKey)}`;
      }
      if (this.state.phase === "menu") {
        addLog(this.state, localeKey === "es" ? `Dificultad ${difficultyLabel(difficultyKey, localeKey)}.` : `Difficulty ${difficultyLabel(difficultyKey, localeKey)}.`);
      }
      this.refresh();
    },
    setCalledPocket(pocketId) {
      if (!POCKETS.some((pocket) => pocket.id === pocketId))
        return;
      this.state.calledPocketId = pocketId;
      const localeKey = this.state.locale ?? locale;
      addLog(this.state, localeKey === "es" ? `Tronera cantada: ${pocketLabel(pocketId, localeKey)}.` : `Called pocket: ${pocketLabel(pocketId, localeKey)}.`);
      this.refresh();
    },
    toggleSafety() {
      if (this.state.phase !== "aim" || this.state.currentPlayer !== PLAYER_HUMAN)
        return;
      if (!supportsSafetyCall(this.state.modeKey) || this.state.breakShot)
        return;
      this.state.safetyDeclared = !this.state.safetyDeclared;
      addLog(this.state, this.state.safetyDeclared ? "Safety declarado para el proximo tiro." : "Safety cancelado.");
      this.refresh();
    },
    adjustAim(delta) {
      if (this.state.phase !== "aim")
        return;
      this.state.cueControl.angle = normalizeAngle(this.state.cueControl.angle + delta);
      this.refresh();
    },
    adjustPower(delta) {
      if (!(this.state.phase === "aim" || this.state.phase === "placing"))
        return;
      this.state.cueControl.power = clamp(this.state.cueControl.power + delta, 0.18, 1);
      this.refresh();
    },
    autoPlaceCueBall() {
      if (!this.state.ballInHand.active || this.state.currentPlayer !== PLAYER_HUMAN)
        return;
      prepareCueBallForPlacement(this.state, this.state.ballInHand.restrictHeadString);
      this.state.ballInHand = { active: false, restrictHeadString: false };
      this.state.phase = "aim";
      setCueControlForTurn(this.state);
      addLog(this.state, "Blanca colocada automaticamente.");
      this.refresh();
    },
    confirmCuePlacement(source = "teclado") {
      if (!this.state.ballInHand.active || this.state.currentPlayer !== PLAYER_HUMAN || this.state.phase !== "placing")
        return;
      this.state.ballInHand = { active: false, restrictHeadString: false };
      this.state.phase = "aim";
      setCueControlForTurn(this.state);
      addLog(this.state, source === "teclado" ? "Blanca en mano fijada con teclado." : "Blanca en mano colocada.");
      this.refresh();
    },
    nudgeCueBall(dx, dy) {
      if (!this.state.ballInHand.active || this.state.currentPlayer !== PLAYER_HUMAN || this.state.phase !== "placing")
        return;
      const cueBall = getCueBall(this.state);
      if (!cueBall)
        return;
      const restrict = this.state.ballInHand.restrictHeadString;
      const xMax = restrict ? HEAD_STRING_X - BALL_RADIUS - 2 : PLAY_RIGHT - BALL_RADIUS - 2;
      let nextX = clamp(cueBall.x + dx, PLAY_LEFT + BALL_RADIUS + 2, xMax);
      let nextY = clamp(cueBall.y + dy, PLAY_TOP + BALL_RADIUS + 2, PLAY_BOTTOM - BALL_RADIUS - 2);
      if (!isCuePlacementValid(this.state, nextX, nextY, restrict)) {
        const fallback = findNearestPlacement(this.state, nextX, nextY, restrict);
        if (!isCuePlacementValid(this.state, fallback.x, fallback.y, restrict))
          return;
        nextX = fallback.x;
        nextY = fallback.y;
      }
      cueBall.x = nextX;
      cueBall.y = nextY;
      cueBall.pocketed = false;
      cueBall.vx = 0;
      cueBall.vy = 0;
      this.pointer = { x: nextX, y: nextY, active: true };
      this.refresh();
    },
    shoot() {
      const didShoot = startShot(this.state, this.state.cueControl.angle, this.state.cueControl.power);
      if (didShoot) {
        this.refresh();
      } else {
        this.draw();
      }
    },
    declarePushOut() {
      if (!(this.state.phase === "aim" && this.state.currentPlayer === PLAYER_HUMAN))
        return;
      const didShoot = startShot(this.state, this.state.cueControl.angle, this.state.cueControl.power, { forcePushOut: true });
      if (didShoot) {
        this.refresh();
      } else {
        this.draw();
      }
    },
    resolveDecision(optionId) {
      if (this.state.phase !== "decision" || !this.state.pendingDecision)
        return;
      resolvePendingDecision(this.state, optionId);
      this.refresh();
    },
    setPointer(worldPoint) {
      if (!worldPoint)
        return;
      this.pointer = { ...worldPoint, active: true };
      if (this.state.currentPlayer === PLAYER_HUMAN && this.state.phase === "aim") {
        const cueBall = getCueBall(this.state);
        if (cueBall) {
          this.state.cueControl.angle = Math.atan2(worldPoint.y - cueBall.y, worldPoint.x - cueBall.x);
          this.refresh();
          return;
        }
      }
      this.draw();
    },
    placeCueFromPointer(worldPoint) {
      if (!worldPoint || this.state.currentPlayer !== PLAYER_HUMAN || this.state.phase !== "placing")
        return;
      if (!isCuePlacementValid(this.state, worldPoint.x, worldPoint.y, this.state.ballInHand.restrictHeadString)) {
        addLog(this.state, "Posicion invalida para la blanca.");
        this.refresh();
        return;
      }
      const cueBall = getCueBall(this.state);
      if (!cueBall)
        return;
      cueBall.x = worldPoint.x;
      cueBall.y = worldPoint.y;
      cueBall.pocketed = false;
      cueBall.vx = 0;
      cueBall.vy = 0;
      this.confirmCuePlacement("raton");
    },
    setFullscreenState(isFullscreen) {
      this.state.fullscreen = Boolean(isFullscreen);
      this.publish();
      this.draw();
    },
    handleKeyDown(event) {
      if (event.target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(event.target.tagName)) {
        return;
      }
      if (event.code === "KeyF") {
        onFullscreenRequest?.();
        event.preventDefault();
        return;
      }
      if (event.code === "KeyR") {
        this.restartRack();
        event.preventDefault();
        return;
      }
      if (event.code === "KeyN") {
        this.nextRack();
        event.preventDefault();
        return;
      }
      if (this.state.phase === "decision") {
        if (event.code === "Digit1" || event.code === "Numpad1" || event.code === "Enter") {
          this.resolveDecision("take");
          event.preventDefault();
          return;
        }
        if (event.code === "Digit2" || event.code === "Numpad2") {
          this.resolveDecision("pass-back");
          event.preventDefault();
        }
        return;
      }
      if (this.state.phase === "menu" && (event.code === "Enter" || event.code === "Space")) {
        this.startMatch();
        event.preventDefault();
        return;
      }
      if (this.state.phase === "placing") {
        const step = event.shiftKey ? PLACE_NUDGE_FINE_STEP : PLACE_NUDGE_STEP;
        switch (event.code) {
          case "ArrowLeft":
          case "KeyA":
            this.nudgeCueBall(-step, 0);
            event.preventDefault();
            return;
          case "ArrowRight":
          case "KeyD":
            this.nudgeCueBall(step, 0);
            event.preventDefault();
            return;
          case "ArrowUp":
          case "KeyW":
            this.nudgeCueBall(0, -step);
            event.preventDefault();
            return;
          case "ArrowDown":
          case "KeyS":
            this.nudgeCueBall(0, step);
            event.preventDefault();
            return;
          case "Enter":
          case "Space":
            this.confirmCuePlacement("teclado");
            event.preventDefault();
            return;
          case "KeyP":
            this.autoPlaceCueBall();
            event.preventDefault();
            return;
          default:
            return;
        }
      }
      if (this.state.phase !== "aim") {
        return;
      }
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          this.adjustAim(-AIM_STEP);
          event.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          this.adjustAim(AIM_STEP);
          event.preventDefault();
          break;
        case "ArrowUp":
        case "KeyW":
          this.adjustPower(POWER_STEP);
          event.preventDefault();
          break;
        case "ArrowDown":
        case "KeyS":
          this.adjustPower(-POWER_STEP);
          event.preventDefault();
          break;
        case "KeyO":
          this.declarePushOut();
          event.preventDefault();
          break;
        case "KeyV":
          this.toggleSafety();
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
          this.shoot();
          event.preventDefault();
          break;
        default:
      }
    },
    advanceTime(milliseconds) {
      advanceSimulation(this.state, milliseconds);
      this.refresh();
    },
    frame: (timestamp) => {
      const instance = runtime;
      if (!instance.lastFrame) {
        instance.lastFrame = timestamp;
      }
      const deltaMs = clamp(timestamp - instance.lastFrame, 0, MAX_FRAME_MS);
      instance.lastFrame = timestamp;
      if (instance.state.phase === "moving" || instance.state.phase === "ai-thinking") {
        advanceSimulation(instance.state, deltaMs);
        instance.publish();
      }
      instance.draw();
      instance.rafId = requestAnimationFrame(instance.frame);
    },
    start() {
      const move = (event) => {
        const worldPoint = eventToWorld(canvas, event, { rotateTable: isTableRotated() });
        this.setPointer(worldPoint);
      };
      const down = (event) => {
        const worldPoint = eventToWorld(canvas, event, { rotateTable: isTableRotated() });
        this.placeCueFromPointer(worldPoint);
      };
      const wheel = (event) => {
        if (!(this.state.phase === "aim" || this.state.phase === "placing"))
          return;
        event.preventDefault();
        this.adjustPower(event.deltaY < 0 ? POWER_STEP : -POWER_STEP);
      };
      this._listeners = {
        move,
        down,
        wheel,
        keydown: (event) => this.handleKeyDown(event)
      };
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("touchmove", move, { passive: true });
      canvas.addEventListener("mousedown", down);
      canvas.addEventListener("touchstart", down, { passive: true });
      canvas.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("keydown", this._listeners.keydown);
      this.refresh();
      this.rafId = requestAnimationFrame(this.frame);
    },
    destroy() {
      cancelAnimationFrame(this.rafId);
      if (!this._listeners)
        return;
      canvas.removeEventListener("mousemove", this._listeners.move);
      canvas.removeEventListener("touchmove", this._listeners.move);
      canvas.removeEventListener("mousedown", this._listeners.down);
      canvas.removeEventListener("touchstart", this._listeners.down);
      canvas.removeEventListener("wheel", this._listeners.wheel);
      window.removeEventListener("keydown", this._listeners.keydown);
    }
  };
  return runtime;
}
function createDefaultSnapshot(locale = resolveLocale()) {
  return buildSnapshot(createRuntimeState("eight-ball", "club", locale));
}
function BilliardsClubGame() {
  const canvasRef = (0, import_react2.useRef)(null);
  const shellRef = (0, import_react2.useRef)(null);
  const runtimeRef = (0, import_react2.useRef)(null);
  const tableRotatedRef = (0, import_react2.useRef)(false);
  const [locale] = (0, import_react2.useState)(() => resolveLocale());
  const [snapshot, setSnapshot] = (0, import_react2.useState)(() => createDefaultSnapshot(locale));
  const [mobileViewport, setMobileViewport] = (0, import_react2.useState)(() => readMobileViewport());
  const [preferVerticalTable, setPreferVerticalTable] = (0, import_react2.useState)(true);
  const useVerticalTable = mobileViewport.isMobile && mobileViewport.isPortrait && preferVerticalTable;
  const ui = UI_COPY[locale] ?? UI_COPY.en;
  (0, import_react2.useEffect)(() => {
    tableRotatedRef.current = useVerticalTable;
  }, [useVerticalTable]);
  (0, import_react2.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return void 0;
    const runtime = createRuntime({
      canvas,
      onSnapshot: setSnapshot,
      isTableRotated: () => tableRotatedRef.current,
      locale,
      onFullscreenRequest: () => {
        const shell = shellRef.current;
        if (!shell)
          return;
        const request = shell.requestFullscreen || shell.webkitRequestFullscreen;
        if (request)
          request.call(shell);
      }
    });
    runtimeRef.current = runtime;
    runtime.start();
    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, [locale]);
  (0, import_react2.useEffect)(() => {
    const onChange = () => {
      runtimeRef.current?.setFullscreenState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);
  (0, import_react2.useEffect)(() => {
    const updateViewport = () => {
      setMobileViewport(readMobileViewport());
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);
  const startMatch = (0, import_react2.useCallback)(() => runtimeRef.current?.startMatch(), []);
  const restartRack = (0, import_react2.useCallback)(() => runtimeRef.current?.restartRack(), []);
  const nextRack = (0, import_react2.useCallback)(() => runtimeRef.current?.nextRack(), []);
  const resetMatch = (0, import_react2.useCallback)(() => runtimeRef.current?.resetToMenu(), []);
  const setMode = (0, import_react2.useCallback)((modeKey) => runtimeRef.current?.setMode(modeKey), []);
  const setDifficulty = (0, import_react2.useCallback)((difficultyKey) => runtimeRef.current?.setDifficulty(difficultyKey), []);
  const setParticipantCount = (0, import_react2.useCallback)((participantCount) => runtimeRef.current?.setParticipantCount(participantCount), []);
  const setPocket = (0, import_react2.useCallback)((pocketId) => runtimeRef.current?.setCalledPocket(pocketId), []);
  const adjustAim = (0, import_react2.useCallback)((delta) => runtimeRef.current?.adjustAim(delta), []);
  const adjustPower = (0, import_react2.useCallback)((delta) => runtimeRef.current?.adjustPower(delta), []);
  const shoot = (0, import_react2.useCallback)(() => runtimeRef.current?.shoot(), []);
  const declarePushOut = (0, import_react2.useCallback)(() => runtimeRef.current?.declarePushOut(), []);
  const toggleSafety = (0, import_react2.useCallback)(() => runtimeRef.current?.toggleSafety(), []);
  const resolveDecision = (0, import_react2.useCallback)((optionId) => runtimeRef.current?.resolveDecision(optionId), []);
  const autoPlaceCueBall = (0, import_react2.useCallback)(() => runtimeRef.current?.autoPlaceCueBall(), []);
  const nudgeCueBall = (0, import_react2.useCallback)((dx, dy) => runtimeRef.current?.nudgeCueBall(dx, dy), []);
  const confirmCuePlacement = (0, import_react2.useCallback)(() => runtimeRef.current?.confirmCuePlacement("teclado"), []);
  const requestFullscreen = (0, import_react2.useCallback)(() => {
    const shell = shellRef.current;
    if (!shell)
      return;
    const request = shell.requestFullscreen || shell.webkitRequestFullscreen;
    if (request)
      request.call(shell);
  }, []);
  const advanceTime = (0, import_react2.useCallback)((ms) => runtimeRef.current?.advanceTime(ms), []);
  useGameRuntimeBridge(snapshot, (0, import_react2.useCallback)((state) => state, []), advanceTime);
  const overlayVisible = snapshot.status === "menu" || snapshot.status === "rack-over" || snapshot.status === "match-over";
  const humanTurn = snapshot.currentPlayer === PLAYER_HUMAN;
  const canAim = snapshot.status === "aim" && humanTurn;
  const canPlace = snapshot.status === "placing" && humanTurn;
  const canPushOut = Boolean(snapshot.canDeclarePushOut);
  const canSafety = Boolean(snapshot.canDeclareSafety);
  const aiLeds = snapshot.ai?.leds ?? createAiLedState();
  const aiThinking = Boolean(snapshot.ai?.thinking);
  const aiPlan = snapshot.ai?.planPreview ?? null;
  const ledClass = (active, baseClass = "") => [baseClass, aiThinking && active ? "led-active" : ""].filter(Boolean).join(" ");
  const canConfigureBeforeStart = snapshot.status === "menu";
  const modeObjective = snapshot.variant === "kelly" ? `${modeSummary(snapshot.variant, locale)} ${locale === "es" ? `Participantes: ${snapshot.participantCount}.` : `Players: ${snapshot.participantCount}.`}` : modeSummary(snapshot.variant, locale);
  const raceUnit = isCaromMode(snapshot.variant) ? ui.pointsUnit : isKellyMode(snapshot.variant) ? ui.winsUnit : ui.racksUnit;
  const scoreboardHeadline = snapshot.players.length === 2 ? `${snapshot.players[0]?.racksWon ?? 0} - ${snapshot.players[1]?.racksWon ?? 0}` : (() => {
    const topScore = Math.max(...snapshot.players.map((player) => player.racksWon), 0);
    const leaders = snapshot.players.filter((player) => player.racksWon === topScore).map((player) => player.name);
    const leaderLabel = leaders.length > 3 ? `${leaders.slice(0, 3).join(", ")}...` : leaders.join(", ");
    return `${ui.leader}: ${leaderLabel || "-"} (${topScore})`;
  })();
  const showKellyTargets = snapshot.variant === "kelly";
  const showGroupInfo = snapshot.variant === "eight-ball";
  const mobileDirectionalHint = canPlace ? ui.mobileHintPlace : ui.mobileHintAim;
  const gameClassName = [
    "mini-game",
    "billiards-game",
    mobileViewport.isMobile ? "billiards-mobile" : "",
    mobileViewport.isMobile && mobileViewport.isPortrait ? "billiards-mobile-portrait" : "",
    mobileViewport.isMobile && !mobileViewport.isPortrait ? "billiards-mobile-landscape" : "",
    useVerticalTable ? "billiards-table-vertical" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: gameClassName }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mini-head" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h4", null, ui.title), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.subtitle)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-head-actions" }, snapshot.status === "menu" ? /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-start-btn", type: "button", onClick: startMatch }, ui.start) : null, snapshot.status === "rack-over" ? /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-next-rack-btn", type: "button", onClick: nextRack }, ui.nextRack) : null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: restartRack }, ui.restartRack), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: resetMatch }, ui.newMatch), mobileViewport.isMobile && mobileViewport.isPortrait ? /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-orientation-btn", type: "button", onClick: () => setPreferVerticalTable((previous) => !previous) }, useVerticalTable ? ui.orientationHorizontal : ui.orientationVertical) : null, /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-fullscreen-btn", type: "button", onClick: requestFullscreen }, ui.fullscreen))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-toolbar" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-setup-row" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "billiards-select-field", htmlFor: "billiards-mode-select" }, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.gameMode), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "billiards-mode-select",
      value: snapshot.variant,
      onChange: (event) => setMode(event.target.value),
      disabled: !canConfigureBeforeStart
    },
    Object.entries(MODE_PRESETS).map(([modeKey, preset]) => /* @__PURE__ */ import_react2.default.createElement("option", { key: modeKey, value: modeKey }, localizeLabel(preset.label, locale)))
  )), /* @__PURE__ */ import_react2.default.createElement("label", { className: "billiards-select-field", htmlFor: "billiards-ai-select" }, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.aiMode), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "billiards-ai-select",
      value: snapshot.difficultyKey,
      onChange: (event) => setDifficulty(event.target.value),
      disabled: !canConfigureBeforeStart
    },
    Object.entries(DIFFICULTY_PRESETS).map(([difficultyKey, preset]) => /* @__PURE__ */ import_react2.default.createElement("option", { key: difficultyKey, value: difficultyKey }, localizeLabel(preset.label, locale)))
  )), snapshot.variant === "kelly" ? /* @__PURE__ */ import_react2.default.createElement("label", { className: "billiards-select-field", htmlFor: "billiards-participants-select" }, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.participants), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "billiards-participants-select",
      value: snapshot.participantCount,
      onChange: (event) => setParticipantCount(event.target.value),
      disabled: !canConfigureBeforeStart
    },
    Array.from({ length: 14 }, (_, index) => {
      const count = index + 2;
      return /* @__PURE__ */ import_react2.default.createElement("option", { key: count, value: count }, count);
    })
  )) : null, /* @__PURE__ */ import_react2.default.createElement("p", { className: "billiards-mode-goal" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, ui.modeGoal), " ", modeObjective)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-chipline" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill billiards-turn-pill" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-dot ${aiThinking && aiLeds.turn ? "on" : ""}`, "aria-hidden": "true" }), ui.turn, ": ", snapshot.currentPlayerName), /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.mode, ": ", snapshot.modeLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.raceTo, " ", snapshot.raceTo), snapshot.tableOpen ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.tableOpen) : null, snapshot.ballInHand ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.ballInHand) : null, snapshot.pushOutAvailable ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.pushOutAvailable) : null, snapshot.safetyDeclared ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "hud-pill" }, ui.safetyActive) : null)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-layout" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-stage phaser-canvas-shell", ref: shellRef }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "phaser-canvas-host billiards-canvas-host" }, /* @__PURE__ */ import_react2.default.createElement("canvas", { id: "billiards-canvas", ref: canvasRef, width: TABLE_WIDTH, height: TABLE_HEIGHT, className: "billiards-canvas", "aria-label": locale === "es" ? "Mesa de billar" : "Pool table" })), overlayVisible ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-overlay" }, snapshot.status === "menu" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("h5", null, ui.title), /* @__PURE__ */ import_react2.default.createElement("p", null, modeObjective), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.speedToUnderstand, " ", snapshot.raceTo, " ", raceUnit, "."), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-overlay-start", type: "button", onClick: startMatch }, ui.openTableButton)) : null, snapshot.status === "rack-over" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("h5", null, ui.rackClosedTitle), /* @__PURE__ */ import_react2.default.createElement("p", null, snapshot.message), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: nextRack }, ui.prepareNextRack)) : null, snapshot.status === "match-over" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("h5", null, ui.matchFinishedTitle), /* @__PURE__ */ import_react2.default.createElement("p", null, snapshot.message), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: resetMatch }, ui.backToMenu)) : null) : null), /* @__PURE__ */ import_react2.default.createElement("aside", { className: "billiards-sidepanel" }, /* @__PURE__ */ import_react2.default.createElement("section", { className: "billiards-panel scoreboard" }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.scoreboard), /* @__PURE__ */ import_react2.default.createElement("strong", null, scoreboardHeadline)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-score-row" }, snapshot.players.map((player, index) => /* @__PURE__ */ import_react2.default.createElement("article", { key: `${player.name}-${index}`, className: snapshot.currentPlayer === index ? "active" : "" }, /* @__PURE__ */ import_react2.default.createElement("h6", null, player.name), /* @__PURE__ */ import_react2.default.createElement("p", null, raceUnit, ": ", player.racksWon), showGroupInfo ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.group, ": ", player.groupLabel) : null, showGroupInfo && player.group ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.remaining, ": ", player.remainingGroupBalls) : null, showKellyTargets ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.targetBall, ": ", player.kellyTarget ?? "-", " ", player.kellyTarget == null ? "" : `(${player.kellyTargetPocketed ? ui.pocketed : ui.onTable})`) : null, snapshot.variant === "nine-ball" || snapshot.variant === "ten-ball" ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.foulsInRow, ": ", player.foulsInRow) : null)))), /* @__PURE__ */ import_react2.default.createElement("section", { className: "billiards-panel state" }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.telemetry), /* @__PURE__ */ import_react2.default.createElement("strong", null, snapshot.statusLabel ?? snapshot.status)), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.legalTarget, ": ", snapshot.legalTargets.length ? snapshot.legalTargets.join(", ") : "-"), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.power, ": ", Math.round(snapshot.cueControl.power * 100), "%"), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.angle, ": ", snapshot.cueControl.angleDegrees, "\xB0"), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.lowestBall, ": ", snapshot.lowestBall ?? "-"), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.pushOut, ": ", snapshot.pushOutAvailable ? ui.yes : ui.no), /* @__PURE__ */ import_react2.default.createElement("p", null, ui.safety, ": ", snapshot.safetyDeclared ? ui.declared : ui.no), snapshot.calledPocketLabel ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.calledPocket, ": ", snapshot.calledPocketLabel) : null), /* @__PURE__ */ import_react2.default.createElement("section", { className: "billiards-panel ai-console" }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.aiConsole), /* @__PURE__ */ import_react2.default.createElement("strong", null, aiThinking ? ui.analyzing : ui.standby)), /* @__PURE__ */ import_react2.default.createElement("p", null, snapshot.ai?.action ?? localizeRuntimeText(AI_ACTION_LABELS.idle, locale)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-led-grid", "aria-label": ui.aiLedGroup }, /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.turn ? "on" : ""}` }, ui.aiTurn), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.autoPlace ? "on" : ""}` }, ui.autoPlace), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.pocket ? "on" : ""}` }, ui.pocket), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.aim ? "on" : ""}` }, ui.aimAdjust), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.power ? "on" : ""}` }, ui.powerAdjust), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.pushOut ? "on" : ""}` }, ui.pushOut), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.safety ? "on" : ""}` }, ui.safety), /* @__PURE__ */ import_react2.default.createElement("span", { className: `billiards-led-pill ${aiThinking && aiLeds.shoot ? "on" : ""}` }, ui.shoot)), aiPlan ? /* @__PURE__ */ import_react2.default.createElement("p", null, ui.plan, ": ", aiPlan.type === "pot" ? ui.planPot : aiPlan.type === "kick" ? ui.planKick : ui.planContact, aiPlan.route ? ` (${aiPlan.route})` : "", ", ", ui.ball, " ", aiPlan.ballNumber ?? "-", ", ", ui.power.toLowerCase(), " ", Math.round(aiPlan.power * 100), "%.") : null), snapshot.pendingDecision ? /* @__PURE__ */ import_react2.default.createElement("section", { className: "billiards-panel decision" }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.decision), /* @__PURE__ */ import_react2.default.createElement("strong", null, ui.turn, ": ", snapshot.currentPlayerName)), /* @__PURE__ */ import_react2.default.createElement("p", null, snapshot.pendingDecision.prompt), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-control-group" }, snapshot.pendingDecision.options.map((option, index) => /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      key: option.id,
      id: `billiards-decision-${option.id}`,
      type: "button",
      onClick: () => resolveDecision(option.id)
    },
    index + 1,
    ". ",
    option.label
  )))) : null, snapshot.needsPocketCall ? /* @__PURE__ */ import_react2.default.createElement("section", { className: "billiards-panel pockets" }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("span", null, snapshot.variant === "ten-ball" ? ui.callShot : ui.callEight), /* @__PURE__ */ import_react2.default.createElement("strong", null, ui.choosePocket)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-pocket-grid" }, POCKETS.map((pocket) => /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      key: pocket.id,
      id: `billiards-pocket-${pocket.id}`,
      type: "button",
      className: snapshot.calledPocketId === pocket.id ? "active" : "",
      onClick: () => setPocket(pocket.id)
    },
    localizeLabel(pocket.label, locale)
  )))) : null)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-control-deck" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-control-group" }, /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-aim-left", type: "button", className: ledClass(aiLeds.aim), onClick: () => adjustAim(-AIM_STEP), disabled: !canAim }, ui.aimMinus), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-aim-right", type: "button", className: ledClass(aiLeds.aim), onClick: () => adjustAim(AIM_STEP), disabled: !canAim }, ui.aimPlus), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-power-minus", type: "button", className: ledClass(aiLeds.power), onClick: () => adjustPower(-POWER_STEP), disabled: !(canAim || canPlace) }, ui.powerMinus), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-power-plus", type: "button", className: ledClass(aiLeds.power), onClick: () => adjustPower(POWER_STEP), disabled: !(canAim || canPlace) }, ui.powerPlus), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-push-out", type: "button", className: ledClass(aiLeds.pushOut), onClick: declarePushOut, disabled: !canPushOut }, ui.pushOut), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-safety", type: "button", className: `${snapshot.safetyDeclared ? "active" : ""} ${ledClass(aiLeds.safety)}`.trim(), onClick: toggleSafety, disabled: !canSafety }, ui.safety), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-shoot-btn", type: "button", className: ledClass(aiLeds.shoot), onClick: shoot, disabled: !canAim }, ui.shootButton), /* @__PURE__ */ import_react2.default.createElement("button", { id: "billiards-auto-place", type: "button", className: ledClass(aiLeds.autoPlace), onClick: autoPlaceCueBall, disabled: !canPlace }, ui.autoPlace)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-help-copy" }, /* @__PURE__ */ import_react2.default.createElement("span", null, ui.optionalMouseAim), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help1), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help2), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help3), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help4), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help5), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help6), /* @__PURE__ */ import_react2.default.createElement("span", null, ui.help7))), mobileViewport.isMobile ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-mobile-controls", role: "group", "aria-label": ui.mobileControlsAria }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "billiards-mobile-hint" }, mobileDirectionalHint), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-mobile-grid" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-mobile-pad" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => canPlace ? nudgeCueBall(0, -PLACE_NUDGE_STEP) : adjustPower(POWER_STEP),
      disabled: !(canAim || canPlace),
      "aria-label": canPlace ? locale === "es" ? "Mover blanca arriba" : "Move cue ball up" : locale === "es" ? "Aumentar potencia" : "Increase power"
    },
    ui.up
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => canPlace ? nudgeCueBall(-PLACE_NUDGE_STEP, 0) : adjustAim(-AIM_STEP),
      disabled: !(canAim || canPlace),
      "aria-label": canPlace ? locale === "es" ? "Mover blanca izquierda" : "Move cue ball left" : locale === "es" ? "Apuntar a la izquierda" : "Aim left"
    },
    ui.left
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => canPlace ? nudgeCueBall(PLACE_NUDGE_STEP, 0) : adjustAim(AIM_STEP),
      disabled: !(canAim || canPlace),
      "aria-label": canPlace ? locale === "es" ? "Mover blanca derecha" : "Move cue ball right" : locale === "es" ? "Apuntar a la derecha" : "Aim right"
    },
    ui.right
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => canPlace ? nudgeCueBall(0, PLACE_NUDGE_STEP) : adjustPower(-POWER_STEP),
      disabled: !(canAim || canPlace),
      "aria-label": canPlace ? locale === "es" ? "Mover blanca abajo" : "Move cue ball down" : locale === "es" ? "Reducir potencia" : "Decrease power"
    },
    ui.down
  )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-mobile-actions" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      id: "billiards-mobile-main-action",
      type: "button",
      className: "billiards-mobile-primary",
      onClick: () => canPlace ? confirmCuePlacement() : shoot(),
      disabled: !(canAim || canPlace)
    },
    canPlace ? ui.placeCueBall : ui.shootButton
  ), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: autoPlaceCueBall, disabled: !canPlace }, ui.autoCueBall), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: declarePushOut, disabled: !canPushOut }, ui.pushOut), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: toggleSafety, disabled: !canSafety }, ui.safety)))) : null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "billiards-log-strip" }, snapshot.log.map((entry, index) => /* @__PURE__ */ import_react2.default.createElement("span", { key: `${entry}-${index}` }, entry))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "game-message" }, snapshot.message));
}
var billiards_club_default = BilliardsClubGame;
export {
  billiards_club_default as default
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
