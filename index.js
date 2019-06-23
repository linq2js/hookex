"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var react_1 = require("react");
var scopes = 0;
function createState() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length === 1) {
        return {
            value: args[0],
            done: true,
            subscribers: new Set(),
            async: false
        };
    }
    var _a = __read(args, 3), dependencies = _a[0], loader = _a[1], _b = _a[2], _c = _b === void 0 ? {} : _b, _d = _c.defaultValue, defaultValue = _d === void 0 ? undefined : _d, _e = _c.debounce, debounce = _e === void 0 ? 300 : _e;
    var subscribers = new Set();
    var keys = [];
    var timerId;
    var allDone = dependencies.every(function (dependency) {
        dependency.subscribers.add(debouncedCallLoader);
        return dependency.done;
    });
    var state = {
        value: defaultValue,
        done: false,
        async: true,
        subscribers: subscribers
    };
    var currentLock;
    function debouncedCallLoader() {
        if (debounce) {
            console.log(1);
            clearTimeout(timerId);
            currentLock = state.lock = {};
            timerId = setTimeout(callLoader, debounce);
        }
        else {
            callLoader();
        }
    }
    function notity() {
        var e_1, _a;
        try {
            for (var _b = __values(state.subscribers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var subscriber = _c.value;
                subscriber();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    function callLoader() {
        return __awaiter(this, void 0, void 0, function () {
            var newKeys, shouldNotity, originalValue, value, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearTimeout(timerId);
                        if (currentLock !== state.lock)
                            return [2 /*return*/];
                        newKeys = dependencies.map(function (dependency) {
                            return dependency.value;
                        });
                        if (!(keys.length !== newKeys.length ||
                            keys.some(function (oldKey, index) { return oldKey !== newKeys[index]; }))) return [3 /*break*/, 5];
                        keys = newKeys;
                        shouldNotity = state.done !== false || state.error;
                        state.done = false;
                        state.error = undefined;
                        originalValue = state.value;
                        if (shouldNotity) {
                            notity();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, loader.apply(void 0, __spread(keys))];
                    case 2:
                        value = _a.sent();
                        if (currentLock !== state.lock)
                            return [2 /*return*/];
                        state.value = value;
                        state.done = true;
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        if (currentLock !== state.lock)
                            return [2 /*return*/];
                        state.error = e_2;
                        state.done = true;
                        return [3 /*break*/, 4];
                    case 4:
                        // dispatch change
                        if (state.value !== originalValue) {
                            notity();
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    if (allDone) {
        state.done = true;
        callLoader();
    }
    return state;
}
exports.createState = createState;
function createAction(states, functor) {
    var accessors = createAccessors(states);
    function createAccessors(states) {
        return states.map(function (state) {
            var originalValue = state.value;
            return Object.assign(function (value) {
                if (arguments.length) {
                    if (state.async) {
                        throw new Error("Cannot update async state");
                    }
                    state.value = value;
                    return;
                }
                return state.value;
            }, {
                state: state,
                hasChange: function () {
                    return originalValue !== state.value;
                },
                resetOriginalValue: function () {
                    originalValue = state.value;
                }
            });
        });
    }
    function performUpdate() {
        var e_3, _a, e_4, _b, e_5, _c;
        var subscribers = new Set();
        try {
            // collect all subscribers
            for (var accessors_1 = __values(accessors), accessors_1_1 = accessors_1.next(); !accessors_1_1.done; accessors_1_1 = accessors_1.next()) {
                var accessor = accessors_1_1.value;
                if (accessor.hasChange()) {
                    try {
                        for (var _d = (e_4 = void 0, __values(accessor.state.subscribers)), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var subscriber = _e.value;
                            subscribers.add(subscriber);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d["return"])) _b.call(_d);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    accessor.resetOriginalValue();
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (accessors_1_1 && !accessors_1_1.done && (_a = accessors_1["return"])) _a.call(accessors_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var subscribers_1 = __values(subscribers), subscribers_1_1 = subscribers_1.next(); !subscribers_1_1.done; subscribers_1_1 = subscribers_1.next()) {
                var subscriber = subscribers_1_1.value;
                subscriber();
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (subscribers_1_1 && !subscribers_1_1.done && (_c = subscribers_1["return"])) _c.call(subscribers_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    return Object.assign(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            scopes++;
            var result = functor.apply(void 0, __spread(accessors, args));
            // perform update once async method done
            if (result && result.then) {
                result.then(performUpdate, performUpdate);
            }
            return result;
        }
        finally {
            scopes--;
            if (!scopes) {
                performUpdate();
            }
        }
    }, {
        getStates: function () {
            return states;
        },
        setStates: function (newStates) {
            accessors = createAccessors((states = newStates));
        }
    });
}
exports.createAction = createAction;
function getStateValues(states) {
    return states.map(function (state) { return (state.async ? state : state.value); });
}
function useStates() {
    var states = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        states[_i] = arguments[_i];
    }
    var _a = __read(react_1.useState(), 2), forceRerencer = _a[1];
    var unmountRef = react_1.useRef(false);
    var statesRef = react_1.useRef(states);
    var values = getStateValues(states);
    // get unmount status
    react_1.useEffect(function () { return function () {
        unmountRef.current = true;
    }; }, []);
    react_1.useEffect(function () {
        // do not rerender if component is unmount
        var handleChange = function () { return !unmountRef.current && forceRerencer({}); };
        var unsubscribes = statesRef.current.map(function (state) {
            state.subscribers.add(handleChange);
            return function () { return state.subscribers["delete"](handleChange); };
        });
        return function () {
            unsubscribes.forEach(function (unsubscribe) { return unsubscribe(); });
        };
    }, [forceRerencer]);
    return values;
}
exports.useStates = useStates;
function withAsyncStates(stateMap, fallbackOrOptions) {
    if (typeof fallbackOrOptions === "function" ||
        typeof fallbackOrOptions === "boolean" ||
        // support styled component
        (fallbackOrOptions && fallbackOrOptions.styledComponentId)) {
        fallbackOrOptions = { fallback: fallbackOrOptions };
    }
    var fallback = fallbackOrOptions.fallback;
    var entries = Object.entries(stateMap || {});
    var states = entries.map(function (x) { return x[1]; });
    return function (comp) {
        var memoizedComp = react_1.memo(comp);
        return function (props) {
            var results = useStates.apply(void 0, __spread(states));
            var newProps = {};
            var allDone = true;
            results.forEach(function (result, index) {
                var prop = entries[index][0];
                newProps[prop] = states[index];
                if (!result.done || result.error) {
                    allDone = false;
                }
                else {
                    newProps[prop + "Done"] = true;
                }
            });
            if (!allDone && fallback !== false) {
                return fallback ? react_1.createElement(fallback) : null;
            }
            Object.assign(newProps, props);
            return react_1.createElement(memoizedComp, newProps);
        };
    };
}
exports.withAsyncStates = withAsyncStates;
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
        originalStates.set(mocking[0], 
        // using original state if input state is falsy
        mocking[1].map(function (state, index) { return state || states[index]; }));
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
        }
        else {
            done = true;
        }
        return result;
    }
    finally {
        if (done) {
            unmock();
        }
    }
}
exports.mock = mock;
function loadStates(states, data) {
    if (data === void 0) { data = {}; }
    Object.keys(states).forEach(function (key) {
        var state = states[key];
        if (state.async) {
            throw new Error("Cannot update async state");
        }
        state.value = data[key];
    });
}
exports.loadStates = loadStates;
function exportStateValues(states) {
    var values = {};
    Object.keys(states).forEach(function (key) {
        values[key] = states[key].value;
    });
    return values;
}
exports.exportStateValues = exportStateValues;
function persist(states, data, onChange, debounce) {
    if (debounce === void 0) { debounce = 0; }
    loadStates(states, data);
    var timerId;
    function debouncedHandleChange() {
        if (debounce) {
            clearTimeout(timerId);
            timerId = setTimeout(handleChange, debounce);
        }
        else {
            handleChange();
        }
    }
    function handleChange() {
        clearTimeout(timerId);
        var values = exportStateValues(states);
        onChange(values);
    }
    Object.values(states).forEach(function (state) {
        return state.subscribers.add(debouncedHandleChange);
    });
}
exports.persist = persist;
