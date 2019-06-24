"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createState = createState;
exports.createAction = createAction;
exports.useStates = useStates;
exports.withAsyncStates = withAsyncStates;
exports.mock = mock;
exports.updateStates = updateStates;
exports.exportStates = exportStates;
exports.persist = persist;
exports.compose = compose;
exports.hoc = hoc;
exports.memoize = memoize;
exports.AsyncRender = AsyncRender;

var _react = require("react");

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

var defaultDebounce = 300;
var scopeUpdates = [];
var scopes = 0;
var setUniqueId = 1;
/**
 * createState(defaultValue:any)
 * createState(dependencies:IState[], functor:Function, options:any)
 * @param args
 * @return {{async: boolean, computed: boolean, subscribers: Set<any>, value: *, done: boolean}|{async: boolean, computed: boolean, subscribers: Set<any>, value: undefined, done: boolean}}
 */

function createState() {
  var subscribers = {};

  function unsubscribe(subscriber) {
    removeFromSet(subscribers, subscriber);
    return this;
  }

  function subscribe(subscriber) {
    addToSet(subscribers, subscriber);
    return this;
  } // create simple state


  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 1) {
    var simpleState = Object.assign(function (callback) {
      var newValue; // is normal object

      if (typeof callback !== "function") {
        newValue = // is synthetic event object
        callback && callback.target ? typeof callback.target.checked !== "undefined" ? callback.target.checked // checkbox
        : callback.target.value // other inputs
        : callback;
      } else {
        newValue = callback(simpleState.value);
      }

      if (newValue && newValue.then) {
        throw new Error("Do not use this method for async updating");
      }

      if (newValue !== simpleState.value) {
        simpleState.value = newValue;
        notify(subscribers);
      }
    }, {
      value: args[0],
      done: true,
      subscribers: subscribers,
      async: false,
      computed: false,
      subscribe: subscribe,
      unsubscribe: unsubscribe
    });
    return simpleState;
  } // create computed state


  var dependencies = args[0],
      loader = args[1],
      _args$ = args[2];
  _args$ = _args$ === void 0 ? {} : _args$;
  var sync = _args$.sync,
      _args$$defaultValue = _args$.defaultValue,
      defaultValue = _args$$defaultValue === void 0 ? undefined : _args$$defaultValue,
      _args$$debounce = _args$.debounce,
      debounce = _args$$debounce === void 0 ? defaultDebounce : _args$$debounce;
  var keys = [];
  var timerId;
  var allDone = dependencies.every(function (dependency) {
    dependency.subscribe(sync ? callLoaderSync : debouncedCallLoader);
    return dependency.done;
  });
  var computedState = {
    dependencies: dependencies,
    value: defaultValue,
    done: false,
    async: !sync,
    computed: true,
    subscribers: subscribers,
    subscribe: subscribe,
    unsubscribe: unsubscribe
  };
  var currentLock;

  function debouncedCallLoader() {
    if (debounce) {
      clearTimeout(timerId);
      currentLock = computedState.lock = {};
      timerId = setTimeout(callLoaderAsync, debounce);
    } else {
      callLoaderAsync();
    }
  }

  function shouldUpdate(callback) {
    var newKeys = dependencies.map(function (dependency) {
      return dependency.value;
    });

    if (keys.length !== newKeys.length || keys.some(function (oldKey, index) {
      return oldKey !== newKeys[index];
    })) {
      keys = newKeys;
      callback();
    }
  }

  function callLoaderSync() {
    shouldUpdate(function () {
      computedState.done = false;
      var prevValue = computedState.value;
      computedState.value = loader.apply(void 0, _toConsumableArray(keys));
      computedState.done = true;

      if (computedState.value !== prevValue) {
        notify(subscribers);
      }
    });
  }

  function callLoaderAsync() {
    clearTimeout(timerId);
    if (currentLock !== computedState.lock) return;
    shouldUpdate(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var shouldNotity, originalValue, value;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              shouldNotity = computedState.done !== false || computedState.error;
              computedState.done = false;
              computedState.error = undefined;
              originalValue = computedState.value;

              if (shouldNotity) {
                notify(subscribers);
              }

              _context.prev = 5;
              _context.next = 8;
              return loader.apply(void 0, _toConsumableArray(keys));

            case 8:
              value = _context.sent;

              if (!(currentLock !== computedState.lock)) {
                _context.next = 11;
                break;
              }

              return _context.abrupt("return");

            case 11:
              computedState.value = value;
              computedState.done = true;
              _context.next = 21;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](5);

              if (!(currentLock !== computedState.lock)) {
                _context.next = 19;
                break;
              }

              return _context.abrupt("return");

            case 19:
              computedState.error = _context.t0;
              computedState.done = true;

            case 21:
              // dispatch change
              if (computedState.value !== originalValue) {
                notify(subscribers);
              }

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 15]]);
    })));
  }

  if (allDone) {
    if (computedState.async) {
      callLoaderAsync();
    } else {
      callLoaderSync();
    }
  }

  return computedState;
}
/**
 * create an action which depend on specified states
 * @param {IState[]}  states
 * @param {Function}  functor
 * @return {(Function & {getStates(): *, setStates(*): void})|*}
 */


function createAction(states, functor) {
  var accessors = createAccessors(states);

  function createAccessors(states) {
    return states.map(function (state) {
      var originalValue = state.value;
      return Object.assign(function (value) {
        if (arguments.length) {
          if (state.computed) {
            throw new Error("Cannot update computed state");
          }

          return state.value = value;
        }

        return state.value;
      }, {
        state: state,
        hasChange: function hasChange() {
          return originalValue !== state.value;
        },
        resetOriginalValue: function resetOriginalValue() {
          originalValue = state.value;
        }
      });
    });
  }

  function performUpdate() {
    var subscribers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var batchUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false; // collect all subscribers

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = accessors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var accessor = _step.value;

        if (accessor.hasChange()) {
          Object.assign(subscribers, accessor.state.subscribers);
          accessor.resetOriginalValue();
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (!batchUpdate) {
      notify(subscribers);
    }
  }

  return Object.assign(function () {
    try {
      scopes++;
      scopeUpdates.push(performUpdate);

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var result = functor.apply(void 0, _toConsumableArray(accessors).concat(args)); // perform update once async method done

      if (result && result.then) {
        result.then(performUpdate, performUpdate);
      }

      return result;
    } finally {
      scopes--;

      if (!scopes) {
        // collect all subscribers need to be notified
        var subscribers = {};
        scopeUpdates.splice(0, scopeUpdates.length).forEach(function (update) {
          return update(subscribers, true);
        });
        notify(subscribers);
      }
    }
  }, {
    getStates: function getStates() {
      return states;
    },
    setStates: function setStates(newStates) {
      accessors = createAccessors(states = newStates);
    }
  });
}

function getStateValues(states) {
  return states.map(function (state) {
    return state.async ? state : state.value;
  });
}

function useStates() {
  var _useState = (0, _react.useState)(),
      _useState2 = _slicedToArray(_useState, 2),
      forceRerender = _useState2[1];

  var unmountRef = (0, _react.useRef)(false);

  for (var _len3 = arguments.length, states = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    states[_key3] = arguments[_key3];
  }

  var statesRef = (0, _react.useRef)(states);
  var values = getStateValues(states); // get unmount status

  (0, _react.useEffect)(function () {
    return function () {
      unmountRef.current = true;
    };
  }, []);
  (0, _react.useEffect)(function () {
    // do not rerender if component is unmount
    var handleChange = function handleChange() {
      return !unmountRef.current && forceRerender({});
    };

    var localStates = statesRef.current;
    localStates.forEach(function (state) {
      state.subscribe(handleChange);
    });
    return function () {
      localStates.forEach(function (state) {
        return state.unsubscribe(handleChange);
      });
    };
  }, [forceRerender]);
  return values;
}
/**
 *
 * @param stateMap
 * @param fallbackOrOptions
 * @return {function(*=): Function}
 */


function withAsyncStates(stateMap, fallbackOrOptions) {
  if (typeof fallbackOrOptions === "function" || typeof fallbackOrOptions === "boolean" || // support styled component
  fallbackOrOptions && fallbackOrOptions.styledComponentId) {
    fallbackOrOptions = {
      fallback: fallbackOrOptions
    };
  }

  var _fallbackOrOptions = fallbackOrOptions,
      fallback = _fallbackOrOptions.fallback;
  var entries = Object.entries(stateMap || {});
  var states = entries.map(function (x) {
    return x[1];
  });

  if (states.some(function (state) {
    return !state.async;
  })) {
    throw new Error("Expect async state but got sync state");
  }

  return function (comp) {
    var memoizedComp = (0, _react.memo)(comp);
    return function (props) {
      var results = useStates.apply(void 0, _toConsumableArray(states));
      var newProps = {};
      var allDone = true;
      results.forEach(function (result, index) {
        var prop = entries[index][0];
        newProps[prop] = states[index];

        if (!result.done || result.error) {
          allDone = false;
        } else {
          newProps[prop + "Done"] = true;
        }
      });

      if (!allDone && fallback !== false) {
        return fallback ? (0, _react.createElement)(fallback, props) : null;
      }

      Object.assign(newProps, props);
      return (0, _react.createElement)(memoizedComp, newProps);
    };
  };
}
/**
 * use this method for testing only
 * sample:
 * mock([
 *  [Action1, [State1, State2]],
 *  [Action2, [false, State2]] // we leave first state, no overwrite
 * ],async () => {
 *  do something, functor can be async function
 * )
 * @param actionMockings
 * @param functor
 */


function mock(actionMockings, functor) {
  var originalStates = new WeakMap();
  var done = false;
  actionMockings.forEach(function (mocking) {
    var states = mocking[0].getStates();
    originalStates.set(mocking[0], // using original state if input state is falsy
    mocking[1].map(function (state, index) {
      return state || states[index];
    }));
  });

  function unmock() {
    actionMockings.forEach(function (mocking) {
      return mocking[0].setStates(originalStates.get(mocking[0]));
    });
  }

  try {
    var result = functor();

    if (result && result.then) {
      result.then(unmock, unmock);
    } else {
      done = true;
    }

    return result;
  } finally {
    if (done) {
      unmock();
    }
  }
}
/**
 * update multiple states from specific data
 * @param stateMap
 * @param data
 */


function updateStates(stateMap) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  Object.keys(stateMap).forEach(function (key) {
    // do not overwrite state value if the key is not present in data
    if (!(key in data)) return;
    var state = stateMap[key];

    if (state.computed) {
      throw new Error("Cannot update computed state");
    }

    state(data[key]);
  });
}
/**
 * export multiple states to json object
 * @param stateMap
 */


function exportStates(stateMap) {
  var values = {};
  Object.keys(stateMap).forEach(function (key) {
    values[key] = stateMap[key].value;
  });
  return values;
}
/**
 * perfom loading/saving multiple states automatically
 * @param states
 * @param data
 * @param onChange
 * @param debounce
 */


function persist(states, data, onChange) {
  var debounce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultDebounce;
  updateStates(states, data);
  var timerId;

  function debouncedHandleChange() {
    if (debounce) {
      clearTimeout(timerId);
      timerId = setTimeout(handleChange, debounce);
    } else {
      handleChange();
    }
  }

  function handleChange() {
    clearTimeout(timerId);
    var values = exportStates(states);
    onChange && onChange(values);
  }

  Object.values(states).forEach(function (state) {
    return state.subscribe(debouncedHandleChange);
  });
}

function compose() {
  for (var _len4 = arguments.length, functions = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    functions[_key4] = arguments[_key4];
  }

  if (functions.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

function hoc() {
  for (var _len5 = arguments.length, callbacks = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    callbacks[_key5] = arguments[_key5];
  }

  return callbacks.reduce(function (nextHoc, callback) {
    return function (Component) {
      var MemoComponent = (0, _react.memo)(Component);
      return function (props) {
        // callback requires props and Comp, it must return React element
        if (callback.length > 1) {
          return callback(props, MemoComponent);
        }

        var newProps = callback(props);
        if (newProps === false) return null;

        if (!newProps) {
          newProps = props;
        }

        return (0, _react.createElement)(MemoComponent, newProps);
      };
    };
  }, function (Component) {
    return Component;
  });
}

function memoize(f) {
  var lastResult;
  var lastArgs;
  return function () {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    } // call f on first time or args changed


    if (!lastArgs || lastArgs.some(function (value, index) {
      return value !== args[index];
    })) {
      lastArgs = args;
      lastResult = f.apply(void 0, _toConsumableArray(lastArgs));
    }

    return lastResult;
  };
}

function AsyncRender(_ref2) {
  var render = _ref2.render,
      error = _ref2.error,
      children = _ref2.children,
      state = _ref2.state,
      states = _ref2.states,
      _ref2$prop = _ref2.prop,
      prop = _ref2$prop === void 0 ? "data" : _ref2$prop,
      props = _objectWithoutProperties(_ref2, ["render", "error", "children", "state", "states", "prop"]);

  var results = useStates.apply(void 0, _toConsumableArray(states || [state]));
  var allDone = results.every(function (result) {
    return result.done;
  });

  if (!allDone) {
    return children;
  }

  var errorObject = state ? state.error : states.filter(function (x) {
    return x.error;
  }).map(function (x) {
    return x.error;
  })[0];

  if (errorObject) {
    if (error) {
      return (0, _react.createElement)(error, errorObject);
    }

    return children;
  }

  var data = state ? results[0].value : results.map(function (result) {
    return result.value;
  });

  if (render) {
    return (0, _react.createElement)(render, prop ? _objectSpread(_defineProperty({}, prop, data), props) : _objectSpread({}, data, props));
  }

  return data;
}

function addToSet(set, functor) {
  if (!functor.__id__) {
    functor.__id__ = setUniqueId++;
  }

  if (functor.__id__ in set) {
    return;
  }

  set[functor.__id__] = functor;
}

function removeFromSet(set, functor) {
  if (functor.__id__) {
    delete set[functor.__id__];
  }
}

function notify(subscribers) {
  for (var _i2 = 0, _Object$values = Object.values(subscribers); _i2 < _Object$values.length; _i2++) {
    var subscriber = _Object$values[_i2];
    subscriber();
  }
}
//# sourceMappingURL=index.js.map