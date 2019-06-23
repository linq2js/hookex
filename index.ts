import {
  useEffect,
  useState,
  createElement,
  memo,
  useRef,
  ComponentType
} from "react";

let scopes = 0;

export interface IStateAccessor {
  (): any;
  (value: any): void;
  hasChange(): boolean;
  resetOriginalValue(): void;
  state: IState;
}

export interface IStateMap {
  [key: string]: IState;
}

export interface IAction {
  (...args: any[]): any;
  getStates(): IState[];
  setStates(states: IState[]): void;
}

export interface IStateOptions {
  defaultValue?: any;
  debounce?: number;
}

export interface ISubscriber {
  (): void;
}

export interface IState {
  value: any;
  done;
  error?: any;
  async: boolean;
  lock?: any;
  subscribers: Set<ISubscriber>;
}

export function createState(
  dependencies: IState[],
  loader: Function,
  options?: IStateOptions
): IState;
export function createState(defaultValue?: any): IState;
export function createState(...args: any[]): IState {
  if (args.length === 1) {
    return {
      value: args[0],
      done: true,
      subscribers: new Set(),
      async: false
    };
  }

  const [
    dependencies,
    loader,
    { defaultValue = undefined, debounce = 300 } = {}
  ] = args;
  const subscribers = new Set<ISubscriber>();
  let keys = [];
  let timerId: number;
  let allDone = dependencies.every(dependency => {
    dependency.subscribers.add(debouncedCallLoader);
    return dependency.done;
  });
  const state: IState = {
    value: defaultValue,
    done: false,
    async: true,
    subscribers
  };
  let currentLock: any;

  function debouncedCallLoader() {
    if (debounce) {
      console.log(1);
      clearTimeout(timerId);
      currentLock = state.lock = {};
      timerId = setTimeout(callLoader, debounce);
    } else {
      callLoader();
    }
  }

  function notity() {
    for (const subscriber of state.subscribers) {
      subscriber();
    }
  }

  async function callLoader() {
    clearTimeout(timerId);
    if (currentLock !== state.lock) return;
    const newKeys = dependencies.map(dependency => {
      return dependency.value;
    });
    // keys changed
    if (
      keys.length !== newKeys.length ||
      keys.some((oldKey, index) => oldKey !== newKeys[index])
    ) {
      keys = newKeys;
      const shouldNotity = state.done !== false || state.error;

      state.done = false;
      state.error = undefined;

      const originalValue = state.value;

      if (shouldNotity) {
        notity();
      }

      try {
        const value = await loader(...keys);
        if (currentLock !== state.lock) return;
        state.value = value;
        state.done = true;
      } catch (e) {
        if (currentLock !== state.lock) return;
        state.error = e;
        state.done = true;
      }

      // dispatch change
      if (state.value !== originalValue) {
        notity();
      }
    }
  }

  if (allDone) {
    state.done = true;
    callLoader();
  }

  return state;
}

export function createAction(states: IState[], functor: Function): IAction {
  let accessors = createAccessors(states);

  function createAccessors(states: IState[]): IStateAccessor[] {
    return states.map(state => {
      let originalValue = state.value;
      return Object.assign(
        function(value?: any) {
          if (arguments.length) {
            if (state.async) {
              throw new Error("Cannot update async state");
            }
            state.value = value;
            return;
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
    const subscribers = new Set<ISubscriber>();
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
    (...args: any[]) => {
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
      setStates(newStates: IState[]) {
        accessors = createAccessors((states = newStates));
      }
    }
  );
}

function getStateValues(states: IState[]): any[] {
  return states.map(state => (state.async ? state : state.value));
}

export function useStates(...states: IState[]) {
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
    const unsubscribes = statesRef.current.map(state => {
      state.subscribers.add(handleChange);

      return () => state.subscribers.delete(handleChange);
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [forceRerencer]);

  return values;
}

export function withAsyncStates(stateMap: IStateMap, fallbackOrOptions) {
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

  return (comp: ComponentType) => {
    const memoizedComp = memo(comp);
    return (props: any) => {
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
        return fallback ? createElement(fallback) : null;
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
export function mock(actionMockings: [IAction, IState[]][], functor: Function) {
  const originalStates = new WeakMap<IAction, IState[]>();
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

export function loadStates(states: IStateMap, data = {}) {
  Object.keys(states).forEach(key => {
    const state = states[key];
    if (state.async) {
      throw new Error("Cannot update async state");
    }
    state.value = data[key];
  });
}

export function exportStateValues(states: IStateMap) {
  const values = {};

  Object.keys(states).forEach(key => {
    values[key] = states[key].value;
  });

  return values;
}

export function persist(states: IStateMap, data, onChange, debounce = 0) {
  loadStates(states, data);
  let timerId: number;
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
    onChange(values);
  }

  Object.values(states).forEach(state =>
    state.subscribers.add(debouncedHandleChange)
  );
}
