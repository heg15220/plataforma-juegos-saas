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

// src/games/StrategyEscobaDeckGame.jsx
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

// src/games/StrategyEscobaDeckGame.jsx
var HAND_SIZE = 3;
var TARGET_OPTIONS = [11, 15, 21];
var PLAYER_OPTIONS = [2, 3, 4];
var AI_DELAY_MS = 2300;
var TURN_SETTLE_DELAY_MS = 900;
var CAPTURE_FX_MS = 4800;
var CAPTURE_FX_GAP_MS = 900;
var DEAL_TO_HAND_FX_CARD_MS = 1200;
var DEAL_TO_HAND_FX_STAGGER_MS = 220;
var BACK_IMAGE = "/assets/cards/spanish/reverso.png";
var DIFF = {
  easy: { id: "easy", label: { es: "Facil", en: "Easy" }, noise: 55 },
  medium: { id: "medium", label: { es: "Media", en: "Medium" }, noise: 30 },
  hard: { id: "hard", label: { es: "Dificil", en: "Hard" }, noise: 14 },
  expert: { id: "expert", label: { es: "Experto", en: "Expert" }, noise: 6 }
};
var DECKS = {
  spanish: {
    id: "spanish",
    name: { es: "Espanola (40)", en: "Spanish (40)" },
    suits: [
      { id: "oros", symbol: "\u2666", colorClass: "suit-red", map: { es: "Oros", en: "Oros" } },
      { id: "copas", symbol: "\u2665", colorClass: "suit-red", map: { es: "Copas", en: "Copas" } },
      { id: "espadas", symbol: "\u2660", colorClass: "suit-black", map: { es: "Espadas", en: "Espadas" } },
      { id: "bastos", symbol: "\u2663", colorClass: "suit-black", map: { es: "Bastos", en: "Bastos" } }
    ],
    ranks: [
      { rank: 1, label: "A", value: 1 },
      { rank: 2, label: "2", value: 2 },
      { rank: 3, label: "3", value: 3 },
      { rank: 4, label: "4", value: 4 },
      { rank: 5, label: "5", value: 5 },
      { rank: 6, label: "6", value: 6 },
      { rank: 7, label: "7", value: 7 },
      { rank: 10, label: "S", value: 8 },
      { rank: 11, label: "C", value: 9 },
      { rank: 12, label: "R", value: 10 }
    ]
  },
  english_adapted: {
    id: "english_adapted",
    name: { es: "Inglesa adaptada (40)", en: "Adapted English (40)" },
    suits: [
      {
        id: "oros",
        symbol: "\u2666",
        colorClass: "suit-red",
        map: { es: "Diamantes (Oros)", en: "Diamonds (Oros)" }
      },
      {
        id: "copas",
        symbol: "\u2665",
        colorClass: "suit-red",
        map: { es: "Corazones (Copas)", en: "Hearts (Copas)" }
      },
      {
        id: "bastos",
        symbol: "\u2663",
        colorClass: "suit-black",
        map: { es: "Treboles (Bastos)", en: "Clubs (Bastos)" }
      },
      {
        id: "espadas",
        symbol: "\u2660",
        colorClass: "suit-black",
        map: { es: "Picas (Espadas)", en: "Spades (Espadas)" }
      }
    ],
    ranks: [
      { rank: 1, label: "A", value: 1 },
      { rank: 2, label: "2", value: 2 },
      { rank: 3, label: "3", value: 3 },
      { rank: 4, label: "4", value: 4 },
      { rank: 5, label: "5", value: 5 },
      { rank: 6, label: "6", value: 6 },
      { rank: 7, label: "7", value: 7 },
      { rank: 11, label: "J", value: 8 },
      { rank: 12, label: "Q", value: 9 },
      { rank: 13, label: "K", value: 10 }
    ]
  }
};
var SEAT_LAYOUTS = {
  2: [
    { slot: "bottom", x: 50, y: 86 },
    { slot: "top", x: 50, y: 12 }
  ],
  3: [
    { slot: "bottom", x: 50, y: 86 },
    { slot: "left", x: 12, y: 44 },
    { slot: "right", x: 88, y: 44 }
  ],
  4: [
    { slot: "bottom", x: 50, y: 87 },
    { slot: "left", x: 11, y: 44 },
    { slot: "top", x: 50, y: 12 },
    { slot: "right", x: 89, y: 44 }
  ]
};
var T = {
  es: {
    title: "Escoba del 15 IA",
    subtitleSpanish: "Modo Escoba con baraja espanola tradicional de 40 cartas (A..7, S, C, R).",
    subtitleEnglishAdapted: "Modo Escoba con baraja inglesa adaptada: sin 8, 9 y 10, y palos mapeados a oros/copas/bastos/espadas.",
    players: "Jugadores",
    diff: "Dificultad IA",
    target: "Puntos objetivo",
    deck: "Baraja",
    mandatory: "Recogida obligatoria",
    mandatoryOn: "Si",
    mandatoryOff: "No",
    teams: "Variante",
    teamsIndividual: "Individual",
    teamsPairs: "Parejas (2v2)",
    apply: "Aplicar y reiniciar",
    newMatch: "Nueva partida",
    nextHand: "Siguiente mano",
    phase: "Fase",
    phasePlaying: "En juego",
    phaseHandOver: "Mano cerrada",
    phaseMatchOver: "Partida cerrada",
    hand: "Mano",
    dealer: "Repartidor",
    turn: "Turno",
    turnLed: "Turno actual",
    stock: "Mazo",
    table: "Mesa",
    scores: "Marcador",
    escobas: "Escobas",
    captures: "Capturas",
    hidden: "ocultas",
    yourHand: "Tu mano",
    selectTable: "Selecciona cartas de la mesa para formar 15 con la carta que juegues.",
    mustCaptureChoice: "Debes recoger: elige una combinacion valida de la mesa.",
    invalidCapture: "Seleccion invalida: las cartas marcadas no forman 15.",
    noCapture: "No hay recogida posible. Carta depositada en mesa.",
    captured: "Recogida completada.",
    escobaMade: "Escoba lograda.",
    handOver: "Mano terminada. Revisa el reparto de puntos.",
    tieBreak: "Empate por encima del objetivo. Se juega una mano adicional de desempate.",
    winner: "Ganador",
    roundWinner: "Ganador de ronda",
    roundTie: "Empate de ronda",
    wonRoundLed: "Gana ronda",
    matchEnd: "Partida de Escoba terminada",
    summary: "Resumen de mano",
    categoryEscobas: "Escobas",
    categorySevenOros: "Siete de oros",
    categoryMostSevens: "Mayoria de sietes",
    categoryMostCards: "Mayoria de cartas",
    categoryMostOros: "Mayoria de oros",
    none: "Ninguno",
    controls: "Haz click en cartas de mesa para marcarlas y click en tu carta para jugar. Teclas: 1-3 juegan carta, Enter juega la primera, N siguiente mano, R reinicia.",
    rulesTitle: "Reglamento aplicado",
    rulesSpanish: "Escoba del 15 con baraja espanola tradicional de 40 cartas. Valores: As=1, 2..7 segun indice, Sota=8, Caballo=9, Rey=10. Se reparte 3 por jugador y 4 a la mesa; cada jugada intenta sumar 15 con carta jugada + mesa. Si limpias mesa haces escoba (+1). Al final: +1 por cada escoba, +1 por siete de oros, +1 por mayoria de sietes, +1 por mayoria de cartas y +1 por mayoria de oros. En empate por categoria, puntuan todos los empatados.",
    rulesEnglishAdapted: "Escoba del 15 con baraja inglesa adaptada a 40 cartas: se eliminan 8, 9 y 10. Valores: A=1..7=7, J=8, Q=9, K=10. Palos: Diamantes=Oros, Corazones=Copas, Treboles=Bastos, Picas=Espadas. Se reparte 3 por jugador y 4 a la mesa; cada jugada intenta sumar 15 con carta jugada + mesa. Si limpias mesa haces escoba (+1). Al final: +1 por cada escoba, +1 por siete de oros, +1 por mayoria de sietes, +1 por mayoria de cartas y +1 por mayoria de oros. En empate por categoria, puntuan todos los empatados.",
    suitMap: "Mapa de palos",
    teamUser: "Tu equipo",
    teamRival: "Rivales",
    you: "Tu",
    partner: "Companero IA",
    ai: "IA",
    clearSel: "Limpiar seleccion",
    selected: "Seleccionadas",
    canCapture: "Opciones de recogida",
    lastMove: "Ultima jugada",
    playedCard: "Carta jugada",
    capturedCards: "Cartas recogidas",
    captureFx: (name, count) => `${name} recoge ${count} cartas para sumar 15.`,
    tableAfter: "Mesa tras jugada",
    handAfter: "Cartas en mano",
    lastKnownCard: "Ultima carta vista",
    aiThinking: "La IA esta pensando su jugada...",
    settlePause: "Pausa para revisar la jugada anterior.",
    mandatoryHintOn: "Recogida obligatoria activa: no puedes tirar carta si existe combinacion a 15.",
    mandatoryHintOff: "Recogida obligatoria desactivada: puedes tirar carta sin recoger.",
    initialEscoba: "Escoba(s) inicial(es) del repartidor",
    redeal: "Nuevo reparto de 3 cartas.",
    newHandStart: "Nueva mano iniciada."
  },
  en: {
    title: "AI Escoba 15",
    subtitleSpanish: "Escoba mode using the traditional 40-card Spanish deck (A..7, S, C, R).",
    subtitleEnglishAdapted: "Escoba mode with adapted English deck: 8/9/10 removed and suits mapped to Oros/Copas/Bastos/Espadas.",
    players: "Players",
    diff: "AI difficulty",
    target: "Target points",
    deck: "Deck",
    mandatory: "Mandatory capture",
    mandatoryOn: "Yes",
    mandatoryOff: "No",
    teams: "Variant",
    teamsIndividual: "Individual",
    teamsPairs: "Pairs (2v2)",
    apply: "Apply & reset",
    newMatch: "New match",
    nextHand: "Next hand",
    phase: "Phase",
    phasePlaying: "Playing",
    phaseHandOver: "Hand over",
    phaseMatchOver: "Match over",
    hand: "Hand",
    dealer: "Dealer",
    turn: "Turn",
    turnLed: "Current turn",
    stock: "Stock",
    table: "Table",
    scores: "Scoreboard",
    escobas: "Escobas",
    captures: "Captures",
    hidden: "hidden",
    yourHand: "Your hand",
    selectTable: "Select table cards to make 15 with the card you play.",
    mustCaptureChoice: "Capture is mandatory: pick a valid table combination.",
    invalidCapture: "Invalid selection: selected cards do not make 15.",
    noCapture: "No capture available. Card dropped on table.",
    captured: "Capture completed.",
    escobaMade: "Escoba completed.",
    handOver: "Hand finished. Review scoring breakdown.",
    tieBreak: "Tie above target. An extra tie-break hand will be played.",
    winner: "Winner",
    roundWinner: "Round winner",
    roundTie: "Round tie",
    wonRoundLed: "Won round",
    matchEnd: "Escoba match finished",
    summary: "Hand summary",
    categoryEscobas: "Escobas",
    categorySevenOros: "Seven of Oros",
    categoryMostSevens: "Most sevens",
    categoryMostCards: "Most cards",
    categoryMostOros: "Most Oros",
    none: "None",
    controls: "Click table cards to mark them, then click your hand card to play. Keys: 1-3 play card, Enter plays first card, N next hand, R restart.",
    rulesTitle: "Applied rules",
    rulesSpanish: "Escoba del 15 on the traditional 40-card Spanish deck. Values: Ace=1, 2..7 by rank, Sota=8, Caballo=9, Rey=10. Deal 3 cards to each player and 4 to the table; each play tries to make 15 with played card + table cards. Clearing table gives an escoba (+1). End-hand scoring: +1 per escoba, +1 seven of Oros, +1 most sevens, +1 most cards, +1 most Oros. Category ties award all tied owners.",
    rulesEnglishAdapted: "Escoba del 15 on an adapted English deck (40 cards): 8, 9 and 10 removed. Values: A=1..7=7, J=8, Q=9, K=10. Suit mapping: Diamonds=Oros, Hearts=Copas, Clubs=Bastos, Spades=Espadas. Deal 3 cards each and 4 to table; each play tries to make 15 using played card + table cards. Clearing table gives an escoba (+1). End-hand scoring: +1 each escoba, +1 seven of Oros, +1 most sevens, +1 most cards, +1 most Oros. Category ties award all tied owners.",
    suitMap: "Suit map",
    teamUser: "Your team",
    teamRival: "Opponents",
    you: "You",
    partner: "Partner AI",
    ai: "AI",
    clearSel: "Clear selection",
    selected: "Selected",
    canCapture: "Capture options",
    lastMove: "Last move",
    playedCard: "Played card",
    capturedCards: "Captured cards",
    captureFx: (name, count) => `${name} captures ${count} cards to make 15.`,
    tableAfter: "Table after move",
    handAfter: "Cards in hand",
    lastKnownCard: "Last seen card",
    aiThinking: "AI is thinking about the next move...",
    settlePause: "Pause to review the previous move.",
    mandatoryHintOn: "Mandatory capture is ON: you cannot drop a card when a 15 capture exists.",
    mandatoryHintOff: "Mandatory capture is OFF: you may drop a card without capturing.",
    initialEscoba: "Dealer initial escoba(s)",
    redeal: "Dealt a new set of 3 cards.",
    newHandStart: "New hand started."
  }
};
var isEs = () => typeof navigator !== "undefined" && String(navigator.language || "").toLowerCase().startsWith("es");
var localeOf = () => isEs() ? "es" : "en";
var tt = (loc) => T[loc] || T.en;
var deckIdForLocale = (loc) => loc === "es" ? "spanish" : "english_adapted";
var normDeckId = (id) => DECKS[id] ? id : "english_adapted";
var normPlayers = (n) => {
  const parsed = Number(n);
  return PLAYER_OPTIONS.includes(parsed) ? parsed : 4;
};
var normDiff = (id) => DIFF[id] ? id : "medium";
var normTarget = (n) => {
  const parsed = Number(n);
  return TARGET_OPTIONS.includes(parsed) ? parsed : 15;
};
var normTeamMode = (playerCount, value) => normPlayers(playerCount) === 4 ? Boolean(value) : false;
var nextId = (order, id) => {
  const idx = order.indexOf(id);
  if (idx < 0)
    return order[0];
  return order[(idx + 1) % order.length];
};
var rotateFromIndex = (items, index) => {
  if (!items.length)
    return [];
  const start = (index % items.length + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
};
var shuffle = (items) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
var cardText = (card) => card ? `${card.rankLabel}${card.suitSymbol}` : "--";
var sumValues = (cards) => cards.reduce((sum, card) => sum + (card?.captureValue || 0), 0);
var sameIdSet = (idsA, idsB) => {
  if (idsA.length !== idsB.length)
    return false;
  const setA = new Set(idsA);
  return idsB.every((id) => setA.has(id));
};
var buildDeck = (deckId) => {
  const deck = DECKS[normDeckId(deckId)];
  const cards = [];
  deck.suits.forEach((suit) => {
    deck.ranks.forEach((rank) => {
      cards.push({
        id: `escoba-${deck.id}-${suit.id}-${rank.rank}`,
        suitId: suit.id,
        suitSymbol: suit.symbol,
        colorClass: suit.colorClass,
        rank: rank.rank,
        rankLabel: rank.label,
        captureValue: rank.value,
        imageUrl: deck.id === "spanish" ? `/assets/cards/spanish/${String(rank.rank).padStart(2, "0")}-${suit.id}.png` : null
      });
    });
  });
  return cards;
};
var buildPlayers = (playerCount, teamMode, t) => {
  const count = normPlayers(playerCount);
  const seats = SEAT_LAYOUTS[count] || SEAT_LAYOUTS[4];
  const players = [];
  for (let i = 0; i < count; i += 1) {
    const id = i === 0 ? "human" : `ai-${i}`;
    const isHuman = i === 0;
    const side = teamMode ? i % 2 === 0 ? "user" : "rival" : isHuman ? "user" : "rival";
    const name = isHuman ? t.you : teamMode && side === "user" ? `${t.partner} ${Math.max(1, Math.floor(i / 2))}` : `${t.ai} ${i}`;
    players.push({
      id,
      name,
      human: isHuman,
      ai: !isHuman,
      side,
      seat: seats[i] || seats[0]
    });
  }
  return players;
};
var ownerIdsFrom = (players, teamMode) => teamMode ? ["user", "rival"] : players.map((p) => p.id);
var ownerOfPlayer = (state, playerId) => state.teamMode ? state.byId[playerId]?.side === "user" ? "user" : "rival" : playerId;
var ownerLabel = (state, ownerId, t) => {
  if (state.teamMode)
    return ownerId === "user" ? t.teamUser : t.teamRival;
  return state.byId[ownerId]?.name || ownerId;
};
var buildTurnMessage = (state, playerId, playedCard, capturedCards, madeEscoba, t) => {
  const actorName = state.byId[playerId]?.name || playerId;
  const playedText = cardText(playedCard);
  if (!capturedCards.length) {
    return `${actorName}: ${playedText}. ${t.noCapture}`;
  }
  const captureText = capturedCards.map((card) => cardText(card)).join(" + ");
  if (madeEscoba) {
    return `${actorName}: ${playedText} + ${captureText}. ${t.escobaMade}`;
  }
  return `${actorName}: ${playedText} + ${captureText}. ${t.captured}`;
};
var createOwnerMap = (players, teamMode, initialValue = 0) => Object.fromEntries(ownerIdsFrom(players, teamMode).map((id) => [id, initialValue]));
var tableCombosForTarget = (tableCards, target) => {
  const out = [];
  if (target <= 0)
    return out;
  const walk = (start, running, picked) => {
    if (running === target && picked.length) {
      out.push([...picked]);
      return;
    }
    if (running >= target)
      return;
    for (let i = start; i < tableCards.length; i += 1) {
      const card = tableCards[i];
      const next = running + card.captureValue;
      if (next > target)
        continue;
      picked.push(card);
      walk(i + 1, next, picked);
      picked.pop();
    }
  };
  walk(0, 0, []);
  return out;
};
var captureOptionsForCard = (card, tableCards) => tableCombosForTarget(tableCards, 15 - card.captureValue).map((cards) => ({
  ids: cards.map((c) => c.id),
  cards
}));
var initialEscobasFromTable = (tableCards) => {
  const total = sumValues(tableCards);
  if (total === 15)
    return 1;
  if (total !== 30)
    return 0;
  const combos = tableCombosForTarget(tableCards, 15);
  for (const combo of combos) {
    const set = new Set(combo.map((c) => c.id));
    if (set.size === combo.length && combo.length < tableCards.length) {
      return 2;
    }
  }
  return 0;
};
var dealRoundCards = (hands, stock, order, cardCount) => {
  for (let i = 0; i < cardCount; i += 1) {
    order.forEach((id) => {
      const card = stock.pop();
      if (card)
        hands[id].push(card);
    });
  }
};
var aiOptionScore = (option, tableSize) => {
  const all = option.cards;
  const sevens = all.filter((c) => c.rank === 7).length;
  const oros = all.filter((c) => c.suitId === "oros").length;
  const sevenOros = all.some((c) => c.rank === 7 && c.suitId === "oros") ? 1 : 0;
  const escoba = all.length === tableSize ? 1 : 0;
  return all.length * 10 + sevens * 30 + oros * 9 + sevenOros * 120 + escoba * 160;
};
var pickAiMove = (state, playerId) => {
  const hand = state.hands[playerId] || [];
  const diff = DIFF[state.difficultyId] || DIFF.medium;
  const moves = hand.map((card, cardIndex) => {
    const options = captureOptionsForCard(card, state.tableCards);
    if (!options.length) {
      return {
        cardIndex,
        option: null,
        score: -(card.captureValue * 9) - (card.rank >= 11 ? 8 : 0) + Math.random() * diff.noise
      };
    }
    const ranked = options.map((opt) => ({
      ...opt,
      score: aiOptionScore({ ...opt, cards: [...opt.cards, card] }, state.tableCards.length) + Math.random() * diff.noise
    })).sort((a, b) => b.score - a.score);
    return {
      cardIndex,
      option: ranked[0],
      score: ranked[0].score + card.captureValue
    };
  });
  const best = moves.sort((a, b) => b.score - a.score)[0];
  return best || { cardIndex: 0, option: null };
};
var teamLabel = (side, t) => side === "user" ? t.teamUser : t.teamRival;
var hasPendingCaptureFx = (state) => Boolean(state.captureFx || (state.captureFxQueue?.length || 0) > 0);
var scoreHand = (state, t) => {
  const owners = ownerIdsFrom(state.players, state.teamMode);
  const pointsByOwner = Object.fromEntries(owners.map((owner) => [owner, 0]));
  const byOwnerEscobas = Object.fromEntries(owners.map((owner) => [owner, 0]));
  const byOwnerCards = Object.fromEntries(owners.map((owner) => [owner, 0]));
  const byOwnerSevens = Object.fromEntries(owners.map((owner) => [owner, 0]));
  const byOwnerOros = Object.fromEntries(owners.map((owner) => [owner, 0]));
  let sevenOrosOwner = null;
  state.order.forEach((playerId) => {
    const owner = ownerOfPlayer(state, playerId);
    const cards = state.captures[playerId] || [];
    byOwnerEscobas[owner] += state.escobas[playerId] || 0;
    byOwnerCards[owner] += cards.length;
    cards.forEach((card) => {
      if (card.rank === 7)
        byOwnerSevens[owner] += 1;
      if (card.suitId === "oros")
        byOwnerOros[owner] += 1;
      if (card.rank === 7 && card.suitId === "oros")
        sevenOrosOwner = owner;
    });
  });
  const breakdown = [];
  owners.forEach((owner) => {
    const esc = byOwnerEscobas[owner];
    if (esc > 0) {
      pointsByOwner[owner] += esc;
      breakdown.push({
        key: "escobas",
        label: t.categoryEscobas,
        owner,
        points: esc,
        detail: String(esc)
      });
    }
  });
  if (sevenOrosOwner) {
    pointsByOwner[sevenOrosOwner] += 1;
    breakdown.push({
      key: "seven-oros",
      label: t.categorySevenOros,
      owner: sevenOrosOwner,
      points: 1,
      detail: "7\u2666"
    });
  }
  const maxSevens = Math.max(...owners.map((owner) => byOwnerSevens[owner] || 0));
  if (maxSevens > 0) {
    owners.filter((owner) => byOwnerSevens[owner] === maxSevens).forEach((owner) => {
      pointsByOwner[owner] += 1;
      breakdown.push({
        key: "most-sevens",
        label: t.categoryMostSevens,
        owner,
        points: 1,
        detail: String(maxSevens)
      });
    });
  }
  const maxCards = Math.max(...owners.map((owner) => byOwnerCards[owner] || 0));
  if (maxCards > 0) {
    owners.filter((owner) => byOwnerCards[owner] === maxCards).forEach((owner) => {
      pointsByOwner[owner] += 1;
      breakdown.push({
        key: "most-cards",
        label: t.categoryMostCards,
        owner,
        points: 1,
        detail: String(maxCards)
      });
    });
  }
  const maxOros = Math.max(...owners.map((owner) => byOwnerOros[owner] || 0));
  if (maxOros > 0) {
    owners.filter((owner) => byOwnerOros[owner] === maxOros).forEach((owner) => {
      pointsByOwner[owner] += 1;
      breakdown.push({
        key: "most-oros",
        label: t.categoryMostOros,
        owner,
        points: 1,
        detail: String(maxOros)
      });
    });
  }
  return {
    pointsByOwner,
    breakdown,
    byOwnerEscobas,
    byOwnerCards,
    byOwnerSevens,
    byOwnerOros
  };
};
var withAutoTurn = (state) => {
  if (hasPendingCaptureFx(state)) {
    if (!state.auto)
      return state;
    return { ...state, auto: null };
  }
  if (state.phase === "playing" && state.byId[state.turnId]?.ai) {
    const current = state.auto;
    const targetMs = AI_DELAY_MS;
    if (current?.type === "ai-turn" && current.ms === targetMs)
      return state;
    return { ...state, auto: { type: "ai-turn", ms: targetMs } };
  }
  if (!state.auto)
    return state;
  return { ...state, auto: null };
};
var withTurnSettlePause = (state) => {
  if (state.phase !== "playing")
    return { ...state, auto: null };
  if (hasPendingCaptureFx(state))
    return { ...state, auto: null };
  const current = state.auto;
  const targetMs = TURN_SETTLE_DELAY_MS;
  if (current?.type === "turn-settle" && current.ms === targetMs)
    return state;
  return { ...state, auto: { type: "turn-settle", ms: targetMs } };
};
var runAutoStep = (state) => {
  if (hasPendingCaptureFx(state))
    return { ...state, auto: null };
  if (!state.auto)
    return state;
  if (state.auto.type === "turn-settle") {
    return withAutoTurn({ ...state, auto: null });
  }
  if (state.auto.type === "ai-turn") {
    return runAiTurn({ ...state, auto: null });
  }
  return { ...state, auto: null };
};
var makeHandState = (base, handNumber, dealerIndex, scores, initialMessage = null) => {
  const t = tt(base.locale);
  const stock = shuffle(buildDeck(base.deckId));
  const hands = Object.fromEntries(base.order.map((id) => [id, []]));
  const captures = Object.fromEntries(base.order.map((id) => [id, []]));
  const escobas = Object.fromEntries(base.order.map((id) => [id, 0]));
  const manoIndex = (dealerIndex - 1 + base.order.length) % base.order.length;
  const dealOrder = rotateFromIndex(base.order, manoIndex);
  dealRoundCards(hands, stock, dealOrder, HAND_SIZE);
  const tableCards = [];
  for (let i = 0; i < 4; i += 1) {
    const card = stock.pop();
    if (card)
      tableCards.push(card);
  }
  let message = initialMessage || t.newHandStart;
  let lastCapturerId = null;
  const dealerId = base.order[dealerIndex];
  const initEscobas = initialEscobasFromTable(tableCards);
  if (initEscobas > 0) {
    captures[dealerId].push(...tableCards.splice(0));
    escobas[dealerId] += initEscobas;
    lastCapturerId = dealerId;
    message = `${base.byId[dealerId]?.name || dealerId}: ${t.initialEscoba} +${initEscobas}`;
  }
  return withAutoTurn({
    ...base,
    phase: "playing",
    handNumber,
    dealerIndex,
    manoId: base.order[manoIndex],
    turnId: base.order[manoIndex],
    stock,
    hands,
    tableCards,
    captures,
    escobas,
    lastCapturerId,
    lastMove: null,
    revealedCards: {},
    captureFx: null,
    captureFxQueue: [],
    captureFxSeq: 0,
    dealFx: null,
    dealFxSeq: 0,
    selectedTableIds: [],
    lastHand: null,
    matchWinner: null,
    scores: { ...scores },
    message,
    auto: null
  });
};
var createMatch = (locale, opts = {}) => {
  const t = tt(locale);
  const playerCount = normPlayers(opts.playerCount || 4);
  const teamMode = normTeamMode(playerCount, opts.teamMode);
  const difficultyId = normDiff(opts.difficultyId || "medium");
  const targetPoints = normTarget(opts.targetPoints || 15);
  const mandatoryCapture = opts.mandatoryCapture !== false;
  const deckId = deckIdForLocale(locale);
  const deck = DECKS[deckId];
  const players = buildPlayers(playerCount, teamMode, t);
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const order = players.map((p) => p.id);
  const base = {
    locale,
    deckId,
    deckName: deck.name[locale] || deck.name.en,
    players,
    byId,
    order,
    playerCount,
    teamMode,
    difficultyId,
    targetPoints,
    mandatoryCapture
  };
  const scores = createOwnerMap(players, teamMode, 0);
  const dealerIndex = Math.floor(Math.random() * order.length);
  return makeHandState(base, 1, dealerIndex, scores, t.newHandStart);
};
var endHandIfNeeded = (state) => {
  const t = tt(state.locale);
  const noCardsInHands = state.order.every((id) => (state.hands[id] || []).length === 0);
  if (!noCardsInHands)
    return state;
  if (state.stock.length > 0) {
    const hands = Object.fromEntries(
      state.order.map((id) => [id, [...state.hands[id] || []]])
    );
    const stock = [...state.stock];
    const manoIndex = state.order.indexOf(state.manoId);
    const dealOrder = rotateFromIndex(state.order, manoIndex);
    dealRoundCards(hands, stock, dealOrder, HAND_SIZE);
    const dealtToHuman = Math.max(
      0,
      (hands.human || []).length - (state.hands.human || []).length
    );
    const nextDealFxSeq = dealtToHuman > 0 ? (state.dealFxSeq || 0) + 1 : state.dealFxSeq || 0;
    const dealFx = dealtToHuman > 0 ? { id: nextDealFxSeq, count: dealtToHuman } : null;
    return withAutoTurn({
      ...state,
      hands,
      stock,
      turnId: state.manoId,
      selectedTableIds: [],
      message: t.redeal,
      captureFx: null,
      captureFxQueue: [],
      dealFx,
      dealFxSeq: nextDealFxSeq,
      auto: null
    });
  }
  let captures = state.captures;
  let tableCards = state.tableCards;
  if (state.lastCapturerId && state.tableCards.length) {
    captures = {
      ...state.captures,
      [state.lastCapturerId]: [
        ...state.captures[state.lastCapturerId] || [],
        ...state.tableCards
      ]
    };
    tableCards = [];
  }
  const scored = scoreHand({ ...state, captures, tableCards }, t);
  const owners = ownerIdsFrom(state.players, state.teamMode);
  const scores = { ...state.scores };
  owners.forEach((owner) => {
    scores[owner] = (scores[owner] || 0) + (scored.pointsByOwner[owner] || 0);
  });
  const roundMax = Math.max(...owners.map((owner) => scored.pointsByOwner[owner] || 0));
  const roundWinners = roundMax > 0 ? owners.filter((owner) => (scored.pointsByOwner[owner] || 0) === roundMax) : [];
  const roundWinnerLabel = roundWinners.length ? roundWinners.map((owner) => ownerLabel(state, owner, t)).join(", ") : t.none;
  const maxPoints = Math.max(...owners.map((owner) => scores[owner] || 0));
  const leaders = owners.filter((owner) => (scores[owner] || 0) === maxPoints);
  const targetReached = maxPoints >= state.targetPoints;
  const uniqueWinner = targetReached && leaders.length === 1 ? leaders[0] : null;
  return {
    ...state,
    phase: uniqueWinner ? "match-over" : "hand-over",
    captures,
    tableCards,
    captureFx: null,
    captureFxQueue: [],
    dealFx: null,
    auto: null,
    matchWinner: uniqueWinner,
    scores,
    message: uniqueWinner ? `${ownerLabel(state, uniqueWinner, t)} ${t.winner.toLowerCase()}.` : targetReached && leaders.length > 1 ? t.tieBreak : t.handOver,
    lastHand: {
      pointsByOwner: scored.pointsByOwner,
      breakdown: scored.breakdown,
      byOwnerEscobas: scored.byOwnerEscobas,
      byOwnerCards: scored.byOwnerCards,
      byOwnerSevens: scored.byOwnerSevens,
      byOwnerOros: scored.byOwnerOros,
      scoresAfter: scores,
      winnerOwners: roundWinners,
      winnerLabel: roundWinnerLabel
    }
  };
};
var resolvePlay = (state, playerId, cardIndex, chosenOption) => {
  if (state.phase !== "playing" || state.turnId !== playerId || state.auto || hasPendingCaptureFx(state)) {
    return state;
  }
  const t = tt(state.locale);
  const hand = [...state.hands[playerId] || []];
  const card = hand[cardIndex];
  if (!card)
    return state;
  hand.splice(cardIndex, 1);
  const hands = { ...state.hands, [playerId]: hand };
  const tableCards = [...state.tableCards];
  const captures = { ...state.captures, [playerId]: [...state.captures[playerId] || []] };
  const escobas = { ...state.escobas };
  const actorName = state.byId[playerId]?.name || playerId;
  let lastCapturerId = state.lastCapturerId;
  let pickedCards = [];
  let madeEscoba = false;
  if (chosenOption?.cards?.length) {
    const takeIds = new Set(chosenOption.cards.map((c) => c.id));
    const picked = tableCards.filter((c) => takeIds.has(c.id));
    const remaining = tableCards.filter((c) => !takeIds.has(c.id));
    pickedCards = picked;
    captures[playerId].push(...pickedCards, card);
    lastCapturerId = playerId;
    if (remaining.length === 0) {
      escobas[playerId] = (escobas[playerId] || 0) + 1;
      madeEscoba = true;
    }
    tableCards.splice(0, tableCards.length, ...remaining);
  } else {
    tableCards.push(card);
  }
  const message = buildTurnMessage(state, playerId, card, pickedCards, madeEscoba, t);
  const nextCaptureFxSeq = pickedCards.length ? (state.captureFxSeq || 0) + 1 : state.captureFxSeq || 0;
  const captureFxCards = pickedCards.length ? [card, ...pickedCards].map((item) => ({ ...item })) : [];
  const captureFx = pickedCards.length ? {
    id: nextCaptureFxSeq,
    actorId: playerId,
    text: t.captureFx(actorName, pickedCards.length + 1),
    cards: captureFxCards
  } : null;
  const captureFxQueue = [...state.captureFxQueue || []];
  let activeCaptureFx = state.captureFx || null;
  if (captureFx) {
    if (activeCaptureFx || captureFxQueue.length) {
      captureFxQueue.push(captureFx);
    } else {
      activeCaptureFx = captureFx;
    }
  }
  const playedCardText = cardText(card);
  const nextTurnId = nextId(state.order, playerId);
  const updated = {
    ...state,
    hands,
    tableCards,
    captures,
    escobas,
    lastCapturerId,
    turnId: nextTurnId,
    selectedTableIds: [],
    revealedCards: {
      ...state.revealedCards || {},
      [playerId]: playedCardText
    },
    lastMove: {
      actorId: playerId,
      actorName,
      card: playedCardText,
      cardId: card.id,
      captured: pickedCards.map((pickedCard) => cardText(pickedCard)),
      madeEscoba,
      tableCountAfter: tableCards.length,
      handCountAfter: hand.length
    },
    captureFx: activeCaptureFx,
    captureFxQueue,
    captureFxSeq: nextCaptureFxSeq,
    message,
    auto: null
  };
  const afterPlay = endHandIfNeeded(updated);
  if (afterPlay.phase !== "playing") {
    return { ...afterPlay, auto: null };
  }
  return withTurnSettlePause(afterPlay);
};
var applyHumanCard = (state, cardIndex) => {
  if (state.phase !== "playing" || state.turnId !== "human" || state.auto || hasPendingCaptureFx(state)) {
    return state;
  }
  const t = tt(state.locale);
  const hand = state.hands.human || [];
  const card = hand[cardIndex];
  if (!card)
    return state;
  const options = captureOptionsForCard(card, state.tableCards);
  const selectedIds = [...state.selectedTableIds];
  const selectedOption = options.find((opt) => sameIdSet(opt.ids, selectedIds));
  if (options.length && state.mandatoryCapture) {
    if (selectedOption)
      return resolvePlay(state, "human", cardIndex, selectedOption);
    if (!selectedIds.length && options.length === 1) {
      return resolvePlay(state, "human", cardIndex, options[0]);
    }
    return { ...state, message: t.mustCaptureChoice };
  }
  if (selectedIds.length) {
    if (!selectedOption)
      return { ...state, message: t.invalidCapture };
    return resolvePlay(state, "human", cardIndex, selectedOption);
  }
  return resolvePlay(state, "human", cardIndex, null);
};
var runAiTurn = (state) => {
  if (state.phase !== "playing")
    return { ...state, auto: null };
  const player = state.byId[state.turnId];
  if (!player?.ai)
    return { ...state, auto: null };
  const move = pickAiMove(state, player.id);
  return resolvePlay({ ...state, auto: null }, player.id, move.cardIndex, move.option);
};
function Card({
  card,
  deckId = "english_adapted",
  hidden = false,
  compact = false,
  onClick,
  disabled,
  selected,
  led = false
}) {
  const cls = [
    "brisca-card",
    compact ? "compact" : "",
    hidden ? "hidden" : "",
    card?.imageUrl ? "image-card" : "",
    card?.colorClass || "",
    onClick ? "playable" : "",
    selected ? "selected-for-discard" : "",
    led ? "led-marked" : ""
  ].filter(Boolean).join(" ");
  if (hidden) {
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: cls }, deckId === "spanish" ? /* @__PURE__ */ import_react2.default.createElement("img", { src: BACK_IMAGE, alt: "hidden", className: "back-image" }) : /* @__PURE__ */ import_react2.default.createElement("span", { className: "back-mark" }, "IA"));
  }
  if (!card)
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: `${cls} slot` }, /* @__PURE__ */ import_react2.default.createElement("span", null, "--"));
  const face = card.imageUrl ? /* @__PURE__ */ import_react2.default.createElement("img", { src: card.imageUrl, alt: cardText(card), className: "face-image" }) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "rank" }, card.rankLabel), /* @__PURE__ */ import_react2.default.createElement("span", { className: "suit" }, card.suitSymbol), /* @__PURE__ */ import_react2.default.createElement("span", { className: "points" }, card.captureValue));
  if (onClick) {
    return /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: cls, onClick, disabled }, face);
  }
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: cls }, face);
}
function StrategyEscobaDeckGame() {
  const locale = (0, import_react2.useMemo)(localeOf, []);
  const t = (0, import_react2.useMemo)(() => tt(locale), [locale]);
  const [s, setS] = (0, import_react2.useState)(() => createMatch(locale));
  const [pPlayers, setPPlayers] = (0, import_react2.useState)(4);
  const [pDiff, setPDiff] = (0, import_react2.useState)("medium");
  const [pTarget, setPTarget] = (0, import_react2.useState)(15);
  const [pMandatory, setPMandatory] = (0, import_react2.useState)(true);
  const [pTeamMode, setPTeamMode] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    setPPlayers(s.playerCount);
    setPDiff(s.difficultyId);
    setPTarget(s.targetPoints);
    setPMandatory(Boolean(s.mandatoryCapture));
    setPTeamMode(Boolean(s.teamMode));
  }, [s.playerCount, s.difficultyId, s.targetPoints, s.mandatoryCapture, s.teamMode]);
  const apply = (0, import_react2.useCallback)(() => {
    setS(
      createMatch(locale, {
        playerCount: pPlayers,
        difficultyId: pDiff,
        targetPoints: pTarget,
        mandatoryCapture: pMandatory,
        teamMode: pTeamMode
      })
    );
  }, [locale, pPlayers, pDiff, pTarget, pMandatory, pTeamMode]);
  const restart = (0, import_react2.useCallback)(() => {
    setS(
      (prev) => createMatch(prev.locale, {
        playerCount: prev.playerCount,
        difficultyId: prev.difficultyId,
        targetPoints: prev.targetPoints,
        mandatoryCapture: prev.mandatoryCapture,
        teamMode: prev.teamMode
      })
    );
  }, []);
  const nextHand = (0, import_react2.useCallback)(() => {
    setS((prev) => {
      if (prev.phase !== "hand-over")
        return prev;
      const nextDealer = (prev.dealerIndex + 1) % prev.order.length;
      const base = {
        locale: prev.locale,
        deckId: prev.deckId,
        deckName: prev.deckName,
        players: prev.players,
        byId: prev.byId,
        order: prev.order,
        playerCount: prev.playerCount,
        teamMode: prev.teamMode,
        difficultyId: prev.difficultyId,
        targetPoints: prev.targetPoints,
        mandatoryCapture: prev.mandatoryCapture
      };
      return makeHandState(base, prev.handNumber + 1, nextDealer, prev.scores);
    });
  }, []);
  const toggleTableCard = (0, import_react2.useCallback)((cardId) => {
    setS((prev) => {
      if (prev.phase !== "playing" || prev.turnId !== "human" || prev.auto || hasPendingCaptureFx(prev)) {
        return prev;
      }
      return {
        ...prev,
        selectedTableIds: prev.selectedTableIds.includes(cardId) ? prev.selectedTableIds.filter((id) => id !== cardId) : [...prev.selectedTableIds, cardId]
      };
    });
  }, []);
  const clearSelection = (0, import_react2.useCallback)(() => {
    setS(
      (prev) => prev.phase === "playing" && prev.turnId === "human" && !prev.auto && !hasPendingCaptureFx(prev) ? { ...prev, selectedTableIds: [], message: t.selectTable } : prev
    );
  }, [t]);
  const playHumanCard = (0, import_react2.useCallback)((index) => {
    setS((prev) => applyHumanCard(prev, index));
  }, []);
  (0, import_react2.useEffect)(() => {
    if (!s.auto)
      return void 0;
    const tm = setTimeout(() => {
      setS((prev) => {
        if (!prev.auto)
          return prev;
        return runAutoStep(prev);
      });
    }, s.auto.ms || 0);
    return () => clearTimeout(tm);
  }, [s.auto]);
  (0, import_react2.useEffect)(() => {
    if (!s.captureFx?.id)
      return void 0;
    const activeFxId = s.captureFx.id;
    const tm = setTimeout(() => {
      setS((prev) => {
        if (!prev.captureFx || prev.captureFx.id !== activeFxId)
          return prev;
        return { ...prev, captureFx: null };
      });
    }, CAPTURE_FX_MS);
    return () => clearTimeout(tm);
  }, [s.captureFx]);
  (0, import_react2.useEffect)(() => {
    if (s.captureFx || !s.captureFxQueue?.length)
      return void 0;
    const tm = setTimeout(() => {
      setS((prev) => {
        if (prev.captureFx || !prev.captureFxQueue?.length)
          return prev;
        const [nextFx, ...restQueue] = prev.captureFxQueue;
        return {
          ...prev,
          captureFx: nextFx,
          captureFxQueue: restQueue
        };
      });
    }, CAPTURE_FX_GAP_MS);
    return () => clearTimeout(tm);
  }, [s.captureFx, s.captureFxQueue]);
  (0, import_react2.useEffect)(() => {
    if (s.phase !== "playing" || s.auto || hasPendingCaptureFx(s))
      return void 0;
    if (!s.byId[s.turnId]?.ai)
      return void 0;
    setS((prev) => {
      if (prev.phase !== "playing" || prev.auto || hasPendingCaptureFx(prev))
        return prev;
      return withAutoTurn(prev);
    });
    return void 0;
  }, [s.phase, s.turnId, s.auto, s.captureFx, s.captureFxQueue, s.byId]);
  (0, import_react2.useEffect)(() => {
    if (!s.dealFx?.id)
      return void 0;
    const activeDealFxId = s.dealFx.id;
    const clearMs = DEAL_TO_HAND_FX_CARD_MS + Math.max(0, (s.dealFx.count || 1) - 1) * DEAL_TO_HAND_FX_STAGGER_MS;
    const tm = setTimeout(() => {
      setS((prev) => {
        if (!prev.dealFx || prev.dealFx.id !== activeDealFxId)
          return prev;
        return { ...prev, dealFx: null };
      });
    }, clearMs);
    return () => clearTimeout(tm);
  }, [s.dealFx]);
  (0, import_react2.useEffect)(() => {
    const onKey = (e) => {
      const tag = String(e.target?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag))
        return;
      const k = String(e.key || "").toLowerCase();
      if (k === "r") {
        e.preventDefault();
        restart();
        return;
      }
      if (k === "n") {
        e.preventDefault();
        nextHand();
        return;
      }
      if (s.phase === "playing" && s.turnId === "human" && !s.auto && !hasPendingCaptureFx(s)) {
        if (["1", "2", "3"].includes(k)) {
          e.preventDefault();
          playHumanCard(Number(k) - 1);
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playHumanCard(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.phase, s.turnId, s.auto, s.captureFx, s.captureFxQueue, restart, nextHand, playHumanCard]);
  const bridgePayload = (0, import_react2.useCallback)(
    (snap) => {
      const owners = ownerIdsFrom(snap.players, snap.teamMode);
      return {
        mode: "strategy-escoba-15",
        deck: snap.deckId,
        deckName: snap.deckName,
        phase: snap.phase,
        hand: snap.handNumber,
        dealer: snap.order[snap.dealerIndex] || null,
        mano: snap.manoId,
        turn: snap.turnId,
        playerCount: snap.playerCount,
        teamMode: snap.teamMode,
        targetPoints: snap.targetPoints,
        mandatoryCapture: snap.mandatoryCapture,
        difficulty: snap.difficultyId,
        coordinates: "Seat coordinates are percentages on table felt (origin top-left, +x right, +y down).",
        stockCount: snap.stock.length,
        table: snap.tableCards.map((card) => ({
          id: card.id,
          card: cardText(card),
          value: card.captureValue,
          suit: card.suitId
        })),
        selectedTable: [...snap.selectedTableIds],
        hands: {
          human: (snap.hands.human || []).map((card) => ({
            id: card.id,
            card: cardText(card),
            value: card.captureValue
          })),
          counts: Object.fromEntries(
            snap.order.map((id) => [id, (snap.hands[id] || []).length])
          )
        },
        captures: {
          counts: Object.fromEntries(
            snap.order.map((id) => [id, (snap.captures[id] || []).length])
          ),
          escobas: { ...snap.escobas }
        },
        owners: owners.map((owner) => ({
          id: owner,
          score: snap.scores[owner] || 0
        })),
        lastCapturerId: snap.lastCapturerId || null,
        auto: snap.auto ? {
          type: snap.auto.type,
          ms: snap.auto.ms || 0
        } : null,
        lastMove: snap.lastMove ? {
          actorId: snap.lastMove.actorId,
          actorName: snap.lastMove.actorName,
          card: snap.lastMove.card,
          cardId: snap.lastMove.cardId || null,
          captured: snap.lastMove.captured || [],
          madeEscoba: Boolean(snap.lastMove.madeEscoba),
          tableCountAfter: snap.lastMove.tableCountAfter,
          handCountAfter: snap.lastMove.handCountAfter
        } : null,
        captureFx: snap.captureFx ? {
          actorId: snap.captureFx.actorId,
          text: snap.captureFx.text,
          cards: (snap.captureFx.cards || []).map((card) => cardText(card))
        } : null,
        captureFxQueued: snap.captureFxQueue?.length || 0,
        dealFx: snap.dealFx ? {
          count: snap.dealFx.count || 0
        } : null,
        revealedCards: { ...snap.revealedCards || {} },
        lastHand: snap.lastHand ? {
          pointsByOwner: snap.lastHand.pointsByOwner,
          breakdown: snap.lastHand.breakdown,
          scoresAfter: snap.lastHand.scoresAfter,
          winnerOwners: snap.lastHand.winnerOwners || [],
          winnerLabel: snap.lastHand.winnerLabel || null
        } : null,
        actions: {
          canPlayHuman: snap.phase === "playing" && snap.turnId === "human" && !snap.auto && !hasPendingCaptureFx(snap),
          canNextHand: snap.phase === "hand-over",
          canRestart: true,
          canToggleTable: snap.phase === "playing" && snap.turnId === "human" && !snap.auto && !hasPendingCaptureFx(snap)
        },
        message: snap.message
      };
    },
    []
  );
  const advanceTime = (0, import_react2.useCallback)((ms) => {
    setS((prev) => {
      if (!prev.auto)
        return prev;
      if ((ms || 0) >= (prev.auto.ms || 0)) {
        return runAutoStep(prev);
      }
      return {
        ...prev,
        auto: { ...prev.auto, ms: (prev.auto.ms || 0) - (ms || 0) }
      };
    });
  }, []);
  useGameRuntimeBridge(s, bridgePayload, advanceTime);
  const phaseText = s.phase === "playing" ? t.phasePlaying : s.phase === "hand-over" ? t.phaseHandOver : t.phaseMatchOver;
  const deckMeta = DECKS[normDeckId(s.deckId)];
  const subtitleText = s.deckId === "spanish" ? t.subtitleSpanish : t.subtitleEnglishAdapted;
  const rulesText = s.deckId === "spanish" ? t.rulesSpanish : t.rulesEnglishAdapted;
  const isHumanTurn = s.phase === "playing" && s.turnId === "human" && !s.auto && !hasPendingCaptureFx(s);
  const isHumanCurrentTurn = s.phase === "playing" && s.turnId === "human";
  const scoreOwners = ownerIdsFrom(s.players, s.teamMode);
  const dealerId = s.order[s.dealerIndex];
  const selectedSet = new Set(s.selectedTableIds);
  const mapLine = deckMeta.suits.map(
    (suit) => `${suit.symbol} ${suit.map[locale] || suit.map.en}`
  ).join(" | ");
  const handGainRows = scoreOwners.map((owner) => ({
    owner,
    score: s.scores[owner] || 0,
    gain: s.lastHand?.pointsByOwner?.[owner] || 0
  }));
  const roundWinnerOwners = s.lastHand?.winnerOwners || [];
  const roundWinnerLabel = s.lastHand?.winnerLabel || null;
  const humanWonRound = roundWinnerOwners.includes(ownerOfPlayer(s, "human"));
  const autoStatusText = s.auto?.type === "ai-turn" ? t.aiThinking : s.auto?.type === "turn-settle" ? t.settlePause : null;
  const lastPlayedCardOnTableId = s.lastMove && !s.lastMove.captured?.length ? s.lastMove.cardId : null;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mini-game strategy-brisca-game brisca-arena strategy-escoba-game" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "mini-head" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h4", null, t.title), /* @__PURE__ */ import_react2.default.createElement("p", null, subtitleText)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-actions-head" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: restart }, t.newMatch), s.phase === "hand-over" ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: nextHand }, t.nextHand) : null)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-config escoba-config" }, /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "escoba-players" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.players), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "escoba-players",
      value: pPlayers,
      onChange: (e) => {
        const count = normPlayers(e.target.value);
        setPPlayers(count);
        if (count !== 4)
          setPTeamMode(false);
      }
    },
    PLAYER_OPTIONS.map((n) => /* @__PURE__ */ import_react2.default.createElement("option", { key: n, value: n }, n))
  )), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "escoba-diff" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.diff), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "escoba-diff",
      value: pDiff,
      onChange: (e) => setPDiff(normDiff(e.target.value))
    },
    Object.values(DIFF).map((diff) => /* @__PURE__ */ import_react2.default.createElement("option", { key: diff.id, value: diff.id }, diff.label[locale] || diff.label.en))
  )), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "escoba-target" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.target), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "escoba-target",
      value: pTarget,
      onChange: (e) => setPTarget(normTarget(e.target.value))
    },
    TARGET_OPTIONS.map((target) => /* @__PURE__ */ import_react2.default.createElement("option", { key: target, value: target }, target))
  )), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "escoba-mandatory" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.mandatory), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "escoba-mandatory",
      value: pMandatory ? "yes" : "no",
      onChange: (e) => setPMandatory(e.target.value === "yes")
    },
    /* @__PURE__ */ import_react2.default.createElement("option", { value: "yes" }, t.mandatoryOn),
    /* @__PURE__ */ import_react2.default.createElement("option", { value: "no" }, t.mandatoryOff)
  )), /* @__PURE__ */ import_react2.default.createElement("label", { htmlFor: "escoba-team-mode" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t.teams), /* @__PURE__ */ import_react2.default.createElement(
    "select",
    {
      id: "escoba-team-mode",
      value: pTeamMode ? "pairs" : "solo",
      onChange: (e) => setPTeamMode(e.target.value === "pairs"),
      disabled: pPlayers !== 4
    },
    /* @__PURE__ */ import_react2.default.createElement("option", { value: "solo" }, t.teamsIndividual),
    /* @__PURE__ */ import_react2.default.createElement("option", { value: "pairs" }, t.teamsPairs)
  )), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "brisca-apply", onClick: apply }, t.apply)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "status-row brisca-status-row escoba-status-row" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: `status-pill ${s.phase === "match-over" ? "finished" : "playing"}` }, phaseText), /* @__PURE__ */ import_react2.default.createElement("span", null, t.hand, ": ", s.handNumber), /* @__PURE__ */ import_react2.default.createElement("span", null, t.dealer, ": ", s.byId[dealerId]?.name || dealerId), /* @__PURE__ */ import_react2.default.createElement("span", null, t.turn, ": ", s.byId[s.turnId]?.name || s.turnId), autoStatusText ? /* @__PURE__ */ import_react2.default.createElement("span", null, autoStatusText) : null, /* @__PURE__ */ import_react2.default.createElement("span", null, t.stock, ": ", s.stock.length), /* @__PURE__ */ import_react2.default.createElement("span", null, t.table, ": ", s.tableCards.length), /* @__PURE__ */ import_react2.default.createElement("span", null, t.target, ": ", s.targetPoints), /* @__PURE__ */ import_react2.default.createElement("span", null, t.deck, ": ", s.deckName), roundWinnerLabel ? /* @__PURE__ */ import_react2.default.createElement("span", null, roundWinnerOwners.length > 1 ? t.roundTie : t.roundWinner, ": ", roundWinnerLabel) : null), /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-table-shell" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: `brisca-table-felt ai-count-${Math.max(1, s.players.length - 1)}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-seat-ring" }, s.players.filter((player) => !player.human).map((player) => {
    const wonRound = roundWinnerOwners.includes(ownerOfPlayer(s, player.id));
    const isCurrentTurn = s.phase === "playing" && s.turnId === player.id;
    const hasCaptureFx = s.captureFx?.actorId === player.id;
    return /* @__PURE__ */ import_react2.default.createElement(
      "article",
      {
        key: player.id,
        className: [
          "brisca-seat",
          "seat-ai",
          player.side === "user" ? "seat-friendly" : "seat-rival",
          `seat-slot-${player.seat.slot}`,
          isCurrentTurn ? "seat-active seat-active-turn" : "",
          hasCaptureFx ? "capture-fx-seat" : "",
          wonRound ? "seat-won-trick" : ""
        ].join(" "),
        style: {
          "--seat-x": `${player.seat.x}%`,
          "--seat-y": `${player.seat.y}%`
        }
      },
      /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("h5", null, player.name), /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-tag" }, s.teamMode ? teamLabel(player.side, t) : t.ai)),
      /* @__PURE__ */ import_react2.default.createElement("p", { className: "seat-side" }, t.captures, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, (s.captures[player.id] || []).length)),
      /* @__PURE__ */ import_react2.default.createElement("p", { className: "seat-kpi" }, t.escobas, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, s.escobas[player.id] || 0)),
      isCurrentTurn ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led current-turn-led", "aria-label": `${player.name}: ${t.turnLed}` }, t.turnLed) : null,
      wonRound ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led", "aria-label": `${player.name}: ${t.wonRoundLed}` }, t.wonRoundLed) : null,
      /* @__PURE__ */ import_react2.default.createElement(
        "div",
        {
          className: "seat-hidden-hand",
          "aria-label": `${(s.hands[player.id] || []).length} ${t.hidden}`
        },
        (s.hands[player.id] || []).map((card) => /* @__PURE__ */ import_react2.default.createElement(Card, { key: card.id, deckId: s.deckId, hidden: true, compact: true }))
      )
    );
  })), s.captureFx ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-capture-fx", role: "status", "aria-live": "polite" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-capture-fx-head" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "escoba-led-dot", "aria-hidden": "true" }), /* @__PURE__ */ import_react2.default.createElement("strong", null, s.captureFx.text)), s.captureFx.cards?.length ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-capture-fx-cards", "aria-hidden": "true" }, s.captureFx.cards.map((fxCard, index) => /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, { key: `${s.captureFx.id}-${fxCard.id}-${index}` }, index > 0 ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "fx-plus" }, "+") : null, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      className: "escoba-capture-fx-card-wrap",
      style: { "--fx-index": index }
    },
    /* @__PURE__ */ import_react2.default.createElement(Card, { deckId: s.deckId, card: fxCard, compact: true, led: true })
  ))), /* @__PURE__ */ import_react2.default.createElement("span", { className: "fx-equals" }, "= 15")) : null) : null, s.dealFx ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-deal-fx", "aria-hidden": "true" }, Array.from({ length: s.dealFx.count || 0 }).map((_, index) => {
    const spread = (index - ((s.dealFx.count || 1) - 1) / 2) * 22;
    return /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        key: `escoba-deal-fx-${s.dealFx.id}-${index}`,
        className: "escoba-deal-fx-card",
        style: {
          "--deal-index": index,
          "--deal-spread": `${spread}px`
        }
      },
      /* @__PURE__ */ import_react2.default.createElement(Card, { deckId: s.deckId, hidden: true, compact: true })
    );
  })) : null, /* @__PURE__ */ import_react2.default.createElement("section", { className: "brisca-center-zone escoba-center-zone" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-board-score" }, /* @__PURE__ */ import_react2.default.createElement("h6", null, t.scores), scoreOwners.map((owner) => /* @__PURE__ */ import_react2.default.createElement("p", { key: owner }, ownerLabel(s, owner, t), ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, s.scores[owner] || 0)))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "escoba-map-line" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, t.suitMap, ":"), " ", mapLine), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mus-center-deck", "aria-label": `${s.stock.length} ${t.hidden}` }, /* @__PURE__ */ import_react2.default.createElement(Card, { deckId: s.deckId, hidden: true, compact: true }), /* @__PURE__ */ import_react2.default.createElement("span", null, s.stock.length)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-table-cards", "aria-label": t.table }, s.tableCards.length ? s.tableCards.map((card) => /* @__PURE__ */ import_react2.default.createElement(
    Card,
    {
      key: card.id,
      deckId: s.deckId,
      card,
      compact: true,
      led: lastPlayedCardOnTableId === card.id,
      selected: selectedSet.has(card.id),
      onClick: isHumanTurn ? () => toggleTableCard(card.id) : void 0
    }
  )) : /* @__PURE__ */ import_react2.default.createElement("p", { className: "escoba-table-empty" }, "--")), isHumanTurn ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-human-actions" }, /* @__PURE__ */ import_react2.default.createElement("p", null, t.selectTable), /* @__PURE__ */ import_react2.default.createElement("p", null, t.selected, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, s.selectedTableIds.length)), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: clearSelection }, t.clearSel)) : null), /* @__PURE__ */ import_react2.default.createElement(
    "section",
    {
      className: [
        "brisca-human-zone",
        "escoba-human-zone",
        isHumanCurrentTurn ? "seat-active seat-active-turn human-active-turn" : "",
        s.captureFx?.actorId === "human" ? "capture-fx-seat" : "",
        humanWonRound ? "human-won-trick" : ""
      ].join(" ")
    },
    /* @__PURE__ */ import_react2.default.createElement("header", null, /* @__PURE__ */ import_react2.default.createElement("h5", null, t.yourHand), /* @__PURE__ */ import_react2.default.createElement("span", null, t.captures, ": ", (s.captures.human || []).length, " | ", t.escobas, ": ", s.escobas.human || 0)),
    isHumanCurrentTurn ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led human-turn-led current-turn-led", "aria-label": t.turnLed }, t.turnLed) : null,
    humanWonRound ? /* @__PURE__ */ import_react2.default.createElement("span", { className: "seat-turn-led human-turn-led", "aria-label": t.wonRoundLed }, t.wonRoundLed) : null,
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-player-hand escoba-player-hand" }, (s.hands.human || []).map((card, index) => /* @__PURE__ */ import_react2.default.createElement(
      Card,
      {
        key: card.id,
        deckId: s.deckId,
        card,
        onClick: isHumanTurn ? () => playHumanCard(index) : void 0,
        disabled: !isHumanTurn
      }
    )))
  ), s.phase === "hand-over" && s.lastHand ? /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      className: "brisca-match-modal-wrap escoba-hand-modal-wrap",
      role: "dialog",
      "aria-live": "polite",
      "aria-label": t.summary
    },
    /* @__PURE__ */ import_react2.default.createElement("article", { className: "brisca-match-modal escoba-hand-modal" }, /* @__PURE__ */ import_react2.default.createElement("h5", null, t.summary), /* @__PURE__ */ import_react2.default.createElement("p", null, t.handOver), /* @__PURE__ */ import_react2.default.createElement("p", null, roundWinnerOwners.length > 1 ? t.roundTie : t.roundWinner, ":", " ", /* @__PURE__ */ import_react2.default.createElement("strong", null, roundWinnerLabel || t.none)), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "escoba-score-lines" }, handGainRows.map((row) => /* @__PURE__ */ import_react2.default.createElement("li", { key: row.owner }, ownerLabel(s, row.owner, t), ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, "+", row.gain), " (", row.score, ")"))), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "escoba-breakdown-lines" }, s.lastHand.breakdown.length ? s.lastHand.breakdown.map((line, idx) => /* @__PURE__ */ import_react2.default.createElement("li", { key: `${line.key}-${line.owner}-${idx}` }, line.label, ": ", ownerLabel(s, line.owner, t), " +", line.points, line.detail ? ` (${line.detail})` : "")) : /* @__PURE__ */ import_react2.default.createElement("li", null, t.none)), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: nextHand }, t.nextHand))
  ) : null, s.phase === "match-over" ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "brisca-match-modal-wrap", role: "dialog", "aria-live": "polite" }, /* @__PURE__ */ import_react2.default.createElement("article", { className: "brisca-match-modal" }, /* @__PURE__ */ import_react2.default.createElement("h5", null, t.matchEnd), /* @__PURE__ */ import_react2.default.createElement("p", null, t.winner, ": ", /* @__PURE__ */ import_react2.default.createElement("strong", null, s.matchWinner ? ownerLabel(s, s.matchWinner, t) : t.none)), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", onClick: restart }, t.newMatch))) : null)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "escoba-layout-notes" }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "escoba-mandatory-note" }, s.mandatoryCapture ? t.mandatoryHintOn : t.mandatoryHintOff), /* @__PURE__ */ import_react2.default.createElement("p", { className: "brisca-help escoba-help" }, t.controls)), /* @__PURE__ */ import_react2.default.createElement("details", { className: "brisca-rules" }, /* @__PURE__ */ import_react2.default.createElement("summary", null, t.rulesTitle), /* @__PURE__ */ import_react2.default.createElement("pre", null, rulesText)));
}
var StrategyEscobaDeckGame_default = StrategyEscobaDeckGame;
export {
  StrategyEscobaDeckGame_default as default
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
