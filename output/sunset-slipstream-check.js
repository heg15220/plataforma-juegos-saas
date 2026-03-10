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

// src/games/racing/midnight-traffic/index.jsx
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

// src/games/racing/midnight-traffic/index.jsx
var WIDTH = 960;
var HEIGHT = 540;
var ROAD_TOP = 54;
var ROAD_WIDTH = 368;
var ROAD_LEFT = (WIDTH - ROAD_WIDTH) / 2;
var ROAD_RIGHT = ROAD_LEFT + ROAD_WIDTH;
var LANE_COUNT = 4;
var PLAYER_BASE_Y = HEIGHT - 122;
var PLAYER_MIN_Y = HEIGHT - 176;
var PLAYER_MAX_Y = HEIGHT - 86;
var STEP_MS = 1e3 / 60;
var MAX_INTEGRITY = 3;
var MAX_SHIELDS = 2;
var START_SEED = 5370206;
var TRAFFIC_STYLES = [
  { body: "#2a303d", roof: "#d7dde8", accent: "#ef4444", glow: "#f98f9b" },
  { body: "#293245", roof: "#dce7f7", accent: "#38bdf8", glow: "#89d3ff" },
  { body: "#243238", roof: "#ddeee6", accent: "#22c55e", glow: "#80e3af" },
  { body: "#332f2a", roof: "#f1e6d7", accent: "#f59e0b", glow: "#f4c27e" },
  { body: "#2e2f39", roof: "#eceef4", accent: "#e5e7eb", glow: "#c7d2e7" }
];
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var lerp = (a, b, t) => a + (b - a) * t;
var approach = (current, target, rate, dt) => lerp(current, target, clamp(rate * dt, 0, 1));
var round = (value, digits = 2) => Number(value.toFixed(digits));
var COPY = {
  es: {
    title: "Sunset Slipstream",
    subtitle: "Autopista arcade con fisica mas solida, near miss, escudo y focus.",
    eyebrow: "CARRERAS | TRAFFIC SURVIVAL",
    start: "Iniciar carrera",
    restart: "Reintentar",
    gameOver: "Sesion perdida",
    sessionLocked: "SESION TERMINADA",
    score: "Puntos",
    zone: "Zona",
    evaded: "Evadidos",
    integrity: "Casco",
    shield: "Escudos",
    focus: "Focus",
    speed: "Velocidad",
    laneLabel: "4 carriles",
    nearMissLabel: "near miss",
    shieldLabel: "escudo",
    focusLabel: "focus",
    nearMissMax: "Racha max",
    messageReady: "Mantente dentro del asfalto, lee trafico y busca huecos limpios.",
    messageStart: "Salida limpia. La autopista ya esta cargando densidad.",
    messageShield: "Escudo recogido. Tienes un impacto de margen.",
    messageCharge: "Carga recogida. El focus sube.",
    messageFocus: "Focus activo. El trafico entra en camara lenta.",
    messageCrash: "Impacto. Se pierde integridad.",
    messageBlocked: "Escudo consumido. Sigues vivo.",
    messageNearMiss: "Near miss. Bonificacion limpia.",
    messageZone: (zone) => `Zona ${zone}. Mas velocidad y menos margen.`,
    controls: "Izq/der maniobran, arriba acelera, abajo enfria el ritmo, espacio activa focus y R reinicia.",
    objective: "Sobrevive, esquiva trafico y encadena near miss para disparar la puntuacion.",
    scoreSuffix: "pts",
    speedSuffix: "km/h"
  },
  en: {
    title: "Sunset Slipstream",
    subtitle: "Arcade highway survival with stronger handling, shields, and focus.",
    eyebrow: "RACING | TRAFFIC SURVIVAL",
    start: "Start run",
    restart: "Restart",
    gameOver: "Run over",
    sessionLocked: "SESSION ENDED",
    score: "Score",
    zone: "Zone",
    evaded: "Evaded",
    integrity: "Hull",
    shield: "Shields",
    focus: "Focus",
    speed: "Speed",
    laneLabel: "4 lanes",
    nearMissLabel: "near miss",
    shieldLabel: "shield",
    focusLabel: "focus",
    nearMissMax: "Best streak",
    messageReady: "Stay inside the tarmac, read traffic, and find clean gaps.",
    messageStart: "Clean launch. Highway density is already building up.",
    messageShield: "Shield collected. You have one crash buffer.",
    messageCharge: "Charge collected. Focus meter rises.",
    messageFocus: "Focus engaged. Traffic slips into slow motion.",
    messageCrash: "Impact. Integrity lost.",
    messageBlocked: "Shield spent. The run stays alive.",
    messageNearMiss: "Near miss. Clean bonus.",
    messageZone: (zone) => `Zone ${zone}. More speed and less margin.`,
    controls: "Left/right steers, up accelerates, down cools the pace, space triggers focus, and R restarts.",
    objective: "Survive, dodge traffic, and chain near misses to spike the score.",
    scoreSuffix: "pts",
    speedSuffix: "km/h"
  }
};
function laneSize() {
  return ROAD_WIDTH / LANE_COUNT;
}
function laneCenter(index) {
  return ROAD_LEFT + laneSize() * index + laneSize() * 0.5;
}
function nearestLaneIndex(x) {
  return clamp(Math.round((x - ROAD_LEFT) / laneSize() - 0.5), 0, LANE_COUNT - 1);
}
function roundRectPath(ctx, x, y, width, height, radius) {
  const maxRadius = Math.min(radius, width / 2, height / 2);
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, maxRadius);
    return;
  }
  ctx.moveTo(x + maxRadius, y);
  ctx.lineTo(x + width - maxRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + maxRadius);
  ctx.lineTo(x + width, y + height - maxRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - maxRadius, y + height);
  ctx.lineTo(x + maxRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - maxRadius);
  ctx.lineTo(x, y + maxRadius);
  ctx.quadraticCurveTo(x, y, x + maxRadius, y);
}
function parseColor(color) {
  if (typeof color !== "string") {
    return { r: 255, g: 255, b: 255 };
  }
  const trimmed = color.trim();
  if (/^#([0-9a-f]{3}){1,2}$/i.test(trimmed)) {
    const raw = trimmed.slice(1);
    const hex = raw.length === 3 ? raw.split("").map((value) => value + value).join("") : raw;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
  const channels = trimmed.match(/^rgba?\(([^)]+)\)$/i)?.[1]?.split(",") ?? [];
  if (channels.length >= 3) {
    return {
      r: clamp(Number.parseFloat(channels[0]), 0, 255),
      g: clamp(Number.parseFloat(channels[1]), 0, 255),
      b: clamp(Number.parseFloat(channels[2]), 0, 255)
    };
  }
  return { r: 255, g: 255, b: 255 };
}
function mixColor(colorA, colorB, amount) {
  const ratio = clamp(amount, 0, 1);
  const from = parseColor(colorA);
  const to = parseColor(colorB);
  const r = Math.round(lerp(from.r, to.r, ratio));
  const g = Math.round(lerp(from.g, to.g, ratio));
  const b = Math.round(lerp(from.b, to.b, ratio));
  return `rgb(${r}, ${g}, ${b})`;
}
function withAlpha(color, alpha) {
  const { r, g, b } = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}
function nextRandom(game) {
  game.rng = game.rng * 1664525 + 1013904223 >>> 0;
  return game.rng / 4294967296;
}
function chooseOpenLane(game) {
  let candidate = Math.floor(nextRandom(game) * LANE_COUNT);
  for (let tries = 0; tries < LANE_COUNT; tries += 1) {
    const clear = game.entities.every(
      (entity) => entity.lane !== candidate || entity.y > 136
    );
    if (clear)
      return candidate;
    candidate = (candidate + 1) % LANE_COUNT;
  }
  return candidate;
}
function createTrafficCar(game) {
  const lane = chooseOpenLane(game);
  const style = TRAFFIC_STYLES[Math.floor(nextRandom(game) * TRAFFIC_STYLES.length)];
  return {
    id: `traffic-${game.nextId++}`,
    kind: "traffic",
    lane,
    baseX: laneCenter(lane),
    x: laneCenter(lane),
    y: -120 - nextRandom(game) * 140,
    width: 44,
    height: 86,
    speedMul: 0.78 + nextRandom(game) * 0.28 + (game.zone - 1) * 0.02,
    swayAmp: 3 + nextRandom(game) * 8,
    swaySpeed: 0.9 + nextRandom(game) * 1.4,
    swayPhase: nextRandom(game) * Math.PI * 2,
    body: style.body,
    roof: style.roof,
    accent: style.accent,
    glow: style.glow,
    nearMissAwarded: false,
    passed: false
  };
}
function createPickup(game) {
  const lane = Math.floor(nextRandom(game) * LANE_COUNT);
  const kind = nextRandom(game) > 0.54 ? "shield" : "charge";
  return {
    id: `pickup-${game.nextId++}`,
    kind,
    lane,
    baseX: laneCenter(lane),
    x: laneCenter(lane),
    y: -88,
    size: 28,
    bobPhase: nextRandom(game) * Math.PI * 2
  };
}
function getSpawnInterval(game) {
  return clamp(820 - game.evaded * 12 - (game.zone - 1) * 36, 260, 820);
}
function createGameState(copy, seedOffset = 0) {
  return {
    mode: "menu",
    seed: START_SEED + seedOffset * 97,
    rng: START_SEED + seedOffset * 97,
    nextId: 1,
    time: 0,
    distance: 0,
    spawnTimer: 820,
    player: {
      x: laneCenter(1),
      y: PLAYER_BASE_Y,
      vx: 0,
      vy: 0,
      width: 48,
      height: 94,
      worldSpeed: 316,
      targetSpeed: 316,
      drift: 0
    },
    focusMeter: 18,
    focusTimer: 0,
    focusLatch: false,
    integrity: MAX_INTEGRITY,
    shields: 1,
    score: 0,
    evaded: 0,
    nearMisses: 0,
    streak: 0,
    bestStreak: 0,
    zone: 1,
    entities: [],
    flash: 0,
    shake: 0,
    resultScore: 0,
    resultEvaded: 0,
    message: copy.messageReady,
    messageTone: "neutral"
  };
}
function setMessage(game, text, tone = "neutral") {
  game.message = text;
  game.messageTone = tone;
}
function buildViewModel(screen, game) {
  return {
    mode: "sunset-slipstream",
    coordinates: "origin_top_left_x_right_y_down",
    screen,
    phase: screen === "menu" ? "setup" : screen === "gameover" ? "gameover" : "playing",
    player: {
      x: round(game.player.x, 1),
      y: round(game.player.y, 1),
      vx: round(game.player.vx, 2),
      vy: round(game.player.vy, 2),
      speed: round(game.player.worldSpeed, 1),
      laneApprox: nearestLaneIndex(game.player.x),
      integrity: game.integrity,
      shields: game.shields,
      focusMeter: round(game.focusMeter, 1),
      focusTimer: round(game.focusTimer, 2)
    },
    hud: {
      score: Math.round(game.score),
      zone: game.zone,
      evaded: game.evaded,
      nearMisses: game.nearMisses,
      message: game.message
    },
    traffic: game.entities.filter((entity) => entity.kind === "traffic" && entity.y < HEIGHT + 120).map((entity) => ({
      id: entity.id,
      lane: entity.lane,
      x: round(entity.x, 1),
      y: round(entity.y, 1),
      width: entity.width,
      height: entity.height
    })),
    pickups: game.entities.filter((entity) => entity.kind !== "traffic" && entity.y < HEIGHT + 100).map((entity) => ({
      id: entity.id,
      lane: entity.lane,
      kind: entity.kind,
      x: round(entity.x, 1),
      y: round(entity.y, 1)
    }))
  };
}
function SunsetSlipstream() {
  const lang = navigator.language?.startsWith("es") ? "es" : "en";
  const copy = (0, import_react2.useMemo)(() => COPY[lang], [lang]);
  const canvasRef = (0, import_react2.useRef)(null);
  const rafRef = (0, import_react2.useRef)(null);
  const lastRef = (0, import_react2.useRef)(0);
  const lastHudRef = (0, import_react2.useRef)(0);
  const keysRef = (0, import_react2.useRef)(/* @__PURE__ */ new Set());
  const gameRef = (0, import_react2.useRef)(createGameState(copy));
  const frameRef = (0, import_react2.useRef)({ draw: () => void 0, step: () => void 0 });
  const seedRunRef = (0, import_react2.useRef)(0);
  const [screen, setScreen] = (0, import_react2.useState)("menu");
  const [viewModel, setViewModel] = (0, import_react2.useState)(buildViewModel("menu", gameRef.current));
  const syncViewModel = (0, import_react2.useCallback)((nextScreen = screen) => {
    setViewModel(buildViewModel(nextScreen, gameRef.current));
  }, [screen]);
  const startRun = (0, import_react2.useCallback)(() => {
    seedRunRef.current += 1;
    const next = createGameState(copy, seedRunRef.current);
    next.mode = "playing";
    setMessage(next, copy.messageStart, "accent");
    gameRef.current = next;
    setScreen("playing");
    setViewModel(buildViewModel("playing", next));
  }, [copy]);
  const restartRun = (0, import_react2.useCallback)(() => {
    startRun();
  }, [startRun]);
  (0, import_react2.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return void 0;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return void 0;
    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = WIDTH * pixelRatio;
      canvas.height = HEIGHT * pixelRatio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    const drawCar = ({
      x,
      y,
      width,
      height,
      body,
      roof,
      accent = "#e2e8f0",
      glow,
      tilt = 0,
      label = "",
      shield = false,
      isPlayer = false
    }) => {
      const bodyLight = mixColor(body, "#ffffff", isPlayer ? 0.34 : 0.24);
      const bodyMid = mixColor(body, "#1e293b", 0.22);
      const bodyDark = mixColor(body, "#020617", 0.52);
      const bodyDeep = mixColor(body, "#020617", 0.7);
      const glassTop = mixColor(roof, "#ecfeff", 0.48);
      const glassBase = mixColor(roof, "#0f172a", 0.38);
      const chrome = mixColor(roof, "#ffffff", 0.28);
      const accentSoft = mixColor(accent, "#ffffff", 0.18);
      const accentShadow = mixColor(accent, "#020617", 0.44);
      const headlightColor = isPlayer ? "#fff4c2" : "#fff1d6";
      const taillightColor = isPlayer ? "#ff5b77" : "#ff7c88";
      const traceBody = () => {
        ctx.beginPath();
        ctx.moveTo(0, -height * 0.55);
        ctx.bezierCurveTo(width * 0.24, -height * 0.55, width * 0.42, -height * 0.42, width * 0.47, -height * 0.15);
        ctx.lineTo(width * 0.45, height * 0.3);
        ctx.bezierCurveTo(width * 0.42, height * 0.5, width * 0.22, height * 0.6, 0, height * 0.6);
        ctx.bezierCurveTo(-width * 0.22, height * 0.6, -width * 0.42, height * 0.5, -width * 0.45, height * 0.3);
        ctx.lineTo(-width * 0.47, -height * 0.15);
        ctx.bezierCurveTo(-width * 0.42, -height * 0.42, -width * 0.24, -height * 0.55, 0, -height * 0.55);
        ctx.closePath();
      };
      const traceCockpit = () => {
        ctx.beginPath();
        ctx.moveTo(-width * 0.2, -height * 0.32);
        ctx.lineTo(width * 0.2, -height * 0.32);
        ctx.bezierCurveTo(width * 0.26, -height * 0.18, width * 0.24, height * 0.12, width * 0.14, height * 0.26);
        ctx.lineTo(-width * 0.14, height * 0.26);
        ctx.bezierCurveTo(-width * 0.24, height * 0.12, -width * 0.26, -height * 0.18, -width * 0.2, -height * 0.32);
        ctx.closePath();
      };
      const traceWindow = (topY, bottomY, topWidth, bottomWidth) => {
        ctx.beginPath();
        ctx.moveTo(-topWidth, topY);
        ctx.lineTo(topWidth, topY);
        ctx.lineTo(bottomWidth, bottomY);
        ctx.lineTo(-bottomWidth, bottomY);
        ctx.closePath();
      };
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt * 0.08);
      ctx.fillStyle = "rgba(2, 6, 15, 0.34)";
      ctx.beginPath();
      ctx.ellipse(0, height * 0.46, width * 0.72, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      const roadReflection = ctx.createLinearGradient(0, height * 0.12, 0, height * 0.56);
      roadReflection.addColorStop(0, "rgba(255, 255, 255, 0)");
      roadReflection.addColorStop(1, withAlpha(glow, 0.18));
      ctx.fillStyle = roadReflection;
      ctx.beginPath();
      ctx.ellipse(0, height * 0.45, width * 0.58, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      if (shield) {
        ctx.strokeStyle = "rgba(125, 211, 252, 0.72)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.84, height * 0.66, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(224, 242, 254, 0.42)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.72, height * 0.56, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const side of [-1, 1]) {
        for (const wheelY of [-height * 0.18, height * 0.22]) {
          ctx.fillStyle = "#02050c";
          ctx.beginPath();
          ctx.ellipse(side * width * 0.46, wheelY, width * 0.12, height * 0.11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(148, 163, 184, 0.24)";
          ctx.beginPath();
          ctx.ellipse(side * width * 0.46, wheelY, width * 0.05, height * 0.045, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowColor = glow;
      ctx.shadowBlur = isPlayer ? 24 : 16;
      const shellGradient = ctx.createLinearGradient(0, -height * 0.55, 0, height * 0.6);
      shellGradient.addColorStop(0, bodyLight);
      shellGradient.addColorStop(0.28, body);
      shellGradient.addColorStop(0.62, bodyMid);
      shellGradient.addColorStop(1, bodyDark);
      ctx.fillStyle = shellGradient;
      traceBody();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = withAlpha(bodyDeep, 0.42);
      ctx.beginPath();
      ctx.moveTo(-width * 0.34, -height * 0.42);
      ctx.lineTo(-width * 0.16, -height * 0.08);
      ctx.lineTo(-width * 0.16, height * 0.42);
      ctx.lineTo(-width * 0.3, height * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(width * 0.34, -height * 0.42);
      ctx.lineTo(width * 0.16, -height * 0.08);
      ctx.lineTo(width * 0.16, height * 0.42);
      ctx.lineTo(width * 0.3, height * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = mixColor(body, "#111827", 0.2);
      traceCockpit();
      ctx.fill();
      const windshield = ctx.createLinearGradient(0, -height * 0.38, 0, height * 0.04);
      windshield.addColorStop(0, glassTop);
      windshield.addColorStop(1, withAlpha(glassBase, 0.95));
      ctx.fillStyle = windshield;
      traceWindow(-height * 0.34, -height * 0.08, width * 0.18, width * 0.13);
      ctx.fill();
      const rearGlass = ctx.createLinearGradient(0, 0, 0, height * 0.3);
      rearGlass.addColorStop(0, withAlpha(glassTop, 0.88));
      rearGlass.addColorStop(1, withAlpha(glassBase, 0.96));
      ctx.fillStyle = rearGlass;
      traceWindow(height * 0.02, height * 0.24, width * 0.12, width * 0.19);
      ctx.fill();
      ctx.fillStyle = roof;
      ctx.beginPath();
      roundRectPath(ctx, -width * 0.12, -height * 0.12, width * 0.24, height * 0.22, 10);
      ctx.fill();
      const centerHighlight = ctx.createLinearGradient(0, -height * 0.48, 0, height * 0.4);
      centerHighlight.addColorStop(0, withAlpha("#ffffff", isPlayer ? 0.32 : 0.22));
      centerHighlight.addColorStop(0.35, "rgba(255, 255, 255, 0.08)");
      centerHighlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = centerHighlight;
      ctx.beginPath();
      ctx.moveTo(-width * 0.08, -height * 0.46);
      ctx.lineTo(width * 0.08, -height * 0.46);
      ctx.lineTo(width * 0.16, height * 0.22);
      ctx.lineTo(0, height * 0.48);
      ctx.lineTo(-width * 0.16, height * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = withAlpha(chrome, 0.45);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.42);
      ctx.lineTo(0, height * 0.44);
      ctx.stroke();
      ctx.strokeStyle = "rgba(8, 14, 25, 0.42)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.26, -height * 0.03);
      ctx.lineTo(width * 0.26, -height * 0.03);
      ctx.moveTo(-width * 0.19, height * 0.18);
      ctx.lineTo(width * 0.19, height * 0.18);
      ctx.stroke();
      const centralStripe = ctx.createLinearGradient(0, -height * 0.5, 0, height * 0.45);
      centralStripe.addColorStop(0, accentSoft);
      centralStripe.addColorStop(1, accentShadow);
      ctx.fillStyle = centralStripe;
      ctx.beginPath();
      ctx.moveTo(-width * 0.035, -height * 0.5);
      ctx.lineTo(width * 0.035, -height * 0.5);
      ctx.lineTo(width * 0.065, height * 0.04);
      ctx.lineTo(width * 0.045, height * 0.36);
      ctx.lineTo(-width * 0.045, height * 0.36);
      ctx.lineTo(-width * 0.065, height * 0.04);
      ctx.closePath();
      ctx.fill();
      for (const side of [-1, 1]) {
        const sideStripe = ctx.createLinearGradient(
          side * width * 0.3,
          -height * 0.44,
          side * width * 0.21,
          height * 0.36
        );
        sideStripe.addColorStop(0, accentSoft);
        sideStripe.addColorStop(1, accentShadow);
        ctx.fillStyle = sideStripe;
        ctx.beginPath();
        ctx.moveTo(side * width * 0.32, -height * 0.38);
        ctx.lineTo(side * width * 0.19, -height * 0.24);
        ctx.lineTo(side * width * 0.2, -height * 0.01);
        ctx.lineTo(side * width * 0.28, height * 0.1);
        ctx.lineTo(side * width * 0.23, height * 0.34);
        ctx.lineTo(side * width * 0.32, height * 0.3);
        ctx.lineTo(side * width * 0.36, height * 0.02);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = headlightColor;
      ctx.beginPath();
      ctx.moveTo(-width * 0.25, -height * 0.46);
      ctx.lineTo(-width * 0.06, -height * 0.44);
      ctx.lineTo(-width * 0.11, -height * 0.34);
      ctx.lineTo(-width * 0.26, -height * 0.37);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(width * 0.25, -height * 0.46);
      ctx.lineTo(width * 0.06, -height * 0.44);
      ctx.lineTo(width * 0.11, -height * 0.34);
      ctx.lineTo(width * 0.26, -height * 0.37);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = taillightColor;
      ctx.beginPath();
      roundRectPath(ctx, -width * 0.26, height * 0.34, width * 0.16, height * 0.08, 4);
      ctx.fill();
      ctx.beginPath();
      roundRectPath(ctx, width * 0.1, height * 0.34, width * 0.16, height * 0.08, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(8, 14, 25, 0.78)";
      ctx.beginPath();
      roundRectPath(ctx, -width * 0.16, height * 0.42, width * 0.32, height * 0.06, 4);
      ctx.fill();
      ctx.fillStyle = withAlpha(chrome, 0.5);
      ctx.beginPath();
      roundRectPath(ctx, -width * 0.1, height * 0.44, width * 0.2, height * 0.03, 999);
      ctx.fill();
      if (label) {
        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(label, 0, -height * 0.72);
      }
      ctx.restore();
    };
    const drawSky = (game) => {
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, "#050b18");
      sky.addColorStop(0.52, "#0e2447");
      sky.addColorStop(0.74, "#ff7a18");
      sky.addColorStop(1, "#ffe1a6");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "rgba(255, 239, 206, 0.85)";
      ctx.beginPath();
      ctx.arc(WIDTH * 0.76, 96, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(8, 14, 25, 0.72)";
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.lineTo(88, 114);
      ctx.lineTo(164, 148);
      ctx.lineTo(258, 108);
      ctx.lineTo(358, 142);
      ctx.lineTo(444, 112);
      ctx.lineTo(540, 150);
      ctx.lineTo(630, 118);
      ctx.lineTo(722, 146);
      ctx.lineTo(836, 120);
      ctx.lineTo(960, 156);
      ctx.lineTo(960, 214);
      ctx.lineTo(0, 214);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(4, 9, 16, 0.88)";
      for (let index = 0; index < 14; index += 1) {
        const x = 22 + index * 68;
        const buildingHeight = 40 + index * 23 % 66;
        ctx.fillRect(x, 160 - buildingHeight, 40, buildingHeight);
        ctx.fillRect(x + 30, 188 - buildingHeight * 0.7, 16, buildingHeight * 0.7);
      }
      if (game.focusTimer > 0) {
        ctx.fillStyle = "rgba(96, 165, 250, 0.08)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
    };
    const drawRoad = (game) => {
      ctx.fillStyle = "#2d7d46";
      ctx.fillRect(0, ROAD_TOP, ROAD_LEFT, HEIGHT - ROAD_TOP);
      ctx.fillRect(ROAD_RIGHT, ROAD_TOP, WIDTH - ROAD_RIGHT, HEIGHT - ROAD_TOP);
      const shoulderGradient = ctx.createLinearGradient(ROAD_LEFT - 34, 0, ROAD_LEFT, 0);
      shoulderGradient.addColorStop(0, "#9a3412");
      shoulderGradient.addColorStop(1, "#f59e0b");
      ctx.fillStyle = shoulderGradient;
      ctx.fillRect(ROAD_LEFT - 34, ROAD_TOP, 34, HEIGHT - ROAD_TOP);
      ctx.fillRect(ROAD_RIGHT, ROAD_TOP, 34, HEIGHT - ROAD_TOP);
      const road = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
      road.addColorStop(0, "#1a2230");
      road.addColorStop(0.5, "#272f3f");
      road.addColorStop(1, "#1a2230");
      ctx.fillStyle = road;
      ctx.fillRect(ROAD_LEFT, ROAD_TOP, ROAD_WIDTH, HEIGHT - ROAD_TOP);
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(ROAD_LEFT + ROAD_WIDTH * 0.48, ROAD_TOP, ROAD_WIDTH * 0.04, HEIGHT - ROAD_TOP);
      const stripOffset = game.distance * 1.2 % 112;
      for (let y = ROAD_TOP - 112 + stripOffset; y < HEIGHT; y += 112) {
        ctx.fillStyle = "#f8fafc";
        for (let lane = 1; lane < LANE_COUNT; lane += 1) {
          const center = laneCenter(lane) - laneSize() * 0.5;
          ctx.fillRect(center - 3, y, 6, 56);
        }
        ctx.fillStyle = "#fdf2cf";
        ctx.fillRect(ROAD_LEFT - 24, y, 10, 56);
        ctx.fillRect(ROAD_RIGHT + 14, y, 10, 56);
        ctx.fillStyle = "#fb7185";
        ctx.fillRect(ROAD_LEFT - 14, y, 14, 56);
        ctx.fillRect(ROAD_RIGHT, y, 14, 56);
      }
      const lampOffset = game.distance * 0.9 % 128;
      for (let y = ROAD_TOP - 128 + lampOffset; y < HEIGHT + 80; y += 128) {
        ctx.fillStyle = "rgba(253, 224, 71, 0.16)";
        ctx.fillRect(ROAD_LEFT - 66, y + 14, 20, 4);
        ctx.fillRect(ROAD_RIGHT + 46, y + 14, 20, 4);
        ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
        ctx.fillRect(ROAD_LEFT - 52, y, 3, 28);
        ctx.fillRect(ROAD_RIGHT + 49, y, 3, 28);
      }
    };
    const drawEntities = (game) => {
      const orderedTraffic = game.entities.filter((entity) => entity.kind === "traffic").sort((a, b) => a.y - b.y);
      const pickups = game.entities.filter((entity) => entity.kind !== "traffic");
      for (const entity of pickups) {
        ctx.save();
        ctx.translate(entity.x, entity.y);
        ctx.fillStyle = entity.kind === "shield" ? "#67e8f9" : "#f59e0b";
        ctx.shadowColor = entity.kind === "shield" ? "#67e8f9" : "#fdba74";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        if (entity.kind === "shield") {
          ctx.moveTo(0, -18);
          ctx.lineTo(16, -4);
          ctx.lineTo(10, 18);
          ctx.lineTo(-10, 18);
          ctx.lineTo(-16, -4);
          ctx.closePath();
        } else {
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#03111f";
        ctx.font = "700 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(entity.kind === "shield" ? "S" : "F", 0, 1);
        ctx.restore();
      }
      for (const entity of orderedTraffic) {
        drawCar({
          x: entity.x,
          y: entity.y,
          width: entity.width,
          height: entity.height,
          body: entity.body,
          roof: entity.roof,
          accent: entity.accent,
          glow: entity.glow,
          tilt: Math.sin(entity.swayPhase + game.time * entity.swaySpeed) * 0.2
        });
      }
    };
    const drawHud = (game) => {
      const hudTone = game.messageTone === "danger" ? "#fecaca" : game.messageTone === "accent" ? "#bbf7d0" : "#e2e8f0";
      ctx.fillStyle = "rgba(4, 11, 21, 0.78)";
      ctx.beginPath();
      roundRectPath(ctx, 16, 16, 250, 112, 18);
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 13px sans-serif";
      ctx.fillText(copy.title.toUpperCase(), 28, 38);
      ctx.font = "600 12px sans-serif";
      ctx.fillStyle = "#dbe4f1";
      ctx.fillText(`${copy.score}: ${Math.round(game.score)} ${copy.scoreSuffix}`, 28, 62);
      ctx.fillText(`${copy.evaded}: ${game.evaded}`, 28, 82);
      ctx.fillText(`${copy.zone}: ${game.zone}`, 28, 102);
      ctx.fillText(`${copy.integrity}: ${game.integrity}/${MAX_INTEGRITY}`, 164, 62);
      ctx.fillText(`${copy.shield}: ${game.shields}/${MAX_SHIELDS}`, 164, 82);
      ctx.fillText(`${copy.focus}: ${Math.round(game.focusMeter)}%`, 164, 102);
      ctx.fillStyle = "rgba(4, 11, 21, 0.78)";
      ctx.beginPath();
      roundRectPath(ctx, WIDTH - 208, 16, 192, 64, 18);
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 12px sans-serif";
      ctx.fillText(`${copy.speed} ${Math.round(game.player.worldSpeed)} ${copy.speedSuffix}`, WIDTH - 194, 38);
      ctx.fillStyle = "#dbe4f1";
      ctx.fillText(`${copy.focus} ${game.focusTimer > 0 ? "ON" : "READY"}`, WIDTH - 194, 60);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath();
      roundRectPath(ctx, WIDTH - 194, 28, 180, 12, 999);
      ctx.fill();
      ctx.fillStyle = game.focusTimer > 0 ? "#38bdf8" : "#f59e0b";
      ctx.beginPath();
      roundRectPath(ctx, WIDTH - 194, 28, 180 * (clamp(game.focusMeter, 0, 100) / 100), 12, 999);
      ctx.fill();
      ctx.fillStyle = "rgba(4, 11, 21, 0.7)";
      ctx.beginPath();
      roundRectPath(ctx, 16, HEIGHT - 76, WIDTH - 32, 52, 18);
      ctx.fill();
      ctx.fillStyle = hudTone;
      ctx.font = "600 13px sans-serif";
      ctx.fillText(game.message, 28, HEIGHT - 46);
    };
    const drawFrame = () => {
      const game = gameRef.current;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      const shakeX = (nextRandom(game) - 0.5) * game.shake * 10;
      const shakeY = (nextRandom(game) - 0.5) * game.shake * 8;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      drawSky(game);
      drawRoad(game);
      drawEntities(game);
      drawCar({
        x: game.player.x,
        y: game.player.y,
        width: game.player.width,
        height: game.player.height,
        body: game.focusTimer > 0 ? "#2b78d0" : "#1f9f73",
        roof: game.focusTimer > 0 ? "#e0f2fe" : "#e8fff4",
        accent: game.focusTimer > 0 ? "#7dd3fc" : "#34d399",
        glow: game.focusTimer > 0 ? "#7ec5ff" : "#86efac",
        tilt: game.player.drift,
        label: "YOU",
        shield: game.shields > 0,
        isPlayer: true
      });
      ctx.restore();
      drawHud(game);
      if (game.flash > 0) {
        ctx.fillStyle = game.messageTone === "danger" ? `rgba(248, 113, 113, ${Math.min(0.28, game.flash * 0.18)})` : `rgba(255, 255, 255, ${Math.min(0.18, game.flash * 0.14)})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }
    };
    const step = (dt) => {
      const game = gameRef.current;
      if (!game)
        return;
      game.time += dt;
      game.flash = Math.max(0, game.flash - dt * 2.4);
      game.shake = Math.max(0, game.shake - dt * 3.1);
      game.focusTimer = Math.max(0, game.focusTimer - dt);
      if (game.mode !== "playing")
        return;
      const player = game.player;
      const keys = keysRef.current;
      const steer = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
      const accelerate = keys.has("ArrowUp") || keys.has("KeyW");
      const brake = keys.has("ArrowDown") || keys.has("KeyS");
      const wantsFocus = keys.has("Space");
      player.targetSpeed = accelerate ? 438 : brake ? 232 : 320;
      player.worldSpeed = approach(player.worldSpeed, player.targetSpeed + (game.zone - 1) * 20, 2.8, dt);
      const yTarget = accelerate ? PLAYER_MIN_Y : brake ? PLAYER_MAX_Y : PLAYER_BASE_Y;
      player.vy = approach(player.vy, (yTarget - player.y) * 4.6, 4.8, dt);
      player.y = clamp(player.y + player.vy * dt, PLAYER_MIN_Y, PLAYER_MAX_Y);
      player.vx = approach(player.vx, steer * 326, steer === 0 ? 5.4 : 8.8, dt);
      player.x += player.vx * dt;
      const minX = ROAD_LEFT + 40;
      const maxX = ROAD_RIGHT - 40;
      if (player.x < minX || player.x > maxX) {
        player.x = clamp(player.x, minX, maxX);
        player.vx *= -0.2;
        game.shake = Math.max(game.shake, 0.15);
      }
      player.drift = approach(player.drift, clamp(player.vx / 320, -1, 1), 6, dt);
      if (wantsFocus && !game.focusLatch && game.focusTimer <= 0 && game.focusMeter >= 40) {
        game.focusTimer = 2.8;
        game.focusMeter = clamp(game.focusMeter - 40, 0, 100);
        game.flash = 0.8;
        setMessage(game, copy.messageFocus, "accent");
      }
      game.focusLatch = wantsFocus;
      game.distance += player.worldSpeed * dt;
      game.spawnTimer -= dt * 1e3;
      if (game.spawnTimer <= 0) {
        const pickupsEnabled = game.evaded >= 8;
        const shouldSpawnPickup = pickupsEnabled && !game.entities.some((entity) => entity.kind !== "traffic") && nextRandom(game) > 0.84;
        game.entities.push(shouldSpawnPickup ? createPickup(game) : createTrafficCar(game));
        if (!shouldSpawnPickup && game.zone > 1 && nextRandom(game) > 0.76) {
          game.entities.push(createTrafficCar(game));
        }
        game.spawnTimer = getSpawnInterval(game) * lerp(0.88, 1.18, nextRandom(game));
      }
      const trafficSlow = game.focusTimer > 0 ? 0.58 : 1;
      for (let index = game.entities.length - 1; index >= 0; index -= 1) {
        const entity = game.entities[index];
        if (entity.kind === "traffic") {
          entity.y += player.worldSpeed * entity.speedMul * trafficSlow * dt;
          entity.x = entity.baseX + Math.sin(game.time * entity.swaySpeed + entity.swayPhase) * entity.swayAmp;
          const dx = Math.abs(entity.x - player.x);
          const dy = Math.abs(entity.y - player.y);
          const collisionX = (entity.width + player.width) * 0.42;
          const collisionY = (entity.height + player.height) * 0.42;
          const nearX = collisionX + 20;
          if (!entity.passed && entity.y > player.y - entity.height * 0.28) {
            entity.passed = true;
            if (dx > collisionX && dx < nearX && dy < collisionY + 12) {
              entity.nearMissAwarded = true;
              game.nearMisses += 1;
              game.streak += 1;
              game.bestStreak = Math.max(game.bestStreak, game.streak);
              game.focusMeter = clamp(game.focusMeter + 16, 0, 100);
              game.score += 34 + game.streak * 9;
              setMessage(game, copy.messageNearMiss, "accent");
            } else {
              game.streak = 0;
            }
          }
          if (dx < collisionX && dy < collisionY) {
            entity.y = HEIGHT + 180;
            game.shake = 1;
            game.flash = 1;
            if (game.shields > 0) {
              game.shields -= 1;
              setMessage(game, copy.messageBlocked, "accent");
            } else {
              game.integrity -= 1;
              game.streak = 0;
              setMessage(game, copy.messageCrash, "danger");
              if (game.integrity <= 0) {
                game.mode = "gameover";
                game.resultScore = Math.round(game.score);
                game.resultEvaded = game.evaded;
                setScreen("gameover");
                setViewModel(buildViewModel("gameover", game));
                return;
              }
            }
          }
          if (entity.y > HEIGHT + 120) {
            game.evaded += 1;
            game.score += 11 + game.zone * 2;
            if (!entity.nearMissAwarded) {
              game.streak = 0;
            }
            const nextZone = 1 + Math.floor(game.evaded / 12);
            if (nextZone !== game.zone) {
              game.zone = nextZone;
              game.flash = 0.45;
              setMessage(game, copy.messageZone(game.zone), "accent");
            }
            game.entities.splice(index, 1);
          }
        } else {
          entity.y += player.worldSpeed * 0.92 * dt;
          entity.x = entity.baseX + Math.sin(game.time * 2.4 + entity.bobPhase) * 7;
          const dx = Math.abs(entity.x - player.x);
          const dy = Math.abs(entity.y - player.y);
          if (dx < 34 && dy < 50) {
            if (entity.kind === "shield") {
              game.shields = clamp(game.shields + 1, 0, MAX_SHIELDS);
              setMessage(game, copy.messageShield, "accent");
            } else {
              game.focusMeter = clamp(game.focusMeter + 38, 0, 100);
              game.score += 28;
              setMessage(game, copy.messageCharge, "accent");
            }
            game.flash = 0.55;
            game.entities.splice(index, 1);
          } else if (entity.y > HEIGHT + 80) {
            game.entities.splice(index, 1);
          }
        }
      }
    };
    resize();
    frameRef.current = { draw: drawFrame, step };
    lastRef.current = performance.now();
    lastHudRef.current = 0;
    const onKeyDown = (event) => {
      keysRef.current.add(event.code);
      if (event.code === "KeyR") {
        event.preventDefault();
        restartRun();
      }
    };
    const onKeyUp = (event) => {
      keysRef.current.delete(event.code);
    };
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - lastRef.current) / 1e3 || 0.016);
      lastRef.current = now;
      frameRef.current.step(dt);
      frameRef.current.draw();
      if (now - lastHudRef.current > 120) {
        lastHudRef.current = now;
        syncViewModel(gameRef.current.mode === "gameover" ? "gameover" : screen === "menu" ? "menu" : "playing");
      }
    };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current)
        cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [copy, restartRun, screen, syncViewModel]);
  const advanceTime = (0, import_react2.useCallback)((ms = 0) => {
    const loops = Math.max(1, Math.round(ms / STEP_MS));
    for (let index = 0; index < loops; index += 1) {
      frameRef.current.step(STEP_MS / 1e3);
      if (gameRef.current.mode === "gameover")
        break;
    }
    frameRef.current.draw();
    setViewModel(
      buildViewModel(
        gameRef.current.mode === "gameover" ? "gameover" : screen === "menu" ? "menu" : "playing",
        gameRef.current
      )
    );
    return void 0;
  }, [screen]);
  (0, import_react2.useEffect)(() => {
    const next = createGameState(copy, seedRunRef.current);
    gameRef.current = next;
    setScreen("menu");
    setViewModel(buildViewModel("menu", next));
  }, [copy]);
  useGameRuntimeBridge(viewModel, (0, import_react2.useCallback)((snapshot) => snapshot, []), advanceTime);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr" }, /* @__PURE__ */ import_react2.default.createElement("canvas", { ref: canvasRef, className: "mtr__canvas" }), screen === "menu" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__overlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__eyebrow" }, copy.eyebrow), /* @__PURE__ */ import_react2.default.createElement("h3", null, copy.title), /* @__PURE__ */ import_react2.default.createElement("p", null, copy.subtitle), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__pillRow" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "mtr__pill" }, copy.laneLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "mtr__pill" }, copy.nearMissLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "mtr__pill" }, copy.shieldLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "mtr__pill" }, copy.focusLabel)), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mtr__hint" }, copy.controls), /* @__PURE__ */ import_react2.default.createElement("button", { id: "start-btn", type: "button", className: "mtr__button", onClick: startRun }, copy.start))), screen === "gameover" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__overlay" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__eyebrow" }, copy.sessionLocked), /* @__PURE__ */ import_react2.default.createElement("h3", null, copy.gameOver), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mtr__stats" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("strong", null, gameRef.current.resultScore), /* @__PURE__ */ import_react2.default.createElement("span", null, copy.score)), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("strong", null, gameRef.current.resultEvaded), /* @__PURE__ */ import_react2.default.createElement("span", null, copy.evaded)), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("strong", null, gameRef.current.bestStreak), /* @__PURE__ */ import_react2.default.createElement("span", null, copy.nearMissMax))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mtr__hint" }, copy.objective), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "mtr__button", onClick: restartRun }, copy.restart))));
}
var midnight_traffic_default = SunsetSlipstream;
export {
  midnight_traffic_default as default
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
