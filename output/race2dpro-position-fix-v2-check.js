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
        function useMemo2(create, deps) {
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
        exports.useMemo = useMemo2;
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

// src/games/RaceGame2DPro.jsx
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

// src/games/race2dpro/circuits.js
var DEG_TO_RAD = Math.PI / 180;
var MIN_POINT_GAP = 70;
var STRAIGHT_STEP_MM = 220;
var ARC_STEP_MM = 170;
var bcmStraight = (lengthMm) => [0, lengthMm];
var bcmLeft = (angleDeg, radiusMm) => [Math.abs(angleDeg), radiusMm];
var bcmRight = (angleDeg, radiusMm) => [-Math.abs(angleDeg), radiusMm];
var bcmAutoCurveLeft = () => [1, 0];
var bcmAutoCurveRight = () => [-1, 0];
var bcmAutoStraight = () => [0, 0];
function appendPoint(points, x, y) {
  const last = points[points.length - 1];
  if (!last || Math.hypot(last[0] - x, last[1] - y) >= MIN_POINT_GAP) {
    points.push([x, y]);
  }
}
function normalizePositiveDegrees(value) {
  return (value % 360 + 360) % 360;
}
function forwardVector(heading) {
  return [Math.cos(heading), Math.sin(heading)];
}
function leftVector(heading) {
  return [-Math.sin(heading), Math.cos(heading)];
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function scale(vector, factor) {
  return [vector[0] * factor, vector[1] * factor];
}
function advanceTurn(point, heading, signedAngleDeg, radiusMm) {
  const turnDirection = Math.sign(signedAngleDeg);
  const arcAngle = Math.abs(signedAngleDeg) * DEG_TO_RAD;
  const centerX = point[0] - Math.sin(heading) * radiusMm * turnDirection;
  const centerY = point[1] + Math.cos(heading) * radiusMm * turnDirection;
  const startAngle = Math.atan2(point[1] - centerY, point[0] - centerX);
  const endAngle = startAngle + arcAngle * turnDirection;
  return [
    centerX + Math.cos(endAngle) * radiusMm,
    centerY + Math.sin(endAngle) * radiusMm
  ];
}
function simulateTramos(origin, tramos, withPoints = true) {
  let x = origin[0];
  let y = origin[1];
  let heading = Math.atan2(origin[3], origin[2]);
  const points = withPoints ? [[x, y]] : null;
  for (const [tipo, magnitude] of tramos) {
    if (tipo === 0) {
      const steps2 = Math.max(1, Math.ceil(magnitude / STRAIGHT_STEP_MM));
      for (let step = 1; step <= steps2; step += 1) {
        const distance = magnitude * step / steps2;
        if (withPoints) {
          appendPoint(points, x + Math.cos(heading) * distance, y + Math.sin(heading) * distance);
        }
      }
      x += Math.cos(heading) * magnitude;
      y += Math.sin(heading) * magnitude;
      continue;
    }
    const turnDirection = Math.sign(tipo);
    const arcAngle = Math.abs(tipo) * DEG_TO_RAD;
    const radius = magnitude;
    const centerX = x - Math.sin(heading) * radius * turnDirection;
    const centerY = y + Math.cos(heading) * radius * turnDirection;
    const startAngle = Math.atan2(y - centerY, x - centerX);
    const steps = Math.max(3, Math.ceil(radius * arcAngle / ARC_STEP_MM));
    for (let step = 1; step <= steps; step += 1) {
      const theta = startAngle + arcAngle * step * turnDirection / steps;
      if (withPoints) {
        appendPoint(points, centerX + Math.cos(theta) * radius, centerY + Math.sin(theta) * radius);
      }
    }
    const endAngle = startAngle + arcAngle * turnDirection;
    x = centerX + Math.cos(endAngle) * radius;
    y = centerY + Math.sin(endAngle) * radius;
    heading += arcAngle * turnDirection;
  }
  return { x, y, heading, points: points || [] };
}
function solveRadius(evalCandidate) {
  let best = null;
  let minRadius = 80;
  let maxRadius = 3200;
  let step = 40;
  for (let pass = 0; pass < 4; pass += 1) {
    for (let radius = minRadius; radius <= maxRadius; radius += step) {
      const candidate = evalCandidate(radius);
      if (!candidate) {
        continue;
      }
      if (!best || candidate.score < best.score) {
        best = candidate;
      }
    }
    if (!best) {
      return null;
    }
    minRadius = Math.max(40, best.radius - step);
    maxRadius = best.radius + step;
    step /= 4;
  }
  return best;
}
function solveAutoClose(origin, tramos) {
  if (tramos.length < 2) {
    return tramos;
  }
  const penultimate = tramos[tramos.length - 2];
  const last = tramos[tramos.length - 1];
  const fixedTramos = tramos.slice(0, -2);
  const fixedState = simulateTramos(origin, fixedTramos, false);
  const currentPoint = [fixedState.x, fixedState.y];
  const currentHeading = fixedState.heading;
  const startPoint = [origin[0], origin[1]];
  const startHeading = Math.atan2(origin[3], origin[2]);
  const headingDeltaDeg = (startHeading - currentHeading) / DEG_TO_RAD;
  const remainingAngleFor = (sign) => {
    const positive = normalizePositiveDegrees(headingDeltaDeg);
    const negative = normalizePositiveDegrees(-headingDeltaDeg);
    const remaining = sign > 0 ? positive : negative;
    return remaining < 1 ? 360 : remaining;
  };
  if (penultimate[0] === 0 && last[1] === 0 && Math.abs(last[0]) === 1) {
    const curveSign = Math.sign(last[0]);
    const curveAngleDeg = remainingAngleFor(curveSign);
    const best = solveRadius((radius) => {
      const curveStartHeading = startHeading - curveSign * curveAngleDeg * DEG_TO_RAD;
      const center = add(startPoint, scale(leftVector(startHeading), curveSign * radius));
      const curveStart = subtract(center, scale(leftVector(curveStartHeading), curveSign * radius));
      const ray = subtract(curveStart, currentPoint);
      const straightLength = dot(ray, forwardVector(currentHeading));
      const perpendicularError = dot(ray, leftVector(currentHeading));
      if (straightLength < 0) {
        return null;
      }
      return {
        radius,
        straightLength,
        score: Math.abs(perpendicularError) + Math.max(0, 80 - straightLength) * 5
      };
    });
    if (best) {
      return [
        ...fixedTramos,
        [0, best.straightLength],
        [curveSign * curveAngleDeg, best.radius]
      ];
    }
  }
  if (Math.abs(penultimate[0]) === 1 && penultimate[1] === 0 && last[0] === 0) {
    const curveSign = Math.sign(penultimate[0]);
    const curveAngleDeg = remainingAngleFor(curveSign);
    const best = solveRadius((radius) => {
      const curveEnd = advanceTurn(currentPoint, currentHeading, curveSign * curveAngleDeg, radius);
      const ray = subtract(startPoint, curveEnd);
      const straightLength = dot(ray, forwardVector(startHeading));
      const perpendicularError = dot(ray, leftVector(startHeading));
      if (straightLength < 0) {
        return null;
      }
      return {
        radius,
        straightLength,
        score: Math.abs(perpendicularError) + Math.max(0, 80 - straightLength) * 5
      };
    });
    if (best) {
      return [
        ...fixedTramos,
        [curveSign * curveAngleDeg, best.radius],
        [0, best.straightLength]
      ];
    }
  }
  return tramos;
}
function compileBlueprint(blueprint) {
  const solvedTramos = solveAutoClose(blueprint.origin, blueprint.tramos);
  const { x, y, points } = simulateTramos(blueprint.origin, solvedTramos, true);
  const startX = blueprint.origin[0];
  const startY = blueprint.origin[1];
  const endGap = Math.hypot(x - startX, y - startY);
  if (endGap > 1) {
    appendPoint(points, startX, startY);
  }
  if (points.length > 2 && Math.hypot(points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]) < MIN_POINT_GAP) {
    points.pop();
  }
  return {
    ...blueprint,
    tramos: solvedTramos,
    raw: points
  };
}
var BLUEPRINTS = [
  {
    id: 0,
    envId: "neon-city",
    name: { es: "Costa Azul GP", en: "Azure Coast GP" },
    classification: { es: "Semipermanente", en: "Semi-permanent" },
    layoutLabel: { es: "Tecnico lento", en: "Slow technical" },
    note: {
      es: "Trazado compacto de muchas curvas lentas y medias, basado en el modelo de tramos del motor basic-circuit-maker.",
      en: "Compact layout with many slow and medium-speed corners, built from the basic-circuit-maker segment model."
    },
    distanceKm: "4.2 km",
    turns: 14,
    overtaking: { es: "Baja", en: "Low" },
    profile: { es: "Carga alta", en: "High downforce" },
    poleSide: "left",
    trackWidth: 66,
    startS: 0.018,
    dimensionsMm: [5e3, 2e3],
    origin: [1130, 360, 1, 0],
    tramos: [
      bcmStraight(2740),
      bcmLeft(210, 650),
      bcmStraight(878),
      bcmRight(60, 570),
      bcmAutoStraight(),
      bcmAutoCurveLeft()
    ]
  },
  {
    id: 1,
    envId: "volcano",
    name: { es: "Sierra Verde GP", en: "Sierra Verde GP" },
    classification: { es: "Permanente", en: "Permanent" },
    layoutLabel: { es: "Power lap", en: "Power lap" },
    note: {
      es: "Circuito de potencia con una recta principal larga, frenadas serias y un cierre rapido de apoyo.",
      en: "Power circuit with a long main straight, hard braking zones, and a quick support-based final sector."
    },
    distanceKm: "4.6 km",
    turns: 10,
    overtaking: { es: "Alta", en: "High" },
    profile: { es: "Carga media-baja", en: "Medium-low downforce" },
    poleSide: "right",
    trackWidth: 74,
    startS: 0.018,
    dimensionsMm: [4e3, 2e3],
    origin: [1420, 200, 1, 0],
    tramos: [
      bcmStraight(1800),
      bcmLeft(140, 530),
      bcmStraight(750),
      bcmLeft(95, 500),
      bcmRight(83, 500),
      bcmStraight(700),
      bcmLeft(45, 520),
      bcmLeft(100, 500),
      bcmAutoStraight(),
      bcmAutoCurveLeft()
    ]
  },
  {
    id: 2,
    envId: "arctic",
    name: { es: "Nordhaven Ring", en: "Nordhaven Ring" },
    classification: { es: "Costero", en: "Coastal" },
    layoutLabel: { es: "Stop-go", en: "Stop-go" },
    note: {
      es: "Dos rectas largas, angulos rectos y cierre automatico con el mismo esquema de tramos del repositorio base.",
      en: "Two long straights, right-angle braking zones, and an auto-closed layout built with the same segment scheme as the source repository."
    },
    distanceKm: "4.9 km",
    turns: 8,
    overtaking: { es: "Alta", en: "High" },
    profile: { es: "Traccion y frenada", en: "Traction and braking" },
    poleSide: "left",
    trackWidth: 72,
    startS: 0.02,
    dimensionsMm: [5400, 2400],
    origin: [1e3, 340, 1, 0],
    tramos: [
      bcmStraight(1600),
      bcmLeft(90, 260),
      bcmStraight(500),
      bcmLeft(90, 260),
      bcmStraight(1500),
      bcmLeft(90, 260),
      bcmAutoCurveLeft(),
      bcmAutoStraight()
    ]
  },
  {
    id: 3,
    envId: "jungle",
    name: { es: "Emerald Forest GP", en: "Emerald Forest GP" },
    classification: { es: "Permanente", en: "Permanent" },
    layoutLabel: { es: "Flow rapido", en: "Fast flow" },
    note: {
      es: "Secuencia enlazada de apoyos y cambios de direccion rapidos, inspirada en layouts de alta velocidad sin cruces.",
      en: "Linked sequence of support corners and quick direction changes, inspired by high-speed layouts without self-crossings."
    },
    distanceKm: "5.2 km",
    turns: 13,
    overtaking: { es: "Media", en: "Medium" },
    profile: { es: "Carga media", en: "Medium downforce" },
    poleSide: "left",
    trackWidth: 70,
    startS: 0.018,
    dimensionsMm: [5e3, 2500],
    origin: [1e3, 280, -1, 0],
    tramos: [
      bcmRight(90, 700),
      bcmStraight(750),
      bcmRight(190, 500),
      bcmStraight(310),
      bcmLeft(100, 500),
      bcmStraight(20),
      bcmLeft(6, 700),
      bcmRight(17, 700),
      bcmLeft(22, 700),
      bcmRight(22, 700),
      bcmLeft(22, 700),
      bcmRight(22, 700),
      bcmLeft(22, 700),
      bcmRight(17, 700),
      bcmLeft(6, 700),
      bcmStraight(20),
      bcmLeft(207, 500),
      bcmStraight(950),
      bcmRight(207, 520),
      bcmStraight(1250),
      bcmRight(40, 1300),
      bcmRight(20, 720),
      bcmRight(10, 480),
      bcmRight(10, 1e3),
      bcmRight(10, 1e3),
      bcmRight(25, 1300),
      bcmAutoCurveRight(),
      bcmAutoStraight()
    ]
  },
  {
    id: 4,
    envId: "desert",
    name: { es: "Sol Dunes Speedway", en: "Sol Dunes Speedway" },
    classification: { es: "Speedway", en: "Speedway" },
    layoutLabel: { es: "Oval", en: "Oval" },
    note: {
      es: "Oval puro de largas aceleraciones con dos curvas constantes y mucha estela.",
      en: "Pure oval with long acceleration zones, constant banking and heavy slipstreaming."
    },
    distanceKm: "4.1 km",
    turns: 4,
    overtaking: { es: "Muy alta", en: "Very high" },
    profile: { es: "Baja carga", en: "Low downforce" },
    poleSide: "left",
    trackWidth: 86,
    startS: 0.02,
    dimensionsMm: [3e3, 2e3],
    origin: [1070, 430, 1, 0],
    tramos: [
      bcmStraight(860),
      bcmLeft(180, 570),
      bcmAutoStraight(),
      bcmAutoCurveLeft()
    ]
  },
  {
    id: 5,
    envId: "space",
    name: { es: "Capital Grand Prix", en: "Capital Grand Prix" },
    classification: { es: "Grand Prix", en: "Grand Prix" },
    layoutLabel: { es: "Modern GP", en: "Modern GP" },
    note: {
      es: "Layout largo y moderno con primer sector tecnico, parte central enlazada y retorno amplio a la recta.",
      en: "Long modern layout with a technical first sector, linked middle section, and a broad return onto the straight."
    },
    distanceKm: "5.7 km",
    turns: 17,
    overtaking: { es: "Media-alta", en: "Medium-high" },
    profile: { es: "Balanceado", en: "Balanced" },
    poleSide: "right",
    trackWidth: 72,
    startS: 0.018,
    dimensionsMm: [7e3, 2e3],
    origin: [4200, 200, 1, 0],
    tramos: [
      bcmStraight(2e3),
      bcmLeft(165, 530),
      bcmStraight(700),
      bcmLeft(90, 480),
      bcmRight(75, 600),
      bcmRight(60, 480),
      bcmStraight(750),
      bcmLeft(45, 520),
      bcmLeft(115, 480),
      bcmRight(145, 480),
      bcmStraight(1200),
      bcmLeft(170, 500),
      bcmLeft(55, 1900),
      bcmStraight(1e3),
      bcmLeft(30, 480),
      bcmRight(60, 480),
      bcmAutoCurveLeft(),
      bcmAutoStraight()
    ]
  }
];
var RACE2DPRO_CIRCUITS = BLUEPRINTS.map(compileBlueprint);

// src/games/RaceGame2DPro.jsx
var STEP_MS = 1e3 / 60;
var SEM_LIGHTS = 5;
var SPEED_TO_KMH = 0.55;
var FIXED_WEATHER_KEY = "dry";
var FINISH_PRESENTATION_DURATION = 2.25;
var FINISH_COAST_DECEL = 64;
var FINISH_COAST_MIN_SPEED = 54;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var lerp = (a, b, t) => a + (b - a) * t;
var wrap01 = (value) => (value % 1 + 1) % 1;
var angNorm = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
var signedAngleDiff = (from, to) => angNorm(to - from);
var roundNumber = (value, digits = 2) => Number(value.toFixed(digits));
var approach = (current, target, rate, dt) => lerp(current, target, clamp(rate * dt, 0, 1));
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
  ];
}
function pseudoRandom(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453123;
  return value - Math.floor(value);
}
function formatRaceTime(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = (safeSeconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${secs}`;
}
var ENVIRONMENTS = {
  "neon-city": {
    name: { es: "Circuito Urbano", en: "Urban Circuit" },
    roadColor: "#3a4048",
    borderColor: "#f6f6f6",
    glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#6b7480",
    kerbRed: "#e03030",
    kerbWhite: "#f3f3f3",
    bgColor: "#4a5a6e",
    grassColor: "#5a7060",
    centerLineColor: "rgba(255,255,255,0.30)",
    barrierColor: "#1e5eff",
    treeColor: "#2e5535",
    treeCount: 22,
    hasCrowd: true,
    runoffType: "asphalt"
  },
  volcano: {
    name: { es: "Circuito Montana", en: "Mountain Circuit" },
    roadColor: "#444850",
    borderColor: "#f6f6f6",
    glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#9c8060",
    kerbRed: "#d8402e",
    kerbWhite: "#f4f4f4",
    bgColor: "#7a6040",
    grassColor: "#8a7050",
    centerLineColor: "rgba(255,255,255,0.28)",
    barrierColor: "#e05500",
    treeColor: "#6a5030",
    treeCount: 14,
    hasCrowd: false,
    runoffType: "gravel"
  },
  arctic: {
    name: { es: "Circuito Costa", en: "Coastal Circuit" },
    roadColor: "#464c54",
    borderColor: "#f7f7f7",
    glowColor: "rgba(255,255,255,0.14)",
    runoffColor: "#dce8f0",
    kerbRed: "#d04040",
    kerbWhite: "#f5f5f5",
    bgColor: "#7090b0",
    grassColor: "#a0b8c8",
    centerLineColor: "rgba(255,255,255,0.32)",
    barrierColor: "#4488ff",
    treeColor: "#2a5038",
    treeCount: 18,
    hasCrowd: true,
    runoffType: "snow"
  },
  jungle: {
    name: { es: "Circuito Bosque", en: "Forest Circuit" },
    roadColor: "#404848",
    borderColor: "#f7f7f7",
    glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#3a6830",
    kerbRed: "#cc4030",
    kerbWhite: "#f4f4f4",
    bgColor: "#2a6840",
    grassColor: "#1e5428",
    centerLineColor: "rgba(255,255,255,0.28)",
    barrierColor: "#208020",
    treeColor: "#144a18",
    treeCount: 30,
    hasCrowd: false,
    runoffType: "grass"
  },
  desert: {
    name: { es: "Circuito Desierto", en: "Desert Circuit" },
    roadColor: "#4c5058",
    borderColor: "#f7f7f7",
    glowColor: "rgba(255,255,255,0.12)",
    runoffColor: "#c8a058",
    kerbRed: "#c84030",
    kerbWhite: "#f5f5f5",
    bgColor: "#d4a84c",
    grassColor: "#c09040",
    centerLineColor: "rgba(255,255,255,0.28)",
    barrierColor: "#cc8800",
    treeColor: "#8a6810",
    treeCount: 10,
    hasCrowd: false,
    runoffType: "sand"
  },
  space: {
    name: { es: "Grand Prix", en: "Grand Prix" },
    roadColor: "#424850",
    borderColor: "#f8f8f8",
    glowColor: "rgba(255,255,255,0.14)",
    runoffColor: "#606878",
    kerbRed: "#d04040",
    kerbWhite: "#f4f4f4",
    bgColor: "#7090b8",
    grassColor: "#607858",
    centerLineColor: "rgba(255,255,255,0.30)",
    barrierColor: "#0055ff",
    treeColor: "#204a28",
    treeCount: 20,
    hasCrowd: true,
    runoffType: "asphalt"
  }
};
var AI_PROFILES = {
  easy: { speedFactor: 0.84, lineOffset: 0.55, brakeMargin: 1.38, errorRate: 0.14, errorMag: 0.34, apexPrecision: 0.58 },
  medium: { speedFactor: 0.93, lineOffset: 0.28, brakeMargin: 1.1, errorRate: 0.04, errorMag: 0.16, apexPrecision: 0.8 },
  hard: { speedFactor: 1, lineOffset: 0.08, brakeMargin: 0.96, errorRate: 8e-3, errorMag: 0.05, apexPrecision: 0.95 }
};
var WEATHER_PROFILES = {
  dry: { id: "dry", label: { es: "Seco", en: "Dry" }, icon: "SUN", gripMult: 1, rainOverlay: false },
  rain: { id: "rain", label: { es: "Lluvia", en: "Rain" }, icon: "RAIN", gripMult: 0.72, rainOverlay: true },
  dusk: { id: "dusk", label: { es: "Crepusculo", en: "Dusk" }, icon: "DUSK", gripMult: 0.9, rainOverlay: false }
};
var PHYS = {
  MAX_SPEED: 470,
  ENGINE_ACCEL: 320,
  BRAKE_DECEL: 560,
  ENGINE_BRAKE: 92,
  ROLLING_DRAG: 28,
  AERO_DRAG: 85e-5,
  STEER_RATE: 2.45,
  STEER_RESPONSE: 8.2,
  THROTTLE_RESPONSE: 9,
  BRAKE_RESPONSE: 10,
  YAW_RESPONSE: 7,
  LATERAL_GRIP: 12.5,
  LATERAL_STABILITY: 9,
  CAR_RADIUS: 12,
  COLLISION_SEPARATION: 0.52,
  COLLISION_VELOCITY_DAMP: 0.992,
  COLLISION_YAW_DAMP: 0.82,
  COLLISION_THROTTLE_CLAMP: 0.78,
  COLLISION_CAMERA_SHAKE: 4,
  COLLISION_COOLDOWN: 0.1,
  OFF_TRACK_GRIP: 0.72,
  OFF_TRACK_MAX_SPEED_FACTOR: 0.82,
  OFF_TRACK_RECOVERY: 0.65
};
function getTrackUsableHalfWidth(track) {
  return Math.max(PHYS.CAR_RADIUS * 1.5, track.trackWidth * 0.5 - PHYS.CAR_RADIUS * 1.75);
}
function buildTrackSlots(track, startS, totalCars, {
  poleSide = "left",
  direction = -1,
  rowSpacing,
  lateralScale = 0.56,
  stagger = 0.42,
  leadOffsetRows = 0
} = {}) {
  const primarySideSign = poleSide === "left" ? -1 : 1;
  const secondarySideSign = -primarySideSign;
  const usableHalfWidth = getTrackUsableHalfWidth(track);
  const effectiveRowSpacing = rowSpacing ?? Math.max(44, track.trackWidth * 0.62);
  const lateralOffsetMagnitude = usableHalfWidth * lateralScale;
  return Array.from({ length: totalCars }, (_, index) => {
    const row = Math.floor(index / 2);
    const onPrimarySide = index % 2 === 0;
    const sideSign = onPrimarySide ? primarySideSign : secondarySideSign;
    const rowOffset = leadOffsetRows + row + (onPrimarySide ? 0 : stagger);
    const slotS = wrap01(startS + direction * (rowOffset * effectiveRowSpacing / Math.max(1, track.totalLength)));
    const slotPoint = sampleTrackAt(track, slotS);
    const normalX = -Math.sin(slotPoint.ang);
    const normalY = Math.cos(slotPoint.ang);
    const trackOffset = sideSign * lateralOffsetMagnitude;
    return {
      x: slotPoint.x + normalX * trackOffset,
      y: slotPoint.y + normalY * trackOffset,
      a: slotPoint.ang,
      s: slotS,
      trackOffset,
      slot: index + 1,
      side: sideSign < 0 ? "left" : "right"
    };
  });
}
function buildTrack(trackDef, canvasWidth, canvasHeight) {
  const raw = trackDef.raw;
  const xs = raw.map((point) => point[0]);
  const ys = raw.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale2 = Math.min(canvasWidth * 0.86 / spanX, canvasHeight * 0.76 / spanY);
  const offsetX = canvasWidth / 2 - (minX + maxX) / 2 * scale2;
  const offsetY = canvasHeight / 2 - (minY + maxY) / 2 * scale2;
  const points = raw.map(([x, y]) => [x * scale2 + offsetX, y * scale2 + offsetY]);
  const sampleCount = Math.max(900, raw.length * 32);
  const samples = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount;
    const segment = t * raw.length;
    const index = Math.floor(segment);
    const fraction = segment - index;
    const p0 = points[(index - 1 + raw.length) % raw.length];
    const p1 = points[index % raw.length];
    const p2 = points[(index + 1) % raw.length];
    const p3 = points[(index + 2) % raw.length];
    const [x, y] = catmullRom(p0, p1, p2, p3, fraction);
    samples.push({ x, y, ang: 0, curvature: 0, speedLimit: PHYS.MAX_SPEED });
  }
  for (let i = 0; i < sampleCount; i += 1) {
    const next = samples[(i + 1) % sampleCount];
    const prev = samples[(i - 1 + sampleCount) % sampleCount];
    samples[i].ang = Math.atan2(next.y - prev.y, next.x - prev.x);
  }
  for (let i = 0; i < sampleCount; i += 1) {
    const prev = samples[(i - 1 + sampleCount) % sampleCount];
    const next = samples[(i + 1) % sampleCount];
    const deltaAngle = Math.abs(angNorm(next.ang - prev.ang));
    samples[i].curvature = deltaAngle;
    samples[i].speedLimit = PHYS.MAX_SPEED * clamp(1 - deltaAngle * 4.1, 0.24, 1);
  }
  let totalLength = 0;
  for (let i = 0; i < sampleCount; i += 1) {
    const next = samples[(i + 1) % sampleCount];
    totalLength += Math.hypot(next.x - samples[i].x, next.y - samples[i].y);
  }
  const decorations = [];
  let rngState = (trackDef.id + 1) * 9301 + 49297;
  const random = () => {
    rngState = (rngState * 9301 + 49297) % 233280;
    return rngState / 233280;
  };
  const environment = ENVIRONMENTS[trackDef.envId];
  const outerOffset = trackDef.trackWidth / 2 + 82;
  for (let treeIndex = 0; treeIndex < (environment.treeCount || 16); treeIndex += 1) {
    const sample = samples[Math.floor(random() * sampleCount)];
    const side = random() > 0.5 ? 1 : -1;
    const distance = outerOffset + random() * 74;
    const normalX = -Math.sin(sample.ang);
    const normalY = Math.cos(sample.ang);
    const radius = 6 + random() * 12;
    const treeColor = environment.treeColor || "#1e5a28";
    const hex = treeColor.replace("#", "");
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + 30);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + 30);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + 20);
    decorations.push({
      type: "tree",
      x: sample.x + normalX * distance * side,
      y: sample.y + normalY * distance * side,
      radius,
      color: treeColor,
      highlight: `rgb(${r},${g},${b})`
    });
  }
  if (environment.hasCrowd) {
    const gridSample = samples[Math.floor(trackDef.startS * sampleCount)];
    const normalX = -Math.sin(gridSample.ang);
    const normalY = Math.cos(gridSample.ang);
    const alongX = Math.cos(gridSample.ang);
    const alongY = Math.sin(gridSample.ang);
    const crowdOffset = trackDef.trackWidth / 2 + 68;
    for (let row = 0; row < 3; row += 1) {
      for (let col = -4; col <= 4; col += 1) {
        decorations.push({
          type: "crowd",
          x: gridSample.x + normalX * (crowdOffset + row * 14) + alongX * col * 16,
          y: gridSample.y + normalY * (crowdOffset + row * 14) + alongY * col * 16,
          row,
          col
        });
      }
    }
    decorations.push({
      type: "stand",
      x: gridSample.x + normalX * (crowdOffset + 20),
      y: gridSample.y + normalY * (crowdOffset + 20),
      ang: gridSample.ang,
      w: 160,
      h: 50
    });
  }
  const halfWidth = trackDef.trackWidth / 2;
  const barrierOffset = halfWidth + 36;
  const pathCenter = new Path2D();
  const pathLeft = new Path2D();
  const pathRight = new Path2D();
  const barrierLeft = new Path2D();
  const barrierRight = new Path2D();
  for (let i = 0; i <= sampleCount; i += 1) {
    const sample = samples[i % sampleCount];
    const normalX = -Math.sin(sample.ang);
    const normalY = Math.cos(sample.ang);
    const leftX = sample.x + normalX * halfWidth;
    const leftY = sample.y + normalY * halfWidth;
    const rightX = sample.x - normalX * halfWidth;
    const rightY = sample.y - normalY * halfWidth;
    const barrierLeftX = sample.x + normalX * barrierOffset;
    const barrierLeftY = sample.y + normalY * barrierOffset;
    const barrierRightX = sample.x - normalX * barrierOffset;
    const barrierRightY = sample.y - normalY * barrierOffset;
    if (i === 0) {
      pathCenter.moveTo(sample.x, sample.y);
      pathLeft.moveTo(leftX, leftY);
      pathRight.moveTo(rightX, rightY);
      barrierLeft.moveTo(barrierLeftX, barrierLeftY);
      barrierRight.moveTo(barrierRightX, barrierRightY);
    } else {
      pathCenter.lineTo(sample.x, sample.y);
      pathLeft.lineTo(leftX, leftY);
      pathRight.lineTo(rightX, rightY);
      barrierLeft.lineTo(barrierLeftX, barrierLeftY);
      barrierRight.lineTo(barrierRightX, barrierRightY);
    }
  }
  const kerbA = new Path2D();
  const kerbB = new Path2D();
  let kerbAccum = 0;
  let kerbColorIndex = 0;
  for (let i = 0; i < sampleCount - 1; i += 1) {
    const current = samples[i];
    const next = samples[i + 1];
    const curvature = (current.curvature + next.curvature) * 0.5;
    if (curvature < 0.015) {
      kerbAccum = 0;
      continue;
    }
    const segmentLength = Math.hypot(next.x - current.x, next.y - current.y);
    kerbAccum += segmentLength;
    if (kerbAccum > 14) {
      kerbColorIndex += 1;
      kerbAccum = 0;
    }
    const currentNormalX = -Math.sin(current.ang);
    const currentNormalY = Math.cos(current.ang);
    const nextNormalX = -Math.sin(next.ang);
    const nextNormalY = Math.cos(next.ang);
    for (const side of [-1, 1]) {
      const ax = current.x + currentNormalX * halfWidth * side;
      const ay = current.y + currentNormalY * halfWidth * side;
      const bx = next.x + nextNormalX * halfWidth * side;
      const by = next.y + nextNormalY * halfWidth * side;
      const path = (kerbColorIndex + (side === 1 ? 0 : 1)) % 2 === 0 ? kerbA : kerbB;
      path.moveTo(ax, ay);
      path.lineTo(bx, by);
    }
  }
  return {
    samples,
    totalLength,
    startS: trackDef.startS,
    trackWidth: trackDef.trackWidth,
    decorations,
    paths: {
      center: pathCenter,
      left: pathLeft,
      right: pathRight,
      barrierLeft,
      barrierRight,
      kerbA,
      kerbB
    }
  };
}
function sampleTrackAt(track, s) {
  const safeS = wrap01(s);
  const index = safeS * track.samples.length;
  const index0 = Math.floor(index) % track.samples.length;
  const index1 = (index0 + 1) % track.samples.length;
  const fraction = index - Math.floor(index);
  const a = track.samples[index0];
  const b = track.samples[index1];
  return {
    x: lerp(a.x, b.x, fraction),
    y: lerp(a.y, b.y, fraction),
    ang: a.ang + signedAngleDiff(a.ang, b.ang) * fraction,
    curvature: lerp(a.curvature, b.curvature, fraction),
    speedLimit: lerp(a.speedLimit, b.speedLimit, fraction)
  };
}
function closestSNear(track, x, y, hintS) {
  const sampleCount = track.samples.length;
  const hintIndex = Math.round(wrap01(hintS) * sampleCount);
  let bestDistance = Infinity;
  let bestIndex = hintIndex;
  for (let offset = -55; offset <= 55; offset += 1) {
    const index = ((hintIndex + offset) % sampleCount + sampleCount) % sampleCount;
    const sample = track.samples[index];
    const distance = Math.hypot(sample.x - x, sample.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  return bestIndex / sampleCount;
}
function buildTrackInfo(trackDef, weatherKey, aiDifficulty, laps, rivals, lang, t) {
  return {
    id: trackDef.id,
    name: trackDef.name[lang],
    env: ENVIRONMENTS[trackDef.envId].name[lang],
    classification: trackDef.classification[lang],
    layout: trackDef.layoutLabel[lang],
    note: trackDef.note[lang],
    distanceKm: trackDef.distanceKm,
    turns: trackDef.turns,
    overtaking: trackDef.overtaking[lang],
    profile: trackDef.profile[lang],
    weather: WEATHER_PROFILES[weatherKey].label[lang],
    difficulty: t[aiDifficulty],
    laps,
    rivals
  };
}
function createStartProcedure(trackId, laps, rivals, aiDifficulty) {
  const difficultySeed = { easy: 7, medium: 19, hard: 31 }[aiDifficulty] || 7;
  const holdAfterFull = 0.48 + ((trackId + 1) * 23 + laps * 11 + rivals * 7 + difficultySeed) % 55 / 100;
  return {
    phase: "grid",
    elapsed: 0,
    lightCount: 0,
    gridDuration: 1.35,
    lightInterval: 0.72,
    holdAfterFull,
    goDuration: 0.7
  };
}
function buildStartOverlay(startProcedure, t, screen = "race") {
  if (!startProcedure || screen !== "race") {
    return { phase: "off", lights: Array.from({ length: SEM_LIGHTS }, () => false), caption: "", detail: "" };
  }
  if (startProcedure.phase === "grid") {
    return { phase: "grid", lights: Array.from({ length: SEM_LIGHTS }, () => false), caption: t.gridReady, detail: t.gridDetail };
  }
  if (startProcedure.phase === "lights") {
    return {
      phase: "lights",
      lights: Array.from({ length: SEM_LIGHTS }, (_, index) => index < startProcedure.lightCount),
      caption: t.watchLights,
      detail: t.watchLightsDetail
    };
  }
  if (startProcedure.phase === "go") {
    return { phase: "go", lights: Array.from({ length: SEM_LIGHTS }, () => false), caption: t.lightsOut, detail: t.lightsOutDetail };
  }
  return { phase: "off", lights: Array.from({ length: SEM_LIGHTS }, () => false), caption: "", detail: "" };
}
function getOrderedCars(game) {
  const getLiveS = (car) => {
    if (car.finished || !game.track)
      return car.s;
    return closestSNear(game.track, car.x, car.y, car.s);
  };
  const getProgressScore = (car) => {
    const liveS = getLiveS(car);
    const startS = game.track?.startS ?? 0;
    if (car.awaitingStartCross && car.lap <= 1) {
      const gridS = typeof car.gridS === "number" ? car.gridS : liveS;
      const distanceToStart = wrap01(startS - gridS);
      const traveledSinceGrid = wrap01(liveS - gridS);
      return traveledSinceGrid - distanceToStart;
    }
    return car.lap - 1 + wrap01(liveS - startS);
  };
  return [...game.cars].sort((a, b) => {
    const aProgress = getProgressScore(a);
    const bProgress = getProgressScore(b);
    if (a.finishOrder && b.finishOrder)
      return a.finishOrder - b.finishOrder;
    if (a.finishOrder)
      return -1;
    if (b.finishOrder)
      return 1;
    return bProgress - aProgress;
  });
}
function getRacePosition(game, car) {
  return getOrderedCars(game).findIndex((candidate) => candidate.id === car.id) + 1;
}
function buildLeaderboard(game, t) {
  const ordered = getOrderedCars(game);
  return ordered.map((car, index) => {
    const time = car.finishTime != null && game._raceStartTime != null ? formatRaceTime((car.finishTime - game._raceStartTime) / 1e3) : "--:--.-";
    return {
      pos: index + 1,
      isPlayer: car.isPlayer,
      color: car.color,
      driver: car.isPlayer ? t.you : `${t.rival} ${car.gridSlot}`,
      time,
      lap: car.lap,
      finished: car.finished
    };
  });
}
function buildSetupViewModel(trackDef, aiDifficulty, weatherKey, laps, rivals, lang, t) {
  return {
    mode: "race2dpro",
    coordinates: "origin_top_left_x_right_y_down",
    screen: "setup",
    phase: "setup",
    track: buildTrackInfo(trackDef, weatherKey, aiDifficulty, laps, rivals, lang, t),
    format: {
      startType: t.standingStart,
      lights: t.fiveLights,
      grid: t.staggeredGrid,
      laps,
      rivals,
      difficulty: t[aiDifficulty]
    },
    startOverlay: buildStartOverlay(null, t, "setup"),
    hud: {
      position: 1,
      total: rivals + 1,
      lap: 1,
      totalLaps: laps,
      speed: 0,
      weatherIcon: WEATHER_PROFILES[weatherKey].icon,
      timer: "0:00.0",
      message: trackDef.note[lang]
    },
    player: null,
    cars: [],
    leaderboard: [],
    message: trackDef.note[lang]
  };
}
function buildRaceViewModel(screen, game, weatherKey, aiDifficulty, lang, t) {
  const playerCar = game.cars.find((car) => car.isPlayer) || game.cars[0];
  const playerPosition = playerCar.finishOrder || getRacePosition(game, playerCar);
  const startOverlay = buildStartOverlay(game.startProcedure, t, screen);
  const leaderboard = game.pendingLeaderboard || buildLeaderboard(game, t);
  const finishPresentation = screen !== "end" && game.finishPresentation?.active ? {
    title: t.finishBanner,
    detail: playerCar?.finished ? `P${playerPosition}/${game.cars.length} | ${t.finishBannerDetail}` : t.finishBannerDetail
  } : null;
  const message = startOverlay.phase !== "off" ? startOverlay.detail : finishPresentation ? finishPresentation.detail : playerCar?.finished ? t.finishMessage : playerCar?.offTrack ? t.trackLimits : playerCar?.slipAngle > 0.13 && playerCar?.speed > 170 ? t.balanceCaution : game.trackDef.note[lang];
  return {
    mode: "race2dpro",
    coordinates: "origin_top_left_x_right_y_down",
    screen,
    phase: screen === "end" ? "finished" : finishPresentation ? "finish" : game.startProcedure.phase,
    track: buildTrackInfo(game.trackDef, weatherKey, aiDifficulty, game.totalLaps, game.cars.length - 1, lang, t),
    format: {
      startType: t.standingStart,
      lights: t.fiveLights,
      grid: t.staggeredGrid,
      laps: game.totalLaps,
      rivals: game.cars.length - 1,
      difficulty: t[aiDifficulty]
    },
    startOverlay: screen === "end" ? buildStartOverlay(null, t, "end") : startOverlay,
    hud: {
      position: playerPosition,
      total: game.cars.length,
      lap: clamp(playerCar?.lap || 1, 1, game.totalLaps),
      totalLaps: game.totalLaps,
      speed: Math.round((playerCar?.speed || 0) * SPEED_TO_KMH),
      weatherIcon: game.weather.icon,
      timer: formatRaceTime(game.raceElapsed),
      message
    },
    player: playerCar ? {
      id: playerCar.id,
      x: roundNumber(playerCar.x, 1),
      y: roundNumber(playerCar.y, 1),
      angle: roundNumber(playerCar.a, 2),
      progress: roundNumber(
        playerCar.finished || !game.track ? playerCar.s : closestSNear(game.track, playerCar.x, playerCar.y, playerCar.s),
        4
      ),
      lap: playerCar.lap,
      speedKmh: Math.round(playerCar.speed * SPEED_TO_KMH),
      slipAngle: roundNumber(playerCar.slipAngle, 3),
      surfaceGrip: roundNumber(playerCar.surfaceGrip, 2),
      offTrack: playerCar.offTrack,
      finished: playerCar.finished,
      gridSlot: playerCar.gridSlot
    } : null,
    cars: getOrderedCars(game).map((car) => ({
      id: car.id,
      isPlayer: car.isPlayer,
      x: roundNumber(car.x, 1),
      y: roundNumber(car.y, 1),
      angle: roundNumber(car.a, 2),
      progress: roundNumber(
        car.finished || !game.track ? car.s : closestSNear(game.track, car.x, car.y, car.s),
        4
      ),
      lap: car.lap,
      finished: car.finished,
      finishOrder: car.finishOrder,
      speedKmh: Math.round(car.speed * SPEED_TO_KMH),
      gridSlot: car.gridSlot
    })),
    finishPresentation,
    leaderboard,
    message
  };
}
var CAR_LIVERIES = [
  { primary: "#e8001e", secondary: "#ffffff", helmet: "#ffff00", number: "#ffffff" },
  { primary: "#1e41ff", secondary: "#ffdd00", helmet: "#ffffff", number: "#ffdd00" },
  { primary: "#ff8000", secondary: "#000000", helmet: "#ffffff", number: "#000000" },
  { primary: "#00d2be", secondary: "#c0c0c0", helmet: "#000000", number: "#000000" },
  { primary: "#3671c6", secondary: "#ff0000", helmet: "#ffffff", number: "#ff0000" },
  { primary: "#900000", secondary: "#ffd700", helmet: "#ffffff", number: "#ffd700" },
  { primary: "#005aff", secondary: "#ffffff", helmet: "#ff0000", number: "#ffffff" },
  { primary: "#2d826d", secondary: "#cedc00", helmet: "#000000", number: "#cedc00" }
];
function createCar(id, isPlayer, aiDifficulty, seedBase) {
  const livery = CAR_LIVERIES[id % CAR_LIVERIES.length];
  const seed = seedBase + id * 17.23;
  return {
    id,
    isPlayer,
    color: livery.primary,
    livery,
    x: 0,
    y: 0,
    a: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    s: 0,
    lap: 1,
    finished: false,
    finishTime: null,
    finishOrder: null,
    spawnGrace: 1.5,
    trail: [],
    dustParticles: [],
    offTrack: false,
    offTrackRecovery: 1,
    throttleState: 0,
    brakeState: 0,
    steerState: 0,
    yawRate: 0,
    slipAngle: 0,
    surfaceGrip: 1,
    collided: false,
    collisionCooldown: 0,
    aiProfile: isPlayer ? null : AI_PROFILES[aiDifficulty],
    ai: isPlayer ? null : {
      t: 0,
      noiseSeed: pseudoRandom(seed + 0.7) * 9999,
      lineOffset: (pseudoRandom(seed + 2.4) - 0.5) * 0.4
    },
    gridX: 0,
    gridY: 0,
    gridA: 0,
    gridS: 0,
    gridSlot: id + 1,
    gridSide: "left",
    trackOffset: 0,
    finishCoastSpeed: 0,
    awaitingStartCross: true
  };
}
function buildGridSlots(track, trackDef, totalCars) {
  return buildTrackSlots(track, track.startS, totalCars, {
    poleSide: trackDef.poleSide,
    direction: -1,
    rowSpacing: Math.max(46, track.trackWidth * 0.66),
    lateralScale: 0.54,
    stagger: 0.42
  });
}
function placeCarsOnGrid(cars, track, trackDef, playerGridIndex = 0) {
  const slots = buildGridSlots(track, trackDef, cars.length);
  const clampedPlayerGridIndex = clamp(playerGridIndex, 0, cars.length - 1);
  const playerCar = cars.find((car) => car.isPlayer) || cars[0];
  const aiCars = cars.filter((car) => !car.isPlayer);
  const orderedCars = Array.from({ length: cars.length }, () => null);
  orderedCars[clampedPlayerGridIndex] = playerCar;
  let aiIndex = 0;
  for (let i = 0; i < orderedCars.length; i += 1) {
    if (orderedCars[i])
      continue;
    orderedCars[i] = aiCars[aiIndex];
    aiIndex += 1;
  }
  for (let i = 0; i < orderedCars.length; i += 1) {
    const slot = slots[i];
    const car = orderedCars[i];
    car.x = slot.x;
    car.y = slot.y;
    car.a = slot.a;
    car.vx = 0;
    car.vy = 0;
    car.speed = 0;
    car.throttleState = 0;
    car.brakeState = 0;
    car.steerState = 0;
    car.yawRate = 0;
    car.slipAngle = 0;
    car.surfaceGrip = 1;
    car.collided = false;
    car.collisionCooldown = 0;
    car.s = slot.s;
    car.gridX = slot.x;
    car.gridY = slot.y;
    car.gridA = slot.a;
    car.gridS = slot.s;
    car.gridSlot = slot.slot;
    car.gridSide = slot.side;
    car.trackOffset = slot.trackOffset;
    car.finishCoastSpeed = 0;
    car.awaitingStartCross = true;
  }
}
function parkCarsOnFinish(track, orderedCars) {
  const slots = buildTrackSlots(track, track.startS + 2e-3, orderedCars.length, {
    poleSide: "left",
    direction: 1,
    rowSpacing: Math.max(52, track.trackWidth * 0.78),
    lateralScale: 0.42,
    stagger: 0.35,
    leadOffsetRows: 0.78
  });
  for (let index = 0; index < orderedCars.length; index += 1) {
    const car = orderedCars[index];
    const slot = slots[index];
    car.x = slot.x;
    car.y = slot.y;
    car.a = slot.a;
    car.vx = 0;
    car.vy = 0;
    car.speed = 0;
    car.throttleState = 0;
    car.brakeState = 0;
    car.steerState = 0;
    car.yawRate = 0;
    car.slipAngle = 0;
    car.s = slot.s;
    car.trackOffset = slot.trackOffset;
    car.finishCoastSpeed = 0;
  }
}
function finalizeRaceResults(game, t, { parkCars = true } = {}) {
  const orderedCars = getOrderedCars(game);
  orderedCars.forEach((car, index) => {
    if (!car.finishOrder) {
      car.finishOrder = index + 1;
    }
    if (!car.finished) {
      car.finished = true;
      car.finishTime = game.clockMs;
    }
  });
  game.finishOrder = orderedCars.map((car) => car.id);
  if (parkCars) {
    parkCarsOnFinish(game.track, orderedCars);
  }
  game.pendingLeaderboard = buildLeaderboard(game, t);
}
function beginFinishPresentation(game, playerCar, t) {
  if (game._endTriggered)
    return;
  finalizeRaceResults(game, t, { parkCars: false });
  game._endTriggered = true;
  game.endCountdown = FINISH_PRESENTATION_DURATION;
  game.finishPresentation = {
    active: true,
    playerOrder: playerCar?.finishOrder || null
  };
  if (!playerCar)
    return;
  const usableHalfWidth = getTrackUsableHalfWidth(game.track) * 0.58;
  playerCar.trackOffset = clamp(playerCar.trackOffset, -usableHalfWidth, usableHalfWidth);
  playerCar.finishCoastSpeed = clamp(playerCar.speed * 0.78, FINISH_COAST_MIN_SPEED, 220);
}
function advanceFinishedCar(car, track, dt, straightenToCenter = true) {
  if (!car.finished || car.finishCoastSpeed <= 0)
    return;
  const usableHalfWidth = getTrackUsableHalfWidth(track) * 0.58;
  car.trackOffset = straightenToCenter ? clamp(car.trackOffset * Math.max(0, 1 - dt * 1.2), -usableHalfWidth, usableHalfWidth) : clamp(car.trackOffset, -usableHalfWidth, usableHalfWidth);
  const travel = car.finishCoastSpeed * dt;
  car.finishCoastSpeed = Math.max(0, car.finishCoastSpeed - FINISH_COAST_DECEL * dt);
  car.s = wrap01(car.s + travel / Math.max(1, track.totalLength));
  const sample = sampleTrackAt(track, car.s);
  const normalX = -Math.sin(sample.ang);
  const normalY = Math.cos(sample.ang);
  const forwardX = Math.cos(sample.ang);
  const forwardY = Math.sin(sample.ang);
  car.a = sample.ang;
  car.x = sample.x + normalX * car.trackOffset;
  car.y = sample.y + normalY * car.trackOffset;
  car.vx = forwardX * car.finishCoastSpeed;
  car.vy = forwardY * car.finishCoastSpeed;
  car.speed = car.finishCoastSpeed;
  car.throttleState = 0;
  car.brakeState = 0;
  car.steerState = 0;
  car.yawRate = 0;
  car.slipAngle = 0;
  car.trail.unshift({ x: car.x, y: car.y, a: car.a });
  if (car.trail.length > 28)
    car.trail.pop();
}
function advanceFinishPresentation(game, dt) {
  if (!game.finishPresentation?.active)
    return;
  const playerCar = game.cars.find((car) => car.isPlayer);
  if (!playerCar)
    return;
  advanceFinishedCar(playerCar, game.track, dt, true);
}
function updateCar(car, dt, input, track, weatherProfile, allCars, startLocked) {
  if (car.finished || startLocked)
    return;
  const offTrackMultiplier = car.offTrack ? lerp(PHYS.OFF_TRACK_GRIP, 1, car.offTrackRecovery) : 1;
  const surfaceGrip = weatherProfile.gripMult * offTrackMultiplier;
  car.surfaceGrip = surfaceGrip;
  car.throttleState = approach(car.throttleState, input.throttle, PHYS.THROTTLE_RESPONSE, dt);
  car.brakeState = approach(car.brakeState, input.brake, PHYS.BRAKE_RESPONSE, dt);
  car.steerState = approach(car.steerState, input.steer, PHYS.STEER_RESPONSE, dt);
  const forwardX = Math.cos(car.a);
  const forwardY = Math.sin(car.a);
  const rightX = -forwardY;
  const rightY = forwardX;
  let longVel = car.vx * forwardX + car.vy * forwardY;
  let latVel = car.vx * rightX + car.vy * rightY;
  const offTrackSpeedFactor = car.offTrack ? lerp(PHYS.OFF_TRACK_MAX_SPEED_FACTOR, 1, car.offTrackRecovery) : 1;
  const maxSpeed = PHYS.MAX_SPEED * (car.aiProfile ? car.aiProfile.speedFactor : 1) * offTrackSpeedFactor;
  const speedRatio = clamp(Math.abs(longVel) / Math.max(1, maxSpeed), 0, 1.15);
  const driveAccel = PHYS.ENGINE_ACCEL * car.throttleState * clamp(1 - Math.pow(speedRatio, 1.45), 0.18, 1);
  const brakeAccel = PHYS.BRAKE_DECEL * car.brakeState;
  const dragAccel = PHYS.ROLLING_DRAG + Math.abs(longVel) * 0.055 + longVel * longVel * PHYS.AERO_DRAG;
  const engineBrake = car.throttleState < 0.08 ? PHYS.ENGINE_BRAKE : 0;
  longVel += (driveAccel - brakeAccel - dragAccel - engineBrake) * dt;
  longVel = clamp(longVel, 0, maxSpeed);
  const steerAuthority = clamp((Math.abs(longVel) - 18) / (maxSpeed * 0.58), 0, 1);
  const targetYawRate = car.steerState * PHYS.STEER_RATE * (0.18 + steerAuthority * 0.96) * (0.75 + surfaceGrip * 0.25);
  car.yawRate = approach(car.yawRate, targetYawRate, PHYS.YAW_RESPONSE, dt);
  car.a += car.yawRate * dt;
  const lateralGrip = PHYS.LATERAL_GRIP * surfaceGrip * (0.95 - speedRatio * 0.22) * (car.brakeState > 0.25 ? 0.94 : 1);
  latVel = lerp(latVel, 0, clamp(lateralGrip * dt, 0, 1));
  const alignedForwardX = Math.cos(car.a);
  const alignedForwardY = Math.sin(car.a);
  const alignedRightX = -alignedForwardY;
  const alignedRightY = alignedForwardX;
  const targetVx = alignedForwardX * longVel + alignedRightX * latVel;
  const targetVy = alignedForwardY * longVel + alignedRightY * latVel;
  const stabilityBlend = clamp(PHYS.LATERAL_STABILITY * surfaceGrip * dt, 0, 1);
  car.vx = lerp(car.vx, targetVx, stabilityBlend);
  car.vy = lerp(car.vy, targetVy, stabilityBlend);
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  car.speed = Math.hypot(car.vx, car.vy);
  const halfWidth = track.trackWidth / 2;
  const currentS = closestSNear(track, car.x, car.y, car.s);
  const closestPoint = sampleTrackAt(track, currentS);
  const dx = car.x - closestPoint.x;
  const dy = car.y - closestPoint.y;
  const distance = Math.hypot(dx, dy);
  car.trackOffset = dx * -Math.sin(closestPoint.ang) + dy * Math.cos(closestPoint.ang);
  if (distance > halfWidth + 4) {
    car.offTrack = true;
    car.offTrackRecovery = Math.max(0, car.offTrackRecovery - dt / PHYS.OFF_TRACK_RECOVERY);
    const overDistance = distance - (halfWidth + 4);
    car.x -= dx / distance * overDistance * 0.7;
    car.y -= dy / distance * overDistance * 0.7;
    const scrub = clamp(overDistance / 30, 0, 0.24);
    car.vx *= 1 - scrub * 0.12;
    car.vy *= 1 - scrub * 0.12;
    car.yawRate *= 0.96;
    if (car.dustParticles.length < 60 && Math.random() < 0.4) {
      const angle = Math.random() * Math.PI * 2;
      car.dustParticles.push({
        x: car.x,
        y: car.y,
        vx: Math.cos(angle) * (20 + Math.random() * 30),
        vy: Math.sin(angle) * (20 + Math.random() * 30),
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1
      });
    }
  } else {
    car.offTrack = false;
    car.offTrackRecovery = Math.min(1, car.offTrackRecovery + dt / PHYS.OFF_TRACK_RECOVERY);
  }
  for (let i = car.dustParticles.length - 1; i >= 0; i -= 1) {
    const particle = car.dustParticles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.92;
    particle.vy *= 0.92;
    particle.life -= dt;
    if (particle.life <= 0)
      car.dustParticles.splice(i, 1);
  }
  if (car.spawnGrace > 0)
    car.spawnGrace -= dt;
  if (car.collisionCooldown > 0)
    car.collisionCooldown -= dt;
  const deltaS = wrap01(currentS - car.s + 0.5) - 0.5;
  if (deltaS > 0)
    car.s = currentS;
  if (car.isPlayer) {
    for (const other of allCars) {
      if (other.id === car.id)
        continue;
      const nearDistance = Math.hypot(car.x - other.x, car.y - other.y);
      if (nearDistance < PHYS.CAR_RADIUS * 3.5 && nearDistance > PHYS.CAR_RADIUS * 2.2 && other.speed > car.speed) {
        car.vx += (other.vx - car.vx) * 4e-3;
        car.vy += (other.vy - car.vy) * 4e-3;
      }
    }
  }
  const slipForwardX = Math.cos(car.a);
  const slipForwardY = Math.sin(car.a);
  const slipRightX = -slipForwardY;
  const slipRightY = slipForwardX;
  const stabilizedLongVel = car.vx * slipForwardX + car.vy * slipForwardY;
  const stabilizedLatVel = car.vx * slipRightX + car.vy * slipRightY;
  car.slipAngle = Math.atan2(Math.abs(stabilizedLatVel), Math.max(32, Math.abs(stabilizedLongVel)));
  car.trail.unshift({ x: car.x, y: car.y, a: car.a });
  if (car.trail.length > 28)
    car.trail.pop();
}
function resolveCarCollisions(cars) {
  for (const car of cars) {
    car.collided = false;
  }
  for (let i = 0; i < cars.length; i += 1) {
    const a = cars[i];
    if (a.finished || a.spawnGrace > 0)
      continue;
    for (let j = i + 1; j < cars.length; j += 1) {
      const b = cars[j];
      if (b.finished || b.spawnGrace > 0)
        continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      const minimumDistance = PHYS.CAR_RADIUS * 2.02;
      if (distance >= minimumDistance)
        continue;
      const safeDistance = Math.max(distance, 1e-3);
      const nx = dx / safeDistance;
      const ny = dy / safeDistance;
      const overlap = minimumDistance - safeDistance;
      const separation = overlap * PHYS.COLLISION_SEPARATION;
      a.x -= nx * separation;
      a.y -= ny * separation;
      b.x += nx * separation;
      b.y += ny * separation;
      const relativeVx = b.vx - a.vx;
      const relativeVy = b.vy - a.vy;
      const closingSpeed = relativeVx * nx + relativeVy * ny;
      if (closingSpeed < 0) {
        const impulse = -closingSpeed * 0.32;
        a.vx -= nx * impulse;
        a.vy -= ny * impulse;
        b.vx += nx * impulse;
        b.vy += ny * impulse;
      }
      a.vx *= PHYS.COLLISION_VELOCITY_DAMP;
      a.vy *= PHYS.COLLISION_VELOCITY_DAMP;
      b.vx *= PHYS.COLLISION_VELOCITY_DAMP;
      b.vy *= PHYS.COLLISION_VELOCITY_DAMP;
      a.speed = Math.hypot(a.vx, a.vy);
      b.speed = Math.hypot(b.vx, b.vy);
      a.yawRate *= PHYS.COLLISION_YAW_DAMP;
      b.yawRate *= PHYS.COLLISION_YAW_DAMP;
      a.throttleState = Math.min(a.throttleState, PHYS.COLLISION_THROTTLE_CLAMP);
      b.throttleState = Math.min(b.throttleState, PHYS.COLLISION_THROTTLE_CLAMP);
      if (a.collisionCooldown <= 0) {
        a.collided = true;
        a.collisionCooldown = PHYS.COLLISION_COOLDOWN;
      }
      if (b.collisionCooldown <= 0) {
        b.collided = true;
        b.collisionCooldown = PHYS.COLLISION_COOLDOWN;
      }
    }
  }
}
function computeAiInput(car, track, weatherProfile, allCars) {
  const profile = car.aiProfile;
  const ai = car.ai;
  ai.t += 0.016;
  const speedRatio = car.speed / PHYS.MAX_SPEED;
  const shortLook = 0.02 + speedRatio * 0.03;
  const longLook = 0.06 + speedRatio * 0.04;
  const targetS = wrap01(car.s + shortLook);
  const target = sampleTrackAt(track, targetS);
  const longTarget = sampleTrackAt(track, wrap01(car.s + longLook));
  const isCorner = target.curvature > 0.018;
  const normalX = -Math.sin(target.ang);
  const normalY = Math.cos(target.ang);
  let apexOffset = 0;
  if (isCorner) {
    const prevTarget = sampleTrackAt(track, wrap01(targetS - 5e-3));
    const angleChange = angNorm(target.ang - prevTarget.ang);
    apexOffset = Math.sign(angleChange) * track.trackWidth * 0.28 * profile.apexPrecision;
  }
  const noiseOffset = Math.sin(ai.t * 0.35 + ai.noiseSeed) * track.trackWidth * profile.lineOffset * 0.4;
  const baseOffset = apexOffset + noiseOffset + ai.lineOffset * profile.lineOffset * track.trackWidth * 0.15;
  let overtakeShift = 0;
  for (const other of allCars) {
    if (other.id === car.id)
      continue;
    const relX = other.x - car.x;
    const relY = other.y - car.y;
    const along = relX * Math.cos(car.a) + relY * Math.sin(car.a);
    const lateral = -relX * Math.sin(car.a) + relY * Math.cos(car.a);
    if (along > 0 && along < 60 && Math.abs(lateral) < 24) {
      overtakeShift = lateral < 0 ? 10 : -10;
    }
  }
  const targetX = target.x + normalX * (baseOffset + overtakeShift);
  const targetY = target.y + normalY * (baseOffset + overtakeShift);
  let angleDiff = angNorm(Math.atan2(targetY - car.y, targetX - car.x) - car.a);
  if (Math.random() < profile.errorRate) {
    angleDiff += (Math.random() - 0.5) * profile.errorMag * 2;
  }
  const steer = clamp(angleDiff * 2.25, -1, 1);
  const targetSpeed = longTarget.speedLimit * weatherProfile.gripMult * profile.speedFactor / profile.brakeMargin;
  const speedDiff = car.speed - targetSpeed;
  const brake = speedDiff > 0 ? clamp(speedDiff / 92, 0, 1) : 0;
  const throttle = brake > 0.06 ? 0 : speedDiff < -8 ? clamp((targetSpeed - car.speed) / 80, 0.16, isCorner ? 0.72 : 1) : isCorner ? 0.2 : 0.38;
  return { throttle, brake, steer };
}
function checkLapCross(car, prevS, startS, totalLaps, clockMs, onFinish) {
  const prevFromStart = wrap01(prevS - startS);
  const currentFromStart = wrap01(car.s - startS);
  const crossed = prevFromStart > 0.85 && currentFromStart < 0.15;
  if (!crossed)
    return;
  if (car.awaitingStartCross) {
    car.awaitingStartCross = false;
    return;
  }
  if (car.lap >= totalLaps) {
    car.finished = true;
    car.finishTime = clockMs;
    car.finishCoastSpeed = clamp(car.speed * 0.82, FINISH_COAST_MIN_SPEED, 220);
    onFinish(car);
  } else {
    car.lap += 1;
  }
}
function getPlayerInput(keys, joy, touchInput) {
  let throttle = 0;
  let brake = 0;
  let steer = 0;
  if (joy.active) {
    throttle = clamp(-joy.dy / 42, 0, 1);
    brake = clamp(joy.dy / 42, 0, 1);
    steer = clamp(joy.dx / 42, -1, 1);
  } else {
    if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Numpad8"))
      throttle = 1;
    if (keys.has("ArrowDown") || keys.has("KeyS") || keys.has("Numpad2"))
      brake = 1;
    if (keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("Numpad4"))
      steer = -1;
    if (keys.has("ArrowRight") || keys.has("KeyD") || keys.has("Numpad6"))
      steer = 1;
  }
  if (touchInput.touchThrottle)
    throttle = 1;
  if (touchInput.touchBrake)
    brake = 1;
  return { throttle, brake, steer };
}
function updateStartProcedure(game, dt) {
  const start = game.startProcedure;
  let changed = false;
  start.elapsed += dt;
  if (start.phase === "grid" && start.elapsed >= start.gridDuration) {
    start.phase = "lights";
    start.elapsed = 0;
    start.lightCount = 0;
    return true;
  }
  if (start.phase === "lights") {
    const nextLightCount = Math.min(SEM_LIGHTS, Math.floor(start.elapsed / start.lightInterval));
    if (nextLightCount !== start.lightCount) {
      start.lightCount = nextLightCount;
      changed = true;
    }
    if (start.elapsed >= start.lightInterval * SEM_LIGHTS + start.holdAfterFull) {
      start.phase = "go";
      start.elapsed = 0;
      start.lightCount = 0;
      game._raceStartTime = game.clockMs;
      return true;
    }
  }
  if (start.phase === "go" && start.elapsed >= start.goDuration) {
    start.phase = "racing";
    start.elapsed = 0;
    return true;
  }
  return changed;
}
function stepRaceState(game, dt, playerInput, t) {
  game.clockMs += dt * 1e3;
  game.time += dt;
  if (game._endTriggered) {
    for (const car of game.cars) {
      if (!car.isPlayer)
        advanceFinishedCar(car, game.track, dt, false);
    }
    advanceFinishPresentation(game, dt);
    game.endCountdown -= dt;
    if (game.endCountdown <= 0) {
      if (game.finishPresentation?.active) {
        parkCarsOnFinish(game.track, getOrderedCars(game));
        game.finishPresentation.active = false;
      }
      return { requestScreen: "end", importantChange: true };
    }
    return { importantChange: false };
  }
  const startChanged = updateStartProcedure(game, dt);
  const startLocked = game.startProcedure.phase !== "racing";
  const playerCar = game.cars.find((car) => car.isPlayer);
  for (const car of game.cars) {
    const prevS = car.s;
    let input;
    if (car.isPlayer) {
      input = startLocked ? { throttle: 0, brake: 0, steer: 0 } : playerInput;
    } else if (game.startProcedure.phase === "racing") {
      input = computeAiInput(car, game.track, game.weather, game.cars);
    } else {
      input = { throttle: 0, brake: 0, steer: 0 };
    }
    updateCar(car, dt, input, game.track, game.weather, game.cars, startLocked);
    if (game.startProcedure.phase === "racing") {
      checkLapCross(car, prevS, game.track.startS, game.totalLaps, game.clockMs, (finishedCar) => {
        finishedCar.finishOrder = game.finishOrder.length + 1;
        game.finishOrder.push(finishedCar.id);
      });
    }
  }
  if (game.startProcedure.phase === "racing") {
    resolveCarCollisions(game.cars);
  }
  for (const car of game.cars) {
    if (!car.isPlayer)
      advanceFinishedCar(car, game.track, dt, false);
  }
  if (game.startProcedure.phase === "racing" && game._raceStartTime != null) {
    game.raceElapsed = Math.max(0, (game.clockMs - game._raceStartTime) / 1e3);
  }
  if (game.startProcedure.phase === "racing") {
    const playerFinished = Boolean(playerCar && playerCar.finished);
    const allFinished = game.cars.every((car) => car.finished);
    if (playerFinished) {
      beginFinishPresentation(game, playerCar, t);
      return { importantChange: true };
    }
    if (allFinished) {
      finalizeRaceResults(game, t);
      game._endTriggered = true;
      game.endCountdown = 0.8;
      return { importantChange: true };
    }
  }
  return { importantChange: startChanged };
}
function renderBackground(ctx, width, height, env, weatherProfile, time) {
  ctx.fillStyle = env.bgColor;
  ctx.fillRect(0, 0, width, height);
  if (weatherProfile.rainOverlay) {
    ctx.save();
    ctx.strokeStyle = "rgba(140,190,255,0.16)";
    ctx.lineWidth = 1;
    const offset = time * 280 % 55;
    for (let x = -60; x < width + 60; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset + 28, height);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (weatherProfile.id === "dusk") {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, height * 0.15, width / 2, height / 2, height * 0.85);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(25,12,0,0.50)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
function renderDecorations(ctx, track, env) {
  if (!track.decorations)
    return;
  for (const decoration of track.decorations) {
    if (decoration.type === "tree") {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.ellipse(decoration.x + 3, decoration.y + 4, decoration.radius * 0.9, decoration.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = decoration.color;
      ctx.beginPath();
      ctx.arc(decoration.x, decoration.y, decoration.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = decoration.highlight || decoration.color;
      ctx.beginPath();
      ctx.arc(decoration.x - decoration.radius * 0.2, decoration.y - decoration.radius * 0.2, decoration.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (decoration.type === "stand") {
      ctx.save();
      ctx.translate(decoration.x, decoration.y);
      ctx.rotate(decoration.ang + Math.PI / 2);
      ctx.fillStyle = "rgba(60,60,80,0.85)";
      ctx.fillRect(-decoration.w / 2, -decoration.h / 2, decoration.w, decoration.h);
      ctx.fillStyle = "rgba(30,30,50,0.9)";
      ctx.fillRect(-decoration.w / 2, -decoration.h / 2, decoration.w, 10);
      ctx.restore();
    } else if (decoration.type === "crowd") {
      const crowdColors = ["#c44", "#c84", "#48c", "#8c4", "#c48", "#888"];
      ctx.fillStyle = crowdColors[(decoration.row * 3 + (decoration.col + 4)) % crowdColors.length];
      ctx.beginPath();
      ctx.arc(decoration.x, decoration.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function updateFollowCamera(camera, player, dt) {
  const lookAhead = 110 + player.speed * 0.46;
  const targetX = player.x + Math.cos(player.a) * lookAhead + player.vx * 0.14;
  const targetY = player.y + Math.sin(player.a) * lookAhead + player.vy * 0.14;
  const blend = clamp(dt * 4, 0, 1);
  camera.x = lerp(camera.x, targetX, blend);
  camera.y = lerp(camera.y, targetY, blend);
  const targetZoom = clamp(0.94 - player.speed / PHYS.MAX_SPEED * 0.2, 0.68, 0.94);
  camera.zoom = lerp(camera.zoom, targetZoom, clamp(dt * 2.6, 0, 1));
  camera.shakeX = lerp(camera.shakeX || 0, 0, clamp(dt * 8, 0, 1));
  camera.shakeY = lerp(camera.shakeY || 0, 0, clamp(dt * 8, 0, 1));
}
function applyCameraTransform(ctx, camera, width, height) {
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    width / 2 - (camera.x + (camera.shakeX || 0)) * camera.zoom,
    height / 2 - (camera.y + (camera.shakeY || 0)) * camera.zoom
  );
}
function renderTrack(ctx, track, env) {
  const samples = track.samples;
  const finishIndex = Math.floor(track.startS * samples.length);
  const finishSample = samples[finishIndex];
  const squareWidth = Math.max(6, track.trackWidth / 8);
  const squareHeight = 10;
  const squareCount = Math.round(track.trackWidth / squareWidth);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  let runoffColor = env.runoffColor;
  if (env.runoffType === "grass")
    runoffColor = env.grassColor || "#2a6030";
  else if (env.runoffType === "sand")
    runoffColor = env.runoffColor || "#c8a058";
  else if (env.runoffType === "snow")
    runoffColor = "#dce8f0";
  else if (env.runoffType === "gravel")
    runoffColor = "#8a7860";
  ctx.strokeStyle = runoffColor;
  ctx.lineWidth = track.trackWidth + 70;
  ctx.stroke(track.paths.center);
  ctx.lineWidth = 5;
  ctx.strokeStyle = env.barrierColor || "#1e5eff";
  ctx.stroke(track.paths.barrierLeft);
  ctx.stroke(track.paths.barrierRight);
  ctx.strokeStyle = env.roadColor;
  ctx.lineWidth = track.trackWidth + 2;
  ctx.stroke(track.paths.center);
  const roadHex = env.roadColor.replace("#", "");
  const roadR = parseInt(roadHex.slice(0, 2), 16);
  const roadG = parseInt(roadHex.slice(2, 4), 16);
  const roadB = parseInt(roadHex.slice(4, 6), 16);
  ctx.strokeStyle = `rgba(${Math.min(255, roadR + 18)},${Math.min(255, roadG + 18)},${Math.min(255, roadB + 18)},0.5)`;
  ctx.lineWidth = track.trackWidth * 0.5;
  ctx.stroke(track.paths.center);
  ctx.setLineDash([20, 15]);
  ctx.strokeStyle = env.centerLineColor;
  ctx.lineWidth = 2;
  ctx.stroke(track.paths.center);
  ctx.setLineDash([]);
  ctx.save();
  ctx.translate(finishSample.x, finishSample.y);
  ctx.rotate(finishSample.ang);
  for (let col = 0; col < squareCount; col += 1) {
    for (let row = 0; row < 2; row += 1) {
      ctx.fillStyle = (col + row) % 2 === 0 ? "#ffffff" : "#1a1a1a";
      ctx.fillRect(-squareHeight / 2 + row * squareHeight, -track.trackWidth / 2 + col * squareWidth, squareHeight, squareWidth);
    }
  }
  ctx.restore();
  ctx.lineWidth = 8;
  ctx.strokeStyle = env.kerbRed || "#e03030";
  ctx.stroke(track.paths.kerbA);
  ctx.strokeStyle = env.kerbWhite || "#f3f3f3";
  ctx.stroke(track.paths.kerbB);
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(255,255,255,0.3)";
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 2.5;
  ctx.stroke(track.paths.left);
  ctx.stroke(track.paths.right);
  ctx.restore();
}
function renderStartingBoxes(ctx, cars, phase, phaseTimer, env) {
  if (phase === "racing" || phase === "off")
    return;
  const alpha = phase === "go" ? Math.max(0, 1 - phaseTimer / 0.7) : 0.82;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = env.borderColor;
  ctx.lineWidth = 1.6;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.shadowBlur = 10;
  ctx.shadowColor = env.borderColor;
  for (const car of cars) {
    ctx.save();
    ctx.translate(car.gridX, car.gridY);
    ctx.rotate(car.gridA);
    ctx.beginPath();
    ctx.moveTo(-20, -12);
    ctx.lineTo(16, -12);
    ctx.lineTo(16, 12);
    ctx.lineTo(-20, 12);
    ctx.stroke();
    ctx.fillRect(-20, -12, 36, 24);
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(car.gridSlot), -26, 0);
    ctx.restore();
  }
  ctx.restore();
}
function renderCar(ctx, car, isPlayer) {
  const livery = car.livery || { primary: car.color, secondary: "#ffffff", helmet: "#ffffff", number: "#ffffff" };
  for (let i = 0; i < car.trail.length; i += 1) {
    const trail = car.trail[i];
    const alpha = (1 - i / car.trail.length) * (isPlayer ? 0.18 : 0.1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(trail.x, trail.y);
    ctx.rotate(trail.a);
    ctx.fillStyle = livery.primary;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(0.1, 6.2 - i * 0.18), Math.max(0.1, 3 - i * 0.06), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (car.dustParticles.length > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(180,160,120,0.8)";
    for (const particle of car.dustParticles) {
      ctx.globalAlpha = particle.life / particle.maxLife * 0.55;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 4 * (particle.life / particle.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.a);
  if (isPlayer) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = livery.primary;
  }
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.beginPath();
  ctx.ellipse(3, 3, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(6, -10, 8, 5, 2);
  else
    ctx.rect(6, -10, 8, 5);
  ctx.fill();
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(6, 5, 8, 5, 2);
  else
    ctx.rect(6, 5, 8, 5);
  ctx.fill();
  ctx.fillStyle = livery.primary;
  ctx.beginPath();
  ctx.moveTo(-14, -6);
  ctx.lineTo(14, -8);
  ctx.lineTo(14, 8);
  ctx.lineTo(-14, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = livery.secondary;
  ctx.beginPath();
  ctx.moveTo(-6, -4.5);
  ctx.lineTo(10, -5.5);
  ctx.lineTo(10, -3.5);
  ctx.lineTo(-6, -2.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = livery.secondary;
  ctx.beginPath();
  ctx.moveTo(-14, -12);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-10, 8);
  ctx.lineTo(-14, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = livery.primary;
  ctx.fillRect(-15, -13, 3, 4);
  ctx.fillRect(-15, 9, 3, 4);
  ctx.fillStyle = livery.secondary;
  ctx.fillRect(11, -10, 5, 20);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(13, -5, 1, 10);
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(-14, -10, 8, 5, 2);
  else
    ctx.rect(-14, -10, 8, 5);
  ctx.fill();
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(-14, 5, 8, 5, 2);
  else
    ctx.rect(-14, 5, 8, 5);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(-13, -10, 3, 2);
  ctx.fillRect(-13, 5, 3, 2);
  ctx.fillRect(7, -10, 3, 2);
  ctx.fillRect(7, 5, 3, 2);
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(-2, -4, 10, 8, 4);
  else
    ctx.rect(-2, -4, 10, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,200,200,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(2, 0, 5, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = livery.helmet;
  ctx.beginPath();
  ctx.arc(1, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,180,255,0.7)";
  ctx.beginPath();
  ctx.arc(2, 0, 2, -0.8, 0.8);
  ctx.fill();
  ctx.fillStyle = livery.number;
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(car.id === 0 ? "P1" : String(car.id), 7, 0);
  ctx.restore();
}
function renderPlayerTag(ctx, car, label) {
  ctx.save();
  ctx.translate(car.x, car.y - 30);
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textWidth = ctx.measureText(label).width;
  const bubbleWidth = textWidth + 16;
  const bubbleHeight = 18;
  ctx.fillStyle = "rgba(8, 14, 20, 0.92)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(79, 214, 255, 0.34)";
  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 999);
  else
    ctx.rect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#bdf4ff";
  ctx.fillText(label, 0, 0);
  ctx.restore();
}
function renderMinimap(ctx, track, cars, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(4,4,12,0.92)";
  ctx.fillRect(0, 0, width, height);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const sample of track.samples) {
    minX = Math.min(minX, sample.x);
    maxX = Math.max(maxX, sample.x);
    minY = Math.min(minY, sample.y);
    maxY = Math.max(maxY, sample.y);
  }
  const pad = 7;
  const scale2 = Math.min((width - pad * 2) / (maxX - minX || 1), (height - pad * 2) / (maxY - minY || 1));
  const offsetX = pad + (width - pad * 2 - (maxX - minX) * scale2) / 2 - minX * scale2;
  const offsetY = pad + (height - pad * 2 - (maxY - minY) * scale2) / 2 - minY * scale2;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= track.samples.length; i += 1) {
    const sample = track.samples[i % track.samples.length];
    const drawX = sample.x * scale2 + offsetX;
    const drawY = sample.y * scale2 + offsetY;
    if (i === 0)
      ctx.moveTo(drawX, drawY);
    else
      ctx.lineTo(drawX, drawY);
  }
  ctx.stroke();
  for (const car of cars) {
    ctx.save();
    ctx.shadowBlur = car.isPlayer ? 8 : 0;
    ctx.shadowColor = car.color;
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.arc(car.x * scale2 + offsetX, car.y * scale2 + offsetY, car.isPlayer ? 3.5 : 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
function TrackPreviewCanvas({ track, active }) {
  const canvasRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    const pixelRatio = window.devicePixelRatio || 1;
    const width = (canvas.offsetWidth || 120) * pixelRatio;
    const height = (canvas.offsetHeight || 90) * pixelRatio;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    const env = ENVIRONMENTS[track.envId];
    ctx.fillStyle = env.bgColor;
    ctx.fillRect(0, 0, width, height);
    const xs = track.raw.map((point) => point[0]);
    const ys = track.raw.map((point) => point[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const scale2 = Math.min(width * 0.74 / spanX, height * 0.64 / spanY);
    const offsetX = width / 2 - (minX + maxX) / 2 * scale2;
    const offsetY = height / 2 - (minY + maxY) / 2 * scale2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = env.borderColor;
    ctx.strokeStyle = active ? env.borderColor : "rgba(255,255,255,0.30)";
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let index = 0; index <= track.raw.length; index += 1) {
      const point = track.raw[index % track.raw.length];
      const drawX = point[0] * scale2 + offsetX;
      const drawY = point[1] * scale2 + offsetY;
      if (index === 0)
        ctx.moveTo(drawX, drawY);
      else
        ctx.lineTo(drawX, drawY);
    }
    ctx.closePath();
    ctx.stroke();
  }, [track, active]);
  return /* @__PURE__ */ import_react2.default.createElement("canvas", { ref: canvasRef, className: "r2p__trackPreview" });
}
function RaceGame2DPro() {
  const lang = navigator.language?.startsWith("es") ? "es" : "en";
  const t = (0, import_react2.useMemo)(() => ({
    es: {
      title: "Race 2D Pro",
      subtitle: "6 circuitos nuevos | Parrilla escalonada | 5 luces | Fisica revisada",
      selectTrack: "Circuito",
      selectDifficulty: "Dificultad IA",
      selectWeather: "Clima",
      easy: "Facil",
      medium: "Medio",
      hard: "Dificil",
      laps: "Vueltas",
      rivals: "Rivales",
      startRace: "Lanzar carrera",
      raceOver: "Carrera terminada",
      restart: "Reiniciar",
      backToSetup: "Volver al setup",
      posLabel: "POS",
      lapLabel: "VUELTA",
      speedUnit: "km/h",
      you: "Tu",
      rival: "Rival",
      keyHint: "UP/DOWN acelerar-frenar | LEFT/RIGHT girar | R reinicia",
      standingStart: "Salida detenida",
      fiveLights: "5 luces rojas",
      staggeredGrid: "Parrilla escalonada",
      gridReady: "Parrilla formada",
      gridDetail: "Completada la vuelta de formacion. Mantente preparado para la secuencia.",
      watchLights: "Observa las luces",
      watchLightsDetail: "Cada luz roja se enciende de forma secuencial. No muevas el coche hasta el apagado.",
      lightsOut: "GO!",
      lightsOutDetail: "Luces fuera. Gestiona la traccion y busca la referencia de frenada de T1.",
      finishMessage: "Bandera a cuadros. Clasificacion final confirmada.",
      finishBanner: "BANDERA A CUADROS",
      finishBannerDetail: "Cruce confirmado. Mantente en la recta mientras cerramos la clasificacion.",
      trackLimits: "Fuera de pista: el agarre cae, la frenada se alarga y el coche pierde velocidad.",
      balanceCaution: "El coche esta deslizando. Suelta direccion y recupera apoyo antes de volver a acelerar.",
      distanceLabel: "Longitud",
      turnsLabel: "Curvas",
      overtakingLabel: "Adelantamiento",
      profileLabel: "Perfil"
    },
    en: {
      title: "Race 2D Pro",
      subtitle: "6 new circuits | Staggered grid | 5 lights | Reworked physics",
      selectTrack: "Circuit",
      selectDifficulty: "AI difficulty",
      selectWeather: "Weather",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      laps: "Laps",
      rivals: "Rivals",
      startRace: "Launch race",
      raceOver: "Race over",
      restart: "Restart",
      backToSetup: "Back to setup",
      posLabel: "POS",
      lapLabel: "LAP",
      speedUnit: "km/h",
      you: "You",
      rival: "Rival",
      keyHint: "UP/DOWN throttle-brake | LEFT/RIGHT steer | R restart",
      standingStart: "Standing start",
      fiveLights: "5 red lights",
      staggeredGrid: "Staggered grid",
      gridReady: "Grid formed",
      gridDetail: "Formation lap complete. Stay ready for the light sequence.",
      watchLights: "Watch the lights",
      watchLightsDetail: "Each red light illuminates in sequence. Do not release the car before lights out.",
      lightsOut: "GO!",
      lightsOutDetail: "Lights out. Manage traction and commit to the first braking point.",
      finishMessage: "Chequered flag. Final classification confirmed.",
      finishBanner: "CHEQUERED FLAG",
      finishBannerDetail: "Finish confirmed. Hold the straight while we lock the final classification.",
      trackLimits: "Off track: grip drops, braking distances grow, and the car sheds speed.",
      balanceCaution: "The car is sliding. Open the steering and let the platform settle before reapplying throttle.",
      distanceLabel: "Distance",
      turnsLabel: "Turns",
      overtakingLabel: "Overtaking",
      profileLabel: "Profile"
    }
  })[lang], [lang]);
  const [screen, setScreen] = (0, import_react2.useState)("setup");
  const [selectedTrackId, setSelectedTrackId] = (0, import_react2.useState)(RACE2DPRO_CIRCUITS[0].id);
  const [aiDifficulty, setAiDifficulty] = (0, import_react2.useState)("medium");
  const weatherKey = FIXED_WEATHER_KEY;
  const [laps, setLaps] = (0, import_react2.useState)(3);
  const [rivals, setRivals] = (0, import_react2.useState)(5);
  const [joyKnob, setJoyKnob] = (0, import_react2.useState)({ dx: 0, dy: 0 });
  const [viewModel, setViewModel] = (0, import_react2.useState)(
    buildSetupViewModel(RACE2DPRO_CIRCUITS[0], "medium", "dry", 3, 5, lang, t)
  );
  const canvasRef = (0, import_react2.useRef)(null);
  const minimapRef = (0, import_react2.useRef)(null);
  const rafRef = (0, import_react2.useRef)(null);
  const lastRef = (0, import_react2.useRef)(performance.now());
  const gameRef = (0, import_react2.useRef)(null);
  const keysRef = (0, import_react2.useRef)(/* @__PURE__ */ new Set());
  const inputRef = (0, import_react2.useRef)({ throttle: 0, brake: 0, steer: 0, touchThrottle: false, touchBrake: false });
  const joyRef = (0, import_react2.useRef)({ active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 });
  const frameCountRef = (0, import_react2.useRef)(0);
  const pendingStartRef = (0, import_react2.useRef)(false);
  const drawFrameRef = (0, import_react2.useRef)(() => void 0);
  const stepFrameRef = (0, import_react2.useRef)(() => ({ importantChange: false }));
  const screenRef = (0, import_react2.useRef)(screen);
  const selectedTrack = RACE2DPRO_CIRCUITS.find((track) => track.id === selectedTrackId) || RACE2DPRO_CIRCUITS[0];
  (0, import_react2.useEffect)(() => {
    screenRef.current = screen;
  }, [screen]);
  (0, import_react2.useEffect)(() => {
    if (screen === "setup") {
      setViewModel(buildSetupViewModel(selectedTrack, aiDifficulty, weatherKey, laps, rivals, lang, t));
    }
  }, [screen, selectedTrack, aiDifficulty, weatherKey, laps, rivals, lang, t]);
  const syncRaceViewModel = (0, import_react2.useCallback)((screenName = "race") => {
    if (!gameRef.current)
      return;
    setViewModel(buildRaceViewModel(screenName, gameRef.current, weatherKey, aiDifficulty, lang, t));
  }, [weatherKey, aiDifficulty, lang, t]);
  const initializeRace = (0, import_react2.useCallback)(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return false;
    const pixelRatio = window.devicePixelRatio || 1;
    const width = (canvas.clientWidth || 800) * pixelRatio;
    const height = (canvas.clientHeight || 600) * pixelRatio;
    canvas.width = width;
    canvas.height = height;
    const track = buildTrack(selectedTrack, width, height);
    const env = ENVIRONMENTS[selectedTrack.envId];
    const weather = WEATHER_PROFILES[weatherKey];
    const seedBase = (selectedTrack.id + 1) * 101 + laps * 17 + rivals * 13 + ({ easy: 5, medium: 11, hard: 19 }[aiDifficulty] || 5);
    const cars = [];
    for (let i = 0; i < rivals + 1; i += 1) {
      cars.push(createCar(i, i === 0, aiDifficulty, seedBase));
    }
    const playerGridIndex = Math.floor(Math.random() * cars.length);
    placeCarsOnGrid(cars, track, selectedTrack, playerGridIndex);
    const startPoint = sampleTrackAt(track, track.startS);
    gameRef.current = {
      cars,
      playerGridIndex,
      track,
      trackDef: selectedTrack,
      env,
      weather,
      weatherKey,
      totalLaps: laps,
      finishOrder: [],
      time: 0,
      clockMs: 0,
      raceElapsed: 0,
      _raceStartTime: null,
      _endTriggered: false,
      endCountdown: 0,
      pendingLeaderboard: null,
      finishPresentation: null,
      camera: { x: startPoint.x, y: startPoint.y, zoom: 1, shakeX: 0, shakeY: 0 },
      startProcedure: createStartProcedure(selectedTrack.id, laps, rivals, aiDifficulty)
    };
    keysRef.current.clear();
    inputRef.current = { throttle: 0, brake: 0, steer: 0, touchThrottle: false, touchBrake: false };
    joyRef.current = { active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 };
    frameCountRef.current = 0;
    setJoyKnob({ dx: 0, dy: 0 });
    setViewModel(buildRaceViewModel("race", gameRef.current, weatherKey, aiDifficulty, lang, t));
    return true;
  }, [selectedTrack, weatherKey, laps, rivals, aiDifficulty, lang, t]);
  const startRace = (0, import_react2.useCallback)(() => {
    setScreen("race");
    pendingStartRef.current = !initializeRace();
  }, [initializeRace]);
  (0, import_react2.useEffect)(() => {
    if (screen !== "race" || !pendingStartRef.current)
      return;
    if (initializeRace())
      pendingStartRef.current = false;
  }, [screen, initializeRace]);
  const onJoyStart = (0, import_react2.useCallback)((event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joyRef.current = { active: true, pointerId: event.pointerId, cx, cy, dx: 0, dy: 0 };
  }, []);
  const onJoyMove = (0, import_react2.useCallback)((event) => {
    const joy = joyRef.current;
    if (!joy.active || event.pointerId !== joy.pointerId)
      return;
    const rawDx = event.clientX - joy.cx;
    const rawDy = event.clientY - joy.cy;
    const maxRadius = 45;
    const distance = Math.hypot(rawDx, rawDy);
    const factor = distance > maxRadius ? maxRadius / distance : 1;
    const dx = rawDx * factor;
    const dy = rawDy * factor;
    joyRef.current.dx = dx;
    joyRef.current.dy = dy;
    setJoyKnob({ dx, dy });
  }, []);
  const onJoyEnd = (0, import_react2.useCallback)((event) => {
    if (event.pointerId !== joyRef.current.pointerId)
      return;
    joyRef.current = { active: false, pointerId: null, cx: 0, cy: 0, dx: 0, dy: 0 };
    setJoyKnob({ dx: 0, dy: 0 });
  }, []);
  const onTouchThrottle = (0, import_react2.useCallback)((value) => {
    inputRef.current.touchThrottle = value;
  }, []);
  const onTouchBrake = (0, import_react2.useCallback)((value) => {
    inputRef.current.touchBrake = value;
  }, []);
  (0, import_react2.useEffect)(() => {
    if (screen !== "race")
      return void 0;
    const canvas = canvasRef.current;
    const minimap = minimapRef.current;
    if (!canvas || !minimap)
      return void 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const miniWidth = 92;
    const miniHeight = 72;
    minimap.width = miniWidth * pixelRatio;
    minimap.height = miniHeight * pixelRatio;
    const ctx = canvas.getContext("2d");
    const minimapCtx = minimap.getContext("2d");
    minimapCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const resize = () => {
      const width = canvas.clientWidth * pixelRatio;
      const height = canvas.clientHeight * pixelRatio;
      if (canvas.width === width && canvas.height === height)
        return;
      canvas.width = width;
      canvas.height = height;
      const game = gameRef.current;
      if (!game)
        return;
      const rebuiltTrack = buildTrack(game.trackDef, width, height);
      game.track = rebuiltTrack;
      if (game.startProcedure.phase === "racing") {
        for (const car of game.cars) {
          const sample = sampleTrackAt(rebuiltTrack, car.s);
          const normalX = -Math.sin(sample.ang);
          const normalY = Math.cos(sample.ang);
          car.x = sample.x + normalX * (car.trackOffset || 0);
          car.y = sample.y + normalY * (car.trackOffset || 0);
          car.a = sample.ang;
        }
      } else {
        placeCarsOnGrid(game.cars, rebuiltTrack, game.trackDef, game.playerGridIndex ?? 0);
      }
      syncRaceViewModel("race");
    };
    const onKeyDown = (event) => {
      keysRef.current.add(event.code);
      if (event.code === "KeyR")
        startRace();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Numpad8", "Numpad2", "Numpad4", "Numpad6"].includes(event.code)) {
        event.preventDefault();
      }
    };
    const onKeyUp = (event) => {
      keysRef.current.delete(event.code);
    };
    const drawFrame = () => {
      const game = gameRef.current;
      if (!game)
        return;
      const width = canvas.width;
      const height = canvas.height;
      renderBackground(ctx, width, height, game.env, game.weather, game.time);
      const playerCar = game.cars.find((car) => car.isPlayer);
      if (playerCar) {
        if (playerCar.collided) {
          game.camera.shakeX += (Math.random() - 0.5) * PHYS.COLLISION_CAMERA_SHAKE;
          game.camera.shakeY += (Math.random() - 0.5) * PHYS.COLLISION_CAMERA_SHAKE;
        }
        updateFollowCamera(game.camera, playerCar, STEP_MS / 1e3);
      }
      applyCameraTransform(ctx, game.camera, width, height);
      renderTrack(ctx, game.track, game.env);
      renderDecorations(ctx, game.track, game.env);
      renderStartingBoxes(ctx, game.cars, game.startProcedure.phase, game.startProcedure.elapsed, game.env);
      for (const car of game.cars) {
        if (!car.isPlayer)
          renderCar(ctx, car, false);
      }
      if (playerCar) {
        renderCar(ctx, playerCar, true);
        renderPlayerTag(ctx, playerCar, "YOU");
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderMinimap(minimapCtx, game.track, game.cars, miniWidth, miniHeight);
    };
    const stepFrame = (dt) => {
      const game = gameRef.current;
      if (!game)
        return { importantChange: false };
      const playerInput = getPlayerInput(keysRef.current, joyRef.current, inputRef.current);
      const result = stepRaceState(game, dt, playerInput, t);
      if (result.requestScreen === "end") {
        setViewModel(buildRaceViewModel("end", game, weatherKey, aiDifficulty, lang, t));
        setScreen("end");
        return result;
      }
      frameCountRef.current += 1;
      if (result.importantChange || frameCountRef.current % 5 === 0) {
        syncRaceViewModel("race");
      }
      return result;
    };
    drawFrameRef.current = drawFrame;
    stepFrameRef.current = stepFrame;
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    lastRef.current = performance.now();
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const delta = Math.min((now - lastRef.current) / 1e3, 0.033);
      lastRef.current = now;
      const result = stepFrame(delta);
      if (result.requestScreen !== "end")
        drawFrame();
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current)
        cancelAnimationFrame(rafRef.current);
      drawFrameRef.current = () => void 0;
      stepFrameRef.current = () => ({ importantChange: false });
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [screen, aiDifficulty, weatherKey, lang, t, startRace, syncRaceViewModel]);
  const advanceTime = (0, import_react2.useCallback)((milliseconds) => {
    if (screenRef.current !== "race" || !gameRef.current)
      return void 0;
    const loops = Math.max(1, Math.round(milliseconds / STEP_MS));
    for (let index = 0; index < loops; index += 1) {
      const result = stepFrameRef.current(STEP_MS / 1e3);
      if (result.requestScreen === "end")
        break;
    }
    drawFrameRef.current();
    if (screenRef.current === "race" && gameRef.current) {
      setViewModel(buildRaceViewModel("race", gameRef.current, weatherKey, aiDifficulty, lang, t));
    }
    return void 0;
  }, [weatherKey, aiDifficulty, lang, t]);
  (0, import_react2.useEffect)(() => {
    if (typeof window === "undefined")
      return void 0;
    const debugApi = {
      forcePlayerFinish: () => {
        const game = gameRef.current;
        if (!game)
          return false;
        const playerCar = game.cars.find((car) => car.isPlayer);
        if (!playerCar)
          return false;
        const targetS = wrap01(game.track.startS - 15e-4);
        const sample = sampleTrackAt(game.track, targetS);
        const normalX = -Math.sin(sample.ang);
        const normalY = Math.cos(sample.ang);
        const usableHalfWidth = getTrackUsableHalfWidth(game.track) * 0.5;
        const lateralOffset = clamp(playerCar.trackOffset, -usableHalfWidth, usableHalfWidth);
        playerCar.lap = game.totalLaps;
        playerCar.s = targetS;
        playerCar.a = sample.ang;
        playerCar.x = sample.x + normalX * lateralOffset;
        playerCar.y = sample.y + normalY * lateralOffset;
        playerCar.vx = Math.cos(sample.ang) * 160;
        playerCar.vy = Math.sin(sample.ang) * 160;
        playerCar.speed = 160;
        playerCar.trackOffset = lateralOffset;
        playerCar.finished = false;
        playerCar.finishOrder = null;
        playerCar.finishCoastSpeed = 0;
        return true;
      }
    };
    window.__race2dproDebug = debugApi;
    return () => {
      if (window.__race2dproDebug === debugApi) {
        delete window.__race2dproDebug;
      }
    };
  }, []);
  useGameRuntimeBridge(viewModel, (0, import_react2.useCallback)((snapshot) => snapshot, []), advanceTime);
  if (screen === "setup") {
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setup" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupCard" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupHeader" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupTitle" }, "GRID | ", t.title), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupSub" }, t.subtitle))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupDivider" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupMain" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupPanel r2p__setupPanelTracks" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__sectionLabel" }, t.selectTrack), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackGrid" }, RACE2DPRO_CIRCUITS.map((track) => /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        key: track.id,
        className: `r2p__trackCard${selectedTrackId === track.id ? " isActive" : ""}`,
        onClick: () => setSelectedTrackId(track.id),
        role: "button",
        tabIndex: 0,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedTrackId(track.id);
          }
        }
      },
      /* @__PURE__ */ import_react2.default.createElement(TrackPreviewCanvas, { track, active: selectedTrackId === track.id }),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackName" }, track.name[lang]),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackEnv" }, ENVIRONMENTS[track.envId].name[lang], " \xB7 ", track.classification[lang]),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackMeta" }, track.distanceKm, " \xB7 ", track.turns, " ", t.turnsLabel.toLowerCase()),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackLayout" }, track.profile[lang])
    )))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__setupPanel r2p__setupPanelConfig" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__selectedTrack" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__selectedTrackTitle" }, viewModel.track.name), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__selectedTrackFacts" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.distanceLabel, ": ", viewModel.track.distanceKm), /* @__PURE__ */ import_react2.default.createElement("span", null, t.turnsLabel, ": ", viewModel.track.turns), /* @__PURE__ */ import_react2.default.createElement("span", null, t.overtakingLabel, ": ", viewModel.track.overtaking), /* @__PURE__ */ import_react2.default.createElement("span", null, t.profileLabel, ": ", viewModel.track.profile)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__trackNote" }, viewModel.track.note), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__formatRow" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "r2p__formatChip" }, t.standingStart), /* @__PURE__ */ import_react2.default.createElement("span", { className: "r2p__formatChip" }, t.fiveLights), /* @__PURE__ */ import_react2.default.createElement("span", { className: "r2p__formatChip" }, t.staggeredGrid), /* @__PURE__ */ import_react2.default.createElement("span", { className: "r2p__formatChip" }, WEATHER_PROFILES[FIXED_WEATHER_KEY].icon, " ", WEATHER_PROFILES[FIXED_WEATHER_KEY].label[lang]))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__optionsRow" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__optBlock" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__sectionLabel" }, t.selectDifficulty), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__choiceGroup" }, ["easy", "medium", "hard"].map((difficulty) => /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        key: difficulty,
        type: "button",
        className: `r2p__choiceBtn diff-${difficulty}${aiDifficulty === difficulty ? " isActive" : ""}`,
        onClick: () => setAiDifficulty(difficulty)
      },
      t[difficulty]
    )))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__optBlock" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__sectionLabel" }, t.laps), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__choiceGroup" }, [3, 5, 7].map((count) => /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        key: count,
        type: "button",
        className: `r2p__choiceBtn${laps === count ? " isActive" : ""}`,
        onClick: () => setLaps(count)
      },
      count
    )))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__optBlock r2p__optBlockWide" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__sectionLabel" }, t.rivals), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__choiceGroup" }, [3, 5, 7].map((count) => /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        key: count,
        type: "button",
        className: `r2p__choiceBtn${rivals === count ? " isActive" : ""}`,
        onClick: () => setRivals(count)
      },
      count
    ))))), /* @__PURE__ */ import_react2.default.createElement("button", { id: "start-btn", className: "r2p__startBtn", type: "button", onClick: startRace }, t.startRace))))));
  }
  if (screen === "end") {
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__endOverlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__endCard" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__endTitle" }, "FINISH | ", t.raceOver), /* @__PURE__ */ import_react2.default.createElement("table", { className: "r2p__endTable" }, /* @__PURE__ */ import_react2.default.createElement("thead", null, /* @__PURE__ */ import_react2.default.createElement("tr", null, /* @__PURE__ */ import_react2.default.createElement("th", null, "#"), /* @__PURE__ */ import_react2.default.createElement("th", null, lang === "es" ? "Piloto" : "Driver"), /* @__PURE__ */ import_react2.default.createElement("th", null, lang === "es" ? "Tiempo" : "Time"))), /* @__PURE__ */ import_react2.default.createElement("tbody", null, viewModel.leaderboard.map((row) => /* @__PURE__ */ import_react2.default.createElement("tr", { key: row.pos, className: row.isPlayer ? "isPlayer" : "" }, /* @__PURE__ */ import_react2.default.createElement("td", null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "r2p__endPosIcon" }, row.pos === 1 ? "1ST" : row.pos === 2 ? "2ND" : row.pos === 3 ? "3RD" : row.pos)), /* @__PURE__ */ import_react2.default.createElement("td", null, /* @__PURE__ */ import_react2.default.createElement(
      "span",
      {
        className: "r2p__endColorDot",
        style: { background: row.color, boxShadow: `0 0 5px ${row.color}` }
      }
    ), row.driver), /* @__PURE__ */ import_react2.default.createElement("td", { style: { fontVariantNumeric: "tabular-nums" } }, row.time))))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__endBtns" }, /* @__PURE__ */ import_react2.default.createElement("button", { className: "r2p__endBtnPrimary", type: "button", onClick: startRace }, t.restart), /* @__PURE__ */ import_react2.default.createElement("button", { className: "r2p__endBtnSecondary", type: "button", onClick: () => setScreen("setup") }, t.backToSetup)))));
  }
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p" }, /* @__PURE__ */ import_react2.default.createElement("canvas", { ref: canvasRef, style: { width: "100%", height: "100%", display: "block" } }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hud" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudPanel" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudTrack" }, viewModel.track.name), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudPos" }, viewModel.hud.position, /* @__PURE__ */ import_react2.default.createElement("sub", null, "/", viewModel.hud.total)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudPosLabel" }, t.posLabel), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudLap" }, t.lapLabel, " ", viewModel.hud.lap, "/", viewModel.hud.totalLaps), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudSpeed" }, viewModel.hud.speed, " ", t.speedUnit), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudTimer" }, viewModel.hud.timer), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudWeather" }, viewModel.hud.weatherIcon), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__hudMessage" }, viewModel.hud.message)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__minimapWrap" }, /* @__PURE__ */ import_react2.default.createElement("canvas", { ref: minimapRef, className: "r2p__minimapCanvas" }))), viewModel.startOverlay.phase !== "off" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__semaphore" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__semLights" }, viewModel.startOverlay.lights.map((on, index) => /* @__PURE__ */ import_react2.default.createElement("div", { key: index, className: `r2p__semLight${on ? " isOn" : ""}` }))), /* @__PURE__ */ import_react2.default.createElement("div", { className: `r2p__semCaption${viewModel.startOverlay.phase === "go" ? " isGo" : ""}` }, viewModel.startOverlay.caption)), viewModel.finishPresentation && /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__finishBanner" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__finishTitle" }, viewModel.finishPresentation.title), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__finishDetail" }, viewModel.finishPresentation.detail)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__touch" }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      className: "r2p__joystick",
      onPointerDown: onJoyStart,
      onPointerMove: onJoyMove,
      onPointerUp: onJoyEnd,
      onPointerCancel: onJoyEnd
    },
    /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        className: "r2p__joystickKnob",
        style: { transform: `translate(calc(-50% + ${joyKnob.dx}px), calc(-50% + ${joyKnob.dy}px))` }
      }
    )
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__touchRight" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      className: "r2p__touchBtn",
      type: "button",
      onPointerDown: () => onTouchThrottle(true),
      onPointerUp: () => onTouchThrottle(false),
      onPointerCancel: () => onTouchThrottle(false)
    },
    "UP"
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      className: "r2p__touchBtn",
      type: "button",
      onPointerDown: () => onTouchBrake(true),
      onPointerUp: () => onTouchBrake(false),
      onPointerCancel: () => onTouchBrake(false)
    },
    "DOWN"
  ))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "r2p__keyHint" }, t.keyHint));
}
export {
  RaceGame2DPro as default
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
