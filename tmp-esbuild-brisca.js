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
        function useRef2(initialValue) {
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
        exports.useRef = useRef2;
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

// src/games/StrategyBriscaDeckGame.jsx
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

// src/games/StrategyBriscaDeckGame.jsx
var HAND_SIZE = 3;
var MATCH_TARGET_ROUNDS = 3;
var RESOLVE_DELAY_MS = 1800;
var NEXT_TURN_DELAY_MS = 1100;
var DRAW_FX_MS = 900;
var AI_THINK_EXTRA_MS = 450;
var SPANISH_CARD_SOURCE = "https://github.com/mcmd/playingcards.io-spanish.playing.cards";
var BACK_IMAGE = "/assets/cards/spanish/reverso.png";
var VARIANTS = {
  brisca_duel: { id: "brisca_duel", team: false, tute: false, aiOptions: [1, 2, 3, 4, 5], label: { es: "Brisca Duelo", en: "Brisca Duel" } },
  brisca_teams: { id: "brisca_teams", team: true, tute: false, aiOptions: [3, 5], label: { es: "Brisca Equipos", en: "Brisca Teams" } },
  tute_teams: { id: "tute_teams", team: true, tute: true, aiOptions: [3, 5], label: { es: "Tute Equipos", en: "Tute Teams" } }
};
var DIFF = {
  easy: { id: "easy", label: { es: "Facil", en: "Easy" }, think: 1700, noise: 6, win: 1, save: 1.2, trump: 1.2, aggr: 0.2, team: 0.4, randomTop: 3 },
  medium: { id: "medium", label: { es: "Media", en: "Medium" }, think: 2100, noise: 3, win: 1.2, save: 1, trump: 1, aggr: 0.5, team: 0.8, randomTop: 2 },
  hard: { id: "hard", label: { es: "Dificil", en: "Hard" }, think: 2500, noise: 1.5, win: 1.5, save: 0.8, trump: 0.8, aggr: 0.8, team: 1.1, randomTop: 1 },
  expert: { id: "expert", label: { es: "Experto", en: "Expert" }, think: 2900, noise: 0.8, win: 1.7, save: 0.7, trump: 0.6, aggr: 1, team: 1.3, randomTop: 1 }
};
var TEXT = {
  es: {
    title: "Mesa IA Brisca/Tute",
    subtitle: "Tapete tactico con IAs configurables, ritmo pausado y lectura de companero.",
    gameType: "Tipo de juego",
    aiCount: "Numero de IAs",
    aiDifficulty: "Dificultad IA",
    apply: "Aplicar y reiniciar",
    newMatch: "Nueva partida",
    nextRound: "Siguiente ronda",
    yourTurn: "Tu turno: juega carta.",
    resolving: "Resolviendo baza...",
    nextTurn: "Iniciando siguiente turno...",
    controls: "1-3 o Q/W/E juegan carta. Enter juega primera legal. R reinicia. N siguiente ronda.",
    statusPlaying: "En juego",
    statusRound: "Ronda cerrada",
    statusMatch: "Partida cerrada",
    matchEndTitle: "Partida terminada",
    winnerIs: "Ganador",
    round: "Ronda",
    trick: "Baza",
    stock: "Mazo",
    trump: "Triunfo",
    deck: "Baraja",
    points: "Puntos",
    lastTrick: "Ultima baza",
    rounds: "Rondas",
    userSide: "Tu equipo",
    rivalSide: "Rivales",
    hintLabel: "Clave companero",
    hintWords: { points: "PUNTOS", cut: "CORTA", risk: "RIESGO", save: "GUARDA", drag: "ARRASTRA" },
    wonTrick: "Se lleva la baza",
    human: "Tu",
    partner: "Companero IA",
    ai: "IA",
    hidden: "ocultas",
    seatHuman: "Humano",
    seatMate: "Companero",
    seatRival: "Rival",
    promptTitle: "Prompt estrategico Brisca/Tute",
    assets: "Assets baraja espanola",
    assetsLink: "Repositorio"
  },
  en: {
    title: "Brisca/Tute AI Table",
    subtitle: "Tactical felt table with configurable AI, slower pacing, and teammate cues.",
    gameType: "Game type",
    aiCount: "AI players",
    aiDifficulty: "AI difficulty",
    apply: "Apply & reset",
    newMatch: "New match",
    nextRound: "Next round",
    yourTurn: "Your turn: play a card.",
    resolving: "Resolving trick...",
    nextTurn: "Starting next turn...",
    controls: "1-3 or Q/W/E play card. Enter plays first legal card. R restarts. N next round.",
    statusPlaying: "Playing",
    statusRound: "Round over",
    statusMatch: "Match over",
    matchEndTitle: "Match finished",
    winnerIs: "Winner",
    round: "Round",
    trick: "Trick",
    stock: "Stock",
    trump: "Triumph",
    deck: "Deck",
    points: "Points",
    lastTrick: "Last trick",
    rounds: "Rounds",
    userSide: "Your team",
    rivalSide: "Opponents",
    hintLabel: "Teammate cue",
    hintWords: { points: "POINTS", cut: "CUT", risk: "RISK", save: "SAVE", drag: "DRAG" },
    wonTrick: "Took the trick",
    human: "You",
    partner: "Partner AI",
    ai: "AI",
    hidden: "hidden",
    seatHuman: "Human",
    seatMate: "Teammate",
    seatRival: "Opponent",
    promptTitle: "Brisca/Tute strategy prompt",
    assets: "Spanish deck assets",
    assetsLink: "Repository"
  }
};
var RULES = {
  es: `Modos: Brisca Duelo, Brisca Equipos, Tute Equipos (asistir/montar/fallar simplificado).
IA: ajusta riesgo por marcador, puntos en mesa, triunfo y fase final.
Equipo: evita romper baza ganadora del companero y usa clave corta (PUNTOS/CORTA/RIESGO/GUARDA/ARRASTRA).`,
  en: `Modes: Brisca Duel, Brisca Teams, Team Tute (simplified forced follow/overtake/triumph).
AI: adapts risk with score pressure, trick value, triumph control, and endgame phase.
Team: avoids breaking teammate-winning tricks and emits short cue words.`
};
var SPANISH_DECK = {
  id: "spanish",
  suits: [
    { id: "oros", symbol: "\u2666", colorClass: "suit-red" },
    { id: "copas", symbol: "\u2665", colorClass: "suit-red" },
    { id: "espadas", symbol: "\u2660", colorClass: "suit-black" },
    { id: "bastos", symbol: "\u2663", colorClass: "suit-black" }
  ],
  ranks: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
  rankLabel: { 1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 10: "S", 11: "C", 12: "R" },
  points: { 1: 11, 3: 10, 12: 4, 11: 3, 10: 2 },
  power: { 1: 100, 3: 90, 12: 80, 11: 70, 10: 60, 7: 50, 6: 40, 5: 30, 4: 20, 2: 10 }
};
var EN_DECK = {
  id: "english",
  suits: [
    { id: "spades", symbol: "\u2660", colorClass: "suit-black" },
    { id: "hearts", symbol: "\u2665", colorClass: "suit-red" },
    { id: "diamonds", symbol: "\u2666", colorClass: "suit-red" },
    { id: "clubs", symbol: "\u2663", colorClass: "suit-black" }
  ],
  ranks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  rankLabel: { 1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K" },
  points: { 1: 11, 3: 10, 13: 4, 12: 3, 11: 2 },
  power: { 1: 100, 3: 90, 13: 80, 12: 70, 11: 60, 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 2: 10 }
};
var isEs = () => typeof navigator !== "undefined" && String(navigator.language || "").toLowerCase().startsWith("es");
var localeOf = () => isEs() ? "es" : "en";
var deckFor = (locale) => locale === "es" ? SPANISH_DECK : EN_DECK;
var textOf = (locale) => TEXT[locale] || TEXT.en;
var normVariant = (id) => VARIANTS[id] ? id : "brisca_duel";
var normDiff = (id) => DIFF[id] ? id : "medium";
var rank2 = (n) => String(n).padStart(2, "0");
var cardText = (card) => card ? `${card.rankLabel}${card.suitSymbol}` : "--";
var points = (cards) => cards.reduce((sum, c) => sum + (c?.points || 0), 0);
var clampAi = (variantId, value) => {
  const options = VARIANTS[normVariant(variantId)].aiOptions;
  const n = Number(value);
  if (options.includes(n))
    return n;
  return options[0];
};
var shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
var buildDeck = (deck) => {
  const cards = [];
  deck.suits.forEach((suit) => {
    deck.ranks.forEach((rank) => {
      cards.push({
        id: `${deck.id}-${suit.id}-${rank}`,
        rank,
        rankLabel: deck.rankLabel[rank] || String(rank),
        suitId: suit.id,
        suitSymbol: suit.symbol,
        colorClass: suit.colorClass,
        points: deck.points[rank] || 0,
        power: deck.power[rank] || rank,
        imageUrl: deck.id === "spanish" ? `/assets/cards/spanish/${rank2(rank)}-${suit.id}.png` : null
      });
    });
  });
  return cards;
};
var withSeatVector = (slot, x, y) => ({ slot, x, y, fx: (x - 50) * 0.95, fy: (y - 52) * 0.95 });
var HUMAN_SEAT = withSeatVector("bottom", 50, 86);
var aiSeatPattern = (aiCount) => {
  const top = withSeatVector("top", 50, 10);
  const left = withSeatVector("left", 10, 47);
  const right = withSeatVector("right", 90, 47);
  const upperLeft = withSeatVector("upper-left", 24, 18);
  const upperRight = withSeatVector("upper-right", 76, 18);
  if (aiCount <= 1)
    return [top];
  if (aiCount === 2)
    return [left, right];
  if (aiCount === 3)
    return [top, left, right];
  if (aiCount === 4)
    return [upperLeft, upperRight, left, right];
  return [top, upperLeft, upperRight, left, right];
};
var makePlayers = (variantId, aiOpponents, t) => {
  const v = VARIANTS[variantId];
  const total = Math.min(6, Math.max(2, aiOpponents + 1));
  const aiSeats = aiSeatPattern(total - 1);
  const players = [{ id: "human", name: t.human, human: true, ai: false, side: "user", seat: HUMAN_SEAT }];
  let mateId = null;
  for (let i = 1; i < total; i += 1) {
    const id = `ai-${i}`;
    const side = v.team ? i % 2 === 0 ? "user" : "rival" : "rival";
    const mate = v.team && side === "user" && !mateId;
    if (mate)
      mateId = id;
    players.push({ id, name: mate ? t.partner : `${t.ai} ${i}`, human: false, ai: true, side, seat: aiSeats[i - 1] || aiSeats[0] || withSeatVector("top", 50, 14) });
  }
  return { players, mateId };
};
var beats = (cand, cur, leadSuit, trumpSuit) => {
  if (cand.suitId === cur.suitId)
    return cand.power > cur.power;
  if (cand.suitId === trumpSuit && cur.suitId !== trumpSuit)
    return true;
  if (cur.suitId === trumpSuit && cand.suitId !== trumpSuit)
    return false;
  if (cand.suitId === leadSuit && cur.suitId !== leadSuit)
    return true;
  return false;
};
var winnerEntry = (table, trumpSuit) => {
  if (!table.length)
    return null;
  const leadSuit = table[0].card.suitId;
  let win = table[0];
  for (const e of table.slice(1))
    if (beats(e.card, win.card, leadSuit, trumpSuit))
      win = e;
  return win;
};
var legalIdx = (hand, table, trumpSuit, variant) => {
  const all = hand.map((_, i) => i);
  if (!table.length || !variant.tute)
    return all;
  const leadSuit = table[0].card.suitId;
  const same = all.filter((i) => hand[i].suitId === leadSuit);
  const win = winnerEntry(table, trumpSuit);
  if (same.length) {
    const target = win?.card?.suitId === leadSuit ? win.card.power : table[0].card.power;
    const over = same.filter((i) => hand[i].power > target);
    return over.length ? over : same;
  }
  const trumps = all.filter((i) => hand[i].suitId === trumpSuit);
  if (trumps.length) {
    if (win?.card?.suitId === trumpSuit) {
      const over = trumps.filter((i) => hand[i].power > win.card.power);
      return over.length ? over : trumps;
    }
    return trumps;
  }
  return all;
};
var pByPlayer = (won, players) => Object.fromEntries(players.map((p) => [p.id, points(won[p.id] || [])]));
var pBySide = (pp, players) => players.reduce((acc, p) => {
  acc[p.side] = (acc[p.side] || 0) + (pp[p.id] || 0);
  return acc;
}, { user: 0, rival: 0 });
var nextId = (order, id) => order[(order.indexOf(id) + 1) % order.length];
var rotateFrom = (order, id) => {
  const i = order.indexOf(id);
  return [...order.slice(i), ...order.slice(0, i)];
};
var teammateHint = (s, t) => {
  if (!s.variant.team || !s.mateId)
    return null;
  const hand = s.hands[s.mateId] || [];
  if (!hand.length || s.status !== "playing")
    return null;
  const pending = s.table.reduce((sum, e) => sum + (e.card?.points || 0), 0);
  const hasHighTrump = hand.some((c) => c.suitId === s.trumpSuit && c.power >= 90);
  const pp = pByPlayer(s.won, s.players);
  const ps = pBySide(pp, s.players);
  let word = t.hintWords.save;
  if (pending >= 16)
    word = t.hintWords.points;
  else if (hasHighTrump && pending >= 8)
    word = t.hintWords.cut;
  else if (ps.user < ps.rival)
    word = t.hintWords.risk;
  else if (hand.every((c) => (c.points || 0) === 0))
    word = t.hintWords.drag;
  return { playerId: s.mateId, text: word };
};
var withDerived = (s, t, msg = null) => {
  let message = msg;
  if (message == null) {
    if (s.status === "playing") {
      if (s.resolving)
        message = t.resolving;
      else if (s.turnTransitioning)
        message = t.nextTurn;
      else
        message = s.current === "human" ? t.yourTurn : `${s.byId[s.current]?.name || t.ai}...`;
    } else if (s.status === "round-over")
      message = t.nextRound;
    else
      message = "";
  }
  return { ...s, message, hint: teammateHint(s, t) };
};
var createConfig = (locale, variantId, aiOpponents, difficultyId) => {
  const t = textOf(locale);
  const vId = normVariant(variantId);
  const dId = normDiff(difficultyId);
  const ai = clampAi(vId, aiOpponents);
  const { players, mateId } = makePlayers(vId, ai, t);
  return {
    locale,
    variantId: vId,
    variant: VARIANTS[vId],
    difficultyId: dId,
    aiOpponents: ai,
    players,
    mateId,
    order: players.map((p) => p.id),
    byId: Object.fromEntries(players.map((p) => [p.id, p]))
  };
};
var createRound = (cfg, round, roundWins, leadId) => {
  const t = textOf(cfg.locale);
  const deck = deckFor(cfg.locale);
  const stock = shuffle(buildDeck(deck));
  const hands = Object.fromEntries(cfg.order.map((id) => [id, []]));
  for (let i = 0; i < HAND_SIZE; i += 1)
    cfg.order.forEach((id) => {
      const card = stock.pop();
      if (card)
        hands[id].push(card);
    });
  const trumpCard = stock.pop() || null;
  const s = {
    ...cfg,
    deckId: deck.id,
    deckName: deck.id === "spanish" ? "Espanola (40)" : "English (52)",
    deckCount: deck.ranks.length * deck.suits.length,
    status: "playing",
    round,
    trick: 1,
    roundWins: { ...roundWins },
    matchWinner: null,
    roundResult: null,
    lead: leadId,
    current: leadId,
    resolving: false,
    turnTransitioning: false,
    table: [],
    playSeq: 0,
    trumpCard,
    trumpSuit: trumpCard?.suitId || null,
    stock,
    hands,
    won: Object.fromEntries(cfg.order.map((id) => [id, []])),
    lastTrick: null,
    drawAnim: null,
    hint: null,
    message: ""
  };
  return withDerived(s, t);
};
var createMatch = (locale, opts = {}) => {
  const cfg = createConfig(locale, opts.variantId || "brisca_duel", opts.aiOpponents ?? 1, opts.difficultyId || "medium");
  const lead = cfg.order[Math.floor(Math.random() * cfg.order.length)] || "human";
  return createRound(cfg, 1, { user: 0, rival: 0 }, lead);
};
var aiPick = (s, player) => {
  const profile = DIFF[s.difficultyId] || DIFF.medium;
  const hand = s.hands[player.id] || [];
  const legal = legalIdx(hand, s.table, s.trumpSuit, s.variant);
  if (!legal.length)
    return -1;
  const pp = pByPlayer(s.won, s.players);
  const ps = pBySide(pp, s.players);
  const deficit = (ps.rival || 0) - (ps.user || 0);
  const aggr = profile.aggr + Math.max(-2, Math.min(2, deficit / 18)) * 0.2;
  const currentWin = winnerEntry(s.table, s.trumpSuit);
  const mateWinning = s.variant.team && currentWin && s.byId[currentWin.playerId]?.side === player.side;
  const pending = s.table.reduce((sum, e) => sum + (e.card?.points || 0), 0);
  const remaining = s.stock.length + (s.trumpCard ? 1 : 0);
  const scored = legal.map((idx) => {
    const c = hand[idx];
    const winNow = winnerEntry([...s.table, { playerId: player.id, card: c }], s.trumpSuit)?.playerId === player.id;
    const isTrump = c.suitId === s.trumpSuit;
    let score = 0;
    score += winNow ? profile.win * (pending + c.points + c.power * 0.06) : -pending * 0.35;
    score -= profile.save * (c.power * 0.09 + c.points * 1.1);
    if (isTrump)
      score -= profile.trump * (c.power * 0.08);
    if (aggr > 0)
      score += aggr * (pending + c.points) * 0.55;
    if (mateWinning) {
      if (winNow && s.table.length === s.players.length - 1)
        score -= profile.team * 8;
      if (!winNow)
        score += profile.team * c.points * 1.6;
    }
    if (remaining < s.players.length)
      score += winNow ? c.power * 0.06 : -c.power * 0.03;
    score += (Math.random() * 2 - 1) * profile.noise;
    return { idx, score };
  }).sort((a, b) => b.score - a.score);
  const top = Math.min(profile.randomTop || 1, scored.length);
  return (scored[Math.floor(Math.random() * top)] || scored[0]).idx;
};
var play = (s, playerId, reqIdx, t) => {
  if (s.status !== "playing" || s.resolving || s.turnTransitioning || s.current !== playerId)
    return s;
  const hand = [...s.hands[playerId] || []];
  if (!hand.length)
    return s;
  const legal = legalIdx(hand, s.table, s.trumpSuit, s.variant);
  let idx = reqIdx;
  if (!legal.includes(idx)) {
    if (playerId === "human")
      return withDerived({ ...s }, t, t.yourTurn);
    idx = legal[0] ?? 0;
  }
  const [card] = hand.splice(idx, 1);
  const p = s.byId[playerId];
  const table = [...s.table, { playerId, card, playId: s.playSeq + 1, from: { x: p.seat.fx, y: p.seat.fy } }];
  const hands = { ...s.hands, [playerId]: hand };
  if (table.length === s.players.length)
    return withDerived({ ...s, hands, table, playSeq: s.playSeq + 1, current: null, resolving: true, turnTransitioning: false }, t, t.resolving);
  const nx = nextId(s.order, playerId);
  return withDerived({ ...s, hands, table, playSeq: s.playSeq + 1, current: nx, resolving: false, turnTransitioning: false }, t, nx === "human" ? t.yourTurn : `${s.byId[nx]?.name || t.ai}...`);
};
var resolveTrick = (s, t) => {
  if (s.status !== "playing" || !s.resolving || s.table.length < s.players.length)
    return s;
  const win = winnerEntry(s.table, s.trumpSuit);
  if (!win)
    return withDerived({ ...s, resolving: false }, t);
  const winId = win.playerId;
  const won = Object.fromEntries(Object.entries(s.won).map(([id, cards]) => [id, [...cards]]));
  won[winId].push(...s.table.map((e) => e.card));
  const hands = Object.fromEntries(Object.entries(s.hands).map(([id, cards]) => [id, [...cards]]));
  let stock = [...s.stock];
  let trumpCard = s.trumpCard;
  let drewHuman = false;
  rotateFrom(s.order, winId).forEach((id) => {
    if (stock.length) {
      hands[id].push(stock.pop());
      if (id === "human")
        drewHuman = true;
    } else if (trumpCard) {
      hands[id].push(trumpCard);
      if (id === "human")
        drewHuman = true;
      trumpCard = null;
    }
  });
  const endRound = s.order.every((id) => (hands[id] || []).length === 0) && stock.length === 0 && !trumpCard;
  const base = {
    ...s,
    lead: winId,
    current: winId,
    resolving: false,
    turnTransitioning: !endRound,
    table: [],
    trick: s.trick + 1,
    hands,
    won,
    stock,
    trumpCard,
    drawAnim: drewHuman ? { id: s.playSeq + s.trick } : null,
    lastTrick: { winnerId: winId, points: s.table.reduce((sum, e) => sum + (e.card?.points || 0), 0) }
  };
  if (!endRound) {
    return withDerived(base, t, `${s.byId[winId]?.name || winId} gana baza. ${t.nextTurn}`);
  }
  const pp = pByPlayer(won, s.players);
  const ps = pBySide(pp, s.players);
  const user = ps.user || 0;
  const rival = ps.rival || 0;
  const roundWins = { ...s.roundWins };
  let winnerSide = null;
  if (user > rival) {
    winnerSide = "user";
    roundWins.user += 1;
  } else if (rival > user) {
    winnerSide = "rival";
    roundWins.rival += 1;
  }
  const matchWinner = roundWins.user >= MATCH_TARGET_ROUNDS ? "user" : roundWins.rival >= MATCH_TARGET_ROUNDS ? "rival" : null;
  let msg = winnerSide ? `${winnerSide === "user" ? t.userSide : t.rivalSide} gana ronda (${user}-${rival}).` : `Ronda empatada (${user}-${rival}).`;
  msg = matchWinner ? `${msg} ${matchWinner === "user" ? t.userSide : t.rivalSide} gana partida.` : `${msg} ${t.nextRound}`;
  return withDerived({ ...base, status: matchWinner ? "match-over" : "round-over", current: null, turnTransitioning: false, roundWins, matchWinner, roundResult: { pp, ps, winnerSide } }, t, msg);
};
var aiTurn = (s, t) => {
  if (s.status !== "playing" || s.resolving || s.turnTransitioning || !s.current)
    return s;
  const p = s.byId[s.current];
  if (!p?.ai)
    return s;
  const idx = aiPick(s, p);
  if (idx < 0)
    return s;
  return play(s, p.id, idx, t);
};
var stepTime = (s, t, ms) => {
  let n = s;
  const loops = Math.max(1, Math.round((ms || 0) / 260));
  for (let i = 0; i < loops; i += 1) {
    if (n.status !== "playing")
      break;
    if (n.turnTransitioning) {
      n = withDerived({ ...n, turnTransitioning: false }, t);
      continue;
    }
    if (n.resolving)
      n = resolveTrick(n, t);
    else if (n.byId[n.current]?.ai)
      n = aiTurn(n, t);
    else
      break;
  }
  return n;
};
function Card({ card, deckId = "english", hidden = false, compact = false, onPlay = null, disabled = false }) {
  const image = !hidden && card?.imageUrl;
  const back = hidden && deckId === "spanish";
  const cls = ["brisca-card", compact ? "compact" : "", hidden ? "hidden" : "", image || back ? "image-card" : "", card?.colorClass || "", onPlay ? "playable" : ""].filter(Boolean).join(" ");
  if (hidden)
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: cls }, back ? /* @__PURE__ */ import_react2.default.createElement("img", { src: BACK_IMAGE, alt: "Hidden", className: "back-image", loading: "lazy", draggable: false }) : /* @__PURE__ */ import_react2.default.createElement("span", { className: "back-mark" }, "IA"));
  if (!card)
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: `${cls} slot` }, /* @__PURE__ */ import_react2.default.createElement("span", null, "--"));
  const face = image ? /* @__PURE__ */ import_react2.default.createElement("img", { src: card.imageUrl, alt: `${card.rankLabel}${card.suitSymbol}`, className: "face-image", loading: "lazy", draggable: false }) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "rank" }, card.rankLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "suit" }, card.suitSymbol), /* @__PURE__ */ import_react2.default.createElement("span", { className: "points" }, "+", card.points));
  return onPlay ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: cls, onClick: onPlay, disabled }, face) : /* @__PURE__ */ import_react2.default.createElement("div", { className: cls }, face);
}
function StrategyBriscaDeckGame() {
  const locale = (0, import_react2.useMemo)(localeOf, []);
  const t = (0, import_react2.useMemo)(() => textOf(locale), [locale]);
  const [s, setS] = (0, import_react2.useState)(() => createMatch(locale));
  const [pVar, setPVar] = (0, import_react2.useState)("brisca_duel");
  const [pAi, setPAi] = (0, import_react2.useState)(1);
  const [pDiff, setPDiff] = (0, import_react2.useState)("medium");
  (0, import_react2.useEffect)(() => {
    setPVar(s.variantId);
    setPAi(s.aiOpponents);
    setPDiff(s.difficultyId);
  }, [s.variantId, s.aiOpponents, s.difficultyId]);
  (0, import_react2.useEffect)(() => {
    const opts = VARIANTS[pVar]?.aiOptions || [1];
    if (!opts.includes(pAi))
      setPAi(opts[0]);
  }, [pAi, pVar]);
  const restart = (0, import_react2.useCallback)(() => setS((prev) => createMatch(locale, { variantId: prev.variantId, aiOpponents: prev.aiOpponents, difficultyId: prev.difficultyId })), [locale]);
  const applyCfg = (0, import_react2.useCallback)(() => setS(createMatch(locale, { variantId: pVar, aiOpponents: clampAi(pVar, pAi), difficultyId: pDiff })), [locale, pAi, pDiff, pVar]);
  const nextRound = (0, import_react2.useCallback)(() => setS((prev) => {
    if (prev.status !== "round-over")
      return prev;
    const cfg = createConfig(prev.locale, prev.variantId, prev.aiOpponents, prev.difficultyId);
    const lead = prev.lastTrick?.winnerId || cfg.order[Math.floor(Math.random() * cfg.order.length)] || "human";
    return createRound(cfg, prev.round + 1, prev.roundWins, lead);
  }), []);
  const playHuman = (0, import_react2.useCallback)((idx) => setS((prev) => play(prev, "human", idx, t)), [t]);
  (0, import_react2.useEffect)(() => {
    if (s.status !== "playing" || !s.resolving)
      return;
    const tm = setTimeout(() => setS((prev) => resolveTrick(prev, t)), RESOLVE_DELAY_MS);
    return () => clearTimeout(tm);
  }, [s.resolving, s.status, s.playSeq, t]);
  (0, import_react2.useEffect)(() => {
    if (s.status !== "playing" || s.resolving || !s.current || !s.byId[s.current]?.ai)
      return;
    if (s.turnTransitioning)
      return;
    const d = (DIFF[s.difficultyId] || DIFF.medium).think + AI_THINK_EXTRA_MS + Math.floor(Math.random() * 260);
    const tm = setTimeout(() => setS((prev) => aiTurn(prev, t)), d);
    return () => clearTimeout(tm);
  }, [s.current, s.difficultyId, s.playSeq, s.resolving, s.status, s.turnTransitioning, s.byId, t]);
  (0, import_react2.useEffect)(() => {
    if (s.status !== "playing" || !s.turnTransitioning)
      return;
    const tm = setTimeout(() => setS((prev) => {
      if (prev.status !== "playing" || !prev.turnTransitioning)
        return prev;
      return withDerived({ ...prev, turnTransitioning: false }, t);
    }), NEXT_TURN_DELAY_MS);
    return () => clearTimeout(tm);
  }, [s.status, s.turnTransitioning, t]);
  (0, import_react2.useEffect)(() => {
    if (!s.drawAnim)
      return;
    const tm = setTimeout(() => setS((prev) => prev.drawAnim ? { ...prev, drawAnim: null } : prev), DRAW_FX_MS);
    return () => clearTimeout(tm);
  }, [s.drawAnim]);
  const canHuman = s.status === "playing" && !s.resolving && !s.turnTransitioning && s.current === "human";
  const humanHand = s.hands.human || [];
  const legalHuman = (0, import_react2.useMemo)(() => canHuman ? legalIdx(humanHand, s.table, s.trumpSuit, s.variant) : [], [canHuman, humanHand, s.table, s.trumpSuit, s.variant]);
  (0, import_react2.useEffect)(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
        return;
      const k = e.key.toLowerCase();
      if (k === "r") {
        e.preventDefault();
        restart();
        return;
      }
      if (k === "n") {
        e.preventDefault();
        nextRound();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (s.status === "round-over")
          nextRound();
        else if (canHuman && legalHuman.length)
          playHuman(legalHuman[0]);
        return;
      }
      if (["1", "2", "3"].includes(k)) {
        e.preventDefault();
        playHuman(Number(k) - 1);
        return;
      }
      if (["q", "w", "e"].includes(k)) {
        e.preventDefault();
        playHuman({ q: 0, w: 1, e: 2 }[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canHuman, legalHuman, nextRound, playHuman, restart, s.status]);
  const pp = (0, import_react2.useMemo)(() => pByPlayer(s.won, s.players), [s.players, s.won]);
  const ps = (0, import_react2.useMemo)(() => pBySide(pp, s.players), [pp, s.players]);
  const statusText = s.status === "match-over" ? t.statusMatch : s.status === "round-over" ? t.statusRound : t.statusPlaying;
  const vLabel = VARIANTS[s.variantId]?.label?.[locale] || VARIANTS[s.variantId]?.label?.en || s.variantId;
  const lastWinnerId = s.lastTrick?.winnerId || null;
  const lastWinnerName = lastWinnerId ? s.byId[lastWinnerId]?.name || lastWinnerId : null;
  const matchWinnerLabel = s.matchWinner ? s.matchWinner === "user" ? t.userSide : t.rivalSide : "--";
  const bridgePayload = (0, import_react2.useCallback)((snap) => {
    const ppSnap = pByPlayer(snap.won, snap.players);
    const psSnap = pBySide(ppSnap, snap.players);
    const can = snap.status === "playing" && !snap.resolving && !snap.turnTransitioning && snap.current === "human";
    const legal = can ? legalIdx(snap.hands.human || [], snap.table, snap.trumpSuit, snap.variant) : [];
    return {
      mode: "strategy-brisca-ai",
      variant: snap.variantId,
      locale: snap.locale,
      status: snap.status,
      resolvingTrick: snap.resolving,
      turnTransitioning: Boolean(snap.turnTransitioning),
      drawAnimating: Boolean(snap.drawAnim),
      round: snap.round,
      trick: snap.trick,
      current: snap.current,
      stockCount: snap.stock.length,
      trumpSuit: snap.trumpSuit,
      players: snap.players.map((p) => ({ id: p.id, name: p.name, side: p.side, isHuman: p.human, handCount: (snap.hands[p.id] || []).length, points: ppSnap[p.id] || 0 })),
      score: { rounds: snap.roundWins, sidePoints: psSnap },
      tableCards: snap.table.map((e) => ({ playerId: e.playerId, card: cardText(e.card) })),
      hands: { human: (snap.hands.human || []).map(cardText) },
      teammateHint: snap.hint?.text || null,
      actions: { playableIndexes: legal.map((i) => i + 1), canNextRound: snap.status === "round-over", canRestart: true },
      message: snap.message
    };
  }, []);
  const advanceTime = (0, import_react2.useCallback)((ms) => setS((prev) => stepTime(prev, t, ms)), [t]);
  useGameRuntimeBridge(s, bridgePayload, advanceTime);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mini-game strategy-brisca-game brisca-arena" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mini-head" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h4", null, t.title), /* @__PURE__ */ import_react2.default.createElement("p", null, t.subtitle)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-actions-head" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: restart }, t.newMatch), s.status === "round-over" ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: nextRound }, t.nextRound) : null)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-config" }, /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "brisca-variant" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.gameType), /* @__PURE__ */ import_react2.default.createElement("select", { id: "brisca-variant", value: pVar, onChange: (e) => setPVar(normVariant(e.target.value)) }, Object.keys(VARIANTS).map((id) => /* @__PURE__ */ import_react2.default.createElement("option", { key: id, value: id }, VARIANTS[id].label[locale] || VARIANTS[id].label.en)))), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "brisca-ai" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.aiCount), /* @__PURE__ */ import_react2.default.createElement("select", { id: "brisca-ai", value: pAi, onChange: (e) => setPAi(Number(e.target.value) || 1) }, (VARIANTS[pVar]?.aiOptions || [1]).map((v) => /* @__PURE__ */ import_react2.default.createElement("option", { key: v, value: v }, v)))), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "brisca-diff" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.aiDifficulty), /* @__PURE__ */ import_react2.default.createElement("select", { id: "brisca-diff", value: pDiff, onChange: (e) => setPDiff(normDiff(e.target.value)) }, Object.keys(DIFF).map((id) => /* @__PURE__ */ import_react2.default.createElement("option", { key: id, value: id }, DIFF[id].label[locale] || DIFF[id].label.en)))), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "brisca-apply", onClick: applyCfg }, t.apply)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "status-row brisca-status-row" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: `status-pill ${s.status === "playing" ? "playing" : "finished"}` }, statusText), /* @__PURE__ */ import_react2.default.createElement("span", null, t.gameType, ": ", vLabel), /* @__PURE__ */ import_react2.default.createElement("span", null, t.round, ": ", s.round), /* @__PURE__ */ import_react2.default.createElement("span", null, t.trick, ": ", Math.max(1, s.trick - (s.status === "playing" ? 0 : 1))), /* @__PURE__ */ import_react2.default.createElement("span", null, t.deck, ": ", s.deckName), /* @__PURE__ */ import_react2.default.createElement("span", null, t.stock, ": ", s.stock.length), /* @__PURE__ */ import_react2.default.createElement("span", null, t.trump, ": ", s.trumpSuit || "--"), /* @__PURE__ */ import_react2.default.createElement("span", null, t.points, ": ", ps.user || 0, " - ", ps.rival || 0), /* @__PURE__ */ import_react2.default.createElement("span", null, t.rounds, ": ", s.roundWins.user, " - ", s.roundWins.rival), lastWinnerName ? /* @__PURE__ */ import_react2.default.createElement("span", null, t.lastTrick, ": ", lastWinnerName) : null), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-table-shell" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: `brisca-table-felt ai-count-${s.aiOpponents}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-seat-ring" }, s.players.filter((p) => !p.human).map((p) => {
    const active = s.current === p.id;
    const isMate = s.variant.team && !p.human && p.side === "user";
    const handCount = (s.hands[p.id] || []).length;
    const wonLast = lastWinnerId === p.id;
    return /* @__PURE__ */ import_react2.default.createElement("article", { key: p.id, className: ["brisca-seat", p.human ? "seat-human" : "seat-ai", p.side === "user" ? "seat-friendly" : "seat-rival", p.seat?.slot ? `seat-slot-${p.seat.slot}` : "", active ? "seat-active" : "", wonLast ? "seat-won-trick" : ""].filter(Boolean).join(" "), style: { "--seat-x": `${p.seat.x}%`, "--seat-y": `${p.seat.y}%` } }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("h5", null, p.name), /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-tag" }, p.human ? t.seatHuman : isMate ? t.seatMate : t.seatRival)), /* @__PURE__ */ import_react2.default.createElement("p", { className: "seat-side" }, p.side === "user" ? t.userSide : t.rivalSide), /* @__PURE__ */ import_react2.default.createElement("p", { className: "seat-kpi" }, t.points, ": ", pp[p.id] || 0), wonLast ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led", "aria-label": `${p.name}: ${t.wonTrick}` }, t.wonTrick) : null, !p.human ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "seat-hidden-hand", "aria-label": `${p.name} ${handCount} ${t.hidden}` }, Array.from({ length: handCount }).map((_, i) => /* @__PURE__ */ import_react2.default.createElement(Card, { key: `${p.id}-h-${i}`, hidden: true, compact: true, deckId: s.deckId }))) : null, s.hint?.playerId === p.id ? /* @__PURE__ */ import_react2.default.createElement("p", { className: "seat-hint-bubble" }, t.hintLabel, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, s.hint.text)) : null);
  })), /* @__PURE__ */ import_react2.default.createElement("section", { className: "brisca-center-zone" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-center-meta" }, /* @__PURE__ */ import_react2.default.createElement("article", { className: "brisca-pile brisca-pile-trump" }, /* @__PURE__ */ import_react2.default.createElement("h6", null, t.trump), /* @__PURE__ */ import_react2.default.createElement(Card, { card: s.trumpCard, deckId: s.deckId, compact: true })), /* @__PURE__ */ import_react2.default.createElement("article", { className: "brisca-pile brisca-pile-stock" }, /* @__PURE__ */ import_react2.default.createElement("h6", null, t.stock), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-stock-stack", "aria-label": `${t.stock}: ${s.stock.length + (s.trumpCard ? 1 : 0)}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-stock-layer layer-back" }, /* @__PURE__ */ import_react2.default.createElement(Card, { hidden: true, compact: true, deckId: s.deckId })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-stock-layer layer-mid" }, /* @__PURE__ */ import_react2.default.createElement(Card, { hidden: true, compact: true, deckId: s.deckId })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-stock-layer layer-front" }, /* @__PURE__ */ import_react2.default.createElement(Card, { hidden: true, compact: true, deckId: s.deckId })), /* @__PURE__ */ import_react2.default.createElement("strong", null, s.stock.length + (s.trumpCard ? 1 : 0))))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-center-trick" }, s.table.length ? s.table.map((e, i) => /* @__PURE__ */ import_react2.default.createElement("div", { key: e.playId, className: "brisca-center-card", style: { "--from-x": `${e.from.x}%`, "--from-y": `${e.from.y}%`, "--card-rot": `${(i - (s.table.length - 1) / 2) * 7}deg` } }, /* @__PURE__ */ import_react2.default.createElement(Card, { card: e.card, deckId: s.deckId }), /* @__PURE__ */ import_react2.default.createElement("small", null, s.byId[e.playerId]?.name || e.playerId))) : /* @__PURE__ */ import_react2.default.createElement("p", { className: "brisca-center-empty" }, t.yourTurn)), /* @__PURE__ */ import_react2.default.createElement("p", { className: "brisca-message" }, s.message), /* @__PURE__ */ import_react2.default.createElement("p", { className: "brisca-help" }, t.controls)), s.drawAnim ? /* @__PURE__ */ import_react2.default.createElement("div", { key: s.drawAnim.id, className: "brisca-draw-fx" }, /* @__PURE__ */ import_react2.default.createElement(Card, { hidden: true, compact: true, deckId: s.deckId })) : null, /* @__PURE__ */ import_react2.default.createElement("section", { className: ["brisca-human-zone", lastWinnerId === "human" ? "human-won-trick" : ""].join(" ") }, /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("h5", null, t.human), /* @__PURE__ */ import_react2.default.createElement("span", null, t.points, ": ", pp.human || 0)), lastWinnerId === "human" ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led human-turn-led", "aria-label": t.wonTrick }, t.wonTrick) : null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-player-hand" }, humanHand.map((card, i) => /* @__PURE__ */ import_react2.default.createElement(Card, { key: card.id, card, deckId: s.deckId, onPlay: () => playHuman(i), disabled: !canHuman || !legalHuman.includes(i) })))), s.status === "match-over" ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-match-modal-wrap", role: "dialog", "aria-live": "polite", "aria-label": t.statusMatch }, /* @__PURE__ */ import_react2.default.createElement("article", { className: "brisca-match-modal" }, /* @__PURE__ */ import_react2.default.createElement("h5", null, t.matchEndTitle), /* @__PURE__ */ import_react2.default.createElement("p", null, t.winnerIs, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, matchWinnerLabel)), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: restart }, t.newMatch))) : null)), /* @__PURE__ */ import_react2.default.createElement("details", { className: "brisca-rules" }, /* @__PURE__ */ import_react2.default.createElement("summary", null, t.promptTitle), /* @__PURE__ */ import_react2.default.createElement("pre", null, RULES[locale] || RULES.en)), s.deckId === "spanish" ? /* @__PURE__ */ import_react2.default.createElement("p", { className: "brisca-source" }, t.assets, ": ", /* @__PURE__ */ import_react2.default.createElement("a", { href: SPANISH_CARD_SOURCE, target: "_blank", rel: "noreferrer" }, t.assetsLink)) : null);
}
var StrategyBriscaDeckGame_default = StrategyBriscaDeckGame;
export {
  StrategyBriscaDeckGame_default as default
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
