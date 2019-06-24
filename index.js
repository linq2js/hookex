import { useEffect, useState, createElement, memo, useRef } from "react";

const defaultDebounce = 300;
let scopes = 0;

/**
 * createState(defaultValue:any)
 * createState(dependencies:IState[], functor:Function, options:any)
 * @param args
 * @return {{async: boolean, computed: boolean, subscribers: Set<any>, value: *, done: boolean}|{async: boolean, computed: boolean, subscribers: Set<any>, value: undefined, done: boolean}}
 */
export function createState(...args) {
  const subscribers = new Set();

  function notity() {
    for (const subscriber of subscribers) {
      subscriber();
    }
  }

  // create simple state
  if (args.length === 1) {
    const simpleState = Object.assign(
      callback => {
        const newValue = callback(simpleState.value);
        if (newValue && newValue.then) {
          throw new Error("Do not use this method for async updating");
        }
        if (newValue !== simpleState.value) {
          simpleState.value = newValue;
          notity();
        }
      },
      {
        value: args[0],
        done: true,
        subscribers,
        async: false,
        computed: false
      }
    );
    return simpleState;
  }

  // create computed state
  const [
    dependencies,
    loader,
    { sync, defaultValue = undefined, debounce = defaultDebounce } = {}
  ] = args;

  let keys = [];
  let timerId;
  let allDone = dependencies.every(dependency => {
    dependency.subscribers.add(sync ? callLoaderSync : debouncedCallLoader);
    return dependency.done;
  });
  const computedState = {
    value: defaultValue,
    done: false,
    async: !sync,
    computed: true,
    subscribers
  };
  let currentLock;

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
    const newKeys = dependencies.map(dependency => {
      return dependency.value;
    });

    if (
      keys.length !== newKeys.length ||
      keys.some((oldKey, index) => oldKey !== newKeys[index])
    ) {
      keys = newKeys;
      callback();
    }
  }

  function callLoaderSync() {
    shouldUpdate(() => {
      computedState.done = false;
      const prevValue = computedState.value;
      computedState.value = loader(...keys);
      computedState.done = true;
      if (computedState.value !== prevValue) {
        notity();
      }
    });
  }

  function callLoaderAsync() {
    clearTimeout(timerId);
    if (currentLock !== computedState.lock) return;
    shouldUpdate(async () => {
      const shouldNotity = computedState.done !== false || computedState.error;

      computedState.done = false;
      computedState.error = undefined;

      const originalValue = computedState.value;

      if (shouldNotity) {
        notity();
      }

      try {
        const value = await loader(...keys);
        if (currentLock !== computedState.lock) return;
        computedState.value = value;
        computedState.done = true;
      } catch (e) {
        if (currentLock !== computedState.lock) return;
        computedState.error = e;
        computedState.done = true;
      }

      // dispatch change
      if (computedState.value !== originalValue) {
        notity();
      }
    });
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
 * @param IState[]  states
 * @param Function  functor
 * @return {(Function & {getStates(): *, setStates(*): void})|*}
 */
export function createAction(states, functor) {
  let accessors = createAccessors(states);

  function createAccessors(states) {
    return states.map(state => {
      let originalValue = state.value;
      return Object.assign(
        function(value) {
          if (arguments.length) {
            if (state.computed) {
              throw new Error("Cannot update computed state");
            }
            return (state.value = value);
          }

          return state.value;
        },
        {
          state,
          hasChange() {
            return originalValue !== state.value;
          },
          resetOriginalValue() {
            originalValue = state.value;
          }
        }
      );
    });
  }

  function performUpdate() {
    const subscribers = new Set();
    // collect all subscribers
    for (const accessor of accessors) {
      if (accessor.hasChange()) {
        for (const subscriber of accessor.state.subscribers) {
          subscribers.add(subscriber);
        }
        accessor.resetOriginalValue();
      }
    }

    for (const subscriber of subscribers) {
      subscriber();
    }
  }

  return Object.assign(
    (...args) => {
      try {
        scopes++;

        const result = functor(...accessors, ...args);

        // perform update once async method done
        if (result && result.then) {
          result.then(performUpdate, performUpdate);
        }

        return result;
      } finally {
        scopes--;
        if (!scopes) {
          performUpdate();
        }
      }
    },
    {
      getStates() {
        return states;
      },
      setStates(newStates) {
        accessors = createAccessors((states = newStates));
      }
    }
  );
}

function getStateValues(states) {
  return states.map(state => (state.async ? state : state.value));
}

export function useStates(...states) {
  const [, forceRerencer] = useState();
  const unmountRef = useRef(false);
  const statesRef = useRef(states);
  const values = getStateValues(states);

  // get unmount status
  useEffect(
    () => () => {
      unmountRef.current = true;
    },
    []
  );

  useEffect(() => {
    // do not rerender if component is unmount
    const handleChange = () => !unmountRef.current && forceRerencer({});
    const localStates = statesRef.current;

    localStates.forEach(state => {
      state.subscribers.add(handleChange);
    });

    return () => {
      localStates.forEach(state => state.subscribers.delete(handleChange));
    };
  }, [forceRerencer]);

  return values;
}

/**
 *
 * @param stateMap
 * @param fallbackOrOptions
 * @return {function(*=): Function}
 */
export function withAsyncStates(stateMap, fallbackOrOptions) {
  if (
    typeof fallbackOrOptions === "function" ||
    typeof fallbackOrOptions === "boolean" ||
    // support styled component
    (fallbackOrOptions && fallbackOrOptions.styledComponentId)
  ) {
    fallbackOrOptions = { fallback: fallbackOrOptions };
  }

  const { fallback } = fallbackOrOptions;

  const entries = Object.entries(stateMap || {});
  const states = entries.map(x => x[1]);

  if (states.some(state => !state.async)) {
    throw new Error("Expect async state but got sync state");
  }

  return comp => {
    const memoizedComp = memo(comp);
    return props => {
      const results = useStates(...states);
      const newProps = {};

      let allDone = true;

      results.forEach((result, index) => {
        const prop = entries[index][0];
        newProps[prop] = states[index];
        if (!result.done || result.error) {
          allDone = false;
        } else {
          newProps[prop + "Done"] = true;
        }
      });

      if (!allDone && fallback !== false) {
        return fallback ? createElement(fallback, props) : null;
      }

      Object.assign(newProps, props);

      return createElement(memoizedComp, newProps);
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
export function mock(actionMockings, functor) {
  const originalStates = new WeakMap();
  let done = false;
  actionMockings.forEach(mocking => {
    const states = mocking[0].getStates();
    originalStates.set(
      mocking[0],
      // using original state if input state is falsy
      mocking[1].map((state, index) => state || states[index])
    );
  });

  function unmock() {
    actionMockings.forEach(mocking =>
      mocking[0].setStates(originalStates.get(mocking[0]))
    );
  }
  try {
    const result = functor();
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
 * load multiple states from specific data
 * @param states
 * @param data
 */
export function loadStates(states, data = {}) {
  Object.keys(states).forEach(key => {
    // do not overwrite state value if the key is not present in data
    if (!(key in data)) return;
    const state = states[key];
    if (state.computed) {
      throw new Error("Cannot update computed state");
    }
    state.value = data[key];
  });
}

/**
 * export multiple states to json object
 * @param states
 */
export function exportStateValues(states) {
  const values = {};

  Object.keys(states).forEach(key => {
    values[key] = states[key].value;
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
export function persist(states, data, onChange, debounce = defaultDebounce) {
  loadStates(states, data);
  let timerId;
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
    const values = exportStateValues(states);
    onChange && onChange(values);
  }

  Object.values(states).forEach(state =>
    state.subscribers.add(debouncedHandleChange)
  );
}

export function compose(...functions) {
  if (functions.length === 0) {
    return arg => arg;
  }

  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}

export function hoc(...callbacks) {
  return callbacks.reduce(
    (nextHoc, callback) => Component => {
      const MemoComponent = memo(Component);

      return props => {
        // callback requires props and Comp, it must return React element
        if (callback.length > 1) {
          return callback(props, MemoComponent);
        }
        let newProps = callback(props);
        if (newProps === false) return null;
        if (!newProps) {
          newProps = props;
        }

        return createElement(MemoComponent, newProps);
      };
    },
    Component => Component
  );
}

export function memoize(f) {
  let lastResult;
  let lastArgs;

  return function(...args) {
    // call f on first time or args changed
    if (!lastArgs || lastArgs.some((value, index) => value !== args[index])) {
      lastArgs = args;
      lastResult = f(...lastArgs);
    }
    return lastResult;
  };
}

export function AsyncRender({
  render,
  error,
  children,
  state,
  states,
  prop = "data",
  ...props
}) {
  const results = useStates(...(states || [state]));
  const allDone = results.every(result => result.done);

  if (!allDone) {
    return children;
  }

  const errorObject = state
    ? state.error
    : states.filter(x => x.error).map(x => x.error)[0];

  if (errorObject) {
    if (error) {
      return createElement(error, errorObject);
    }
    return children;
  }

  const data = state ? results[0].value : results.map(result => result.value);

  if (render) {
    return createElement(
      render,
      prop
        ? {
            [prop]: data,
            ...props
          }
        : {
            ...data,
            ...props
          }
    );
  }

  return data;
}
