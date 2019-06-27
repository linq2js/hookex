# hookex

A state manager for React without reducer, Provider, dispatcher etc. Design for large projects.

1. No Provider needed
1. No Store needed
1. No Reducer needed
1. No Action Creator needed
1. No Dispatcher needed
1. Simple concept: State & Action
1. Support Simple State (Synchronous State)
1. Support Asynchronous State (with debouncing)
1. Support Dynamic State
1. Support Sub State
1. Built-in methods for updating state on the fly
1. Compatible with other state mangers (MobX, Redux...)

# Samples

## Counter App

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, createAction, useStates } from "hookex";

// define CountState with 1 as default value
const CountState = createState(1);
// define an action, specified CountState as dependencies
// action body receives CountState accessor
// using count() to get current state value and count(newValue) to update state
const Increase = createAction([CountState], count => count(count() + 1));

function App() {
  const [count] = useStates(CountState);
  return (
    <div>
      Counter: {count}
      <button onClick={Increase}>Click to increase counter</button>
    </div>
  );
}

render(<App />, document.getElementById("root"));
```

## Dynamic State

Create dynamic state which is computed from other states

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, createAction, useStates } from "hookex";

const CountState = createState(1);
const DoubleCountState = createState([CountState], count => count * 2, { sync: true });
const Increase = createAction([CountState], count => count(count() + 1));

function App() {
  const [count, doubleCount] = useStates(CountState, DoubleCountState);
  return (
    <div>
      <p>Counter: {count}</p>
      <p>Double Counter: {doubleCount}</p>
      <button onClick={Increase}>Click to increase counter</button>
    </div>
  );
}

render(<App />, document.getElementById("root"));
```

## Async State

Search github user

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, createAction, useStates } from "hookex";

const apiUrl = "https://api.github.com/users/";
const SearchTermState = createState("");
const UpdateSearchTerm = createAction([SearchTermState], (searchTerm, value) =>
  searchTerm(value)
);
// once searchTerm changed, UserInfo state will be recomputed
const UserInfoState = createState([SearchTermState], async searchTerm => {
  const res = await fetch(apiUrl + searchTerm);
  return await res.json();
});

function App() {
  const [searchTerm, userInfo] = useStates(SearchTermState, UserInfoState);
  const { value, done } = userInfo;
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={e => UpdateSearchTerm(e.target.value)}
      />
      <pre>{done ? JSON.stringify(value, null, 2) : "Searching..."}</pre>
    </div>
  );
}

render(<App />, document.getElementById("root"));
```

## Using AsyncRender component

AsyncRender component receives specified async state (or multiple states).
When state loaded, render callback/component will be called
unless AsyncRender's children will be rendered instead

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, createAction, useStates, AsyncRender } from "./hookex";

const apiUrl = "https://api.github.com/users/";
const SearchTermState = createState("");
const UpdateSearchTerm = createAction([SearchTermState], (searchTerm, value) =>
  searchTerm(value)
);
const UserInfoState = createState([SearchTermState], async searchTerm => {
  const res = await fetch(apiUrl + searchTerm);
  return await res.json();
});

function UserInfo({ data }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

function App() {
  const [searchTerm] = useStates(SearchTermState);

  return (
    <div>
      <p>
        <input
          type="text"
          value={searchTerm}
          onChange={e => UpdateSearchTerm(e.target.value)}
        />
      </p>
      <AsyncRender render={UserInfo} state={UserInfoState}>
        Loading...
      </AsyncRender>
    </div>
  );
}

render(<App />, document.getElementById("root"));
```

## Saving and loading states with localStorage

```jsx harmony
import { createState, createAction, persist } from "hookex";

const CounterState = createState(1);
const Increase = createAction([CounterState], async counter =>
  console.log(counter(counter() + 1))
);

setInterval(Increase, 3000);

persist(
  {
    counter: CounterState
  },
  JSON.parse(localStorage.getItem("counterApp")) || {},
  state => localStorage.setItem("counterApp", JSON.stringify(state))
);
```

## Update single state

Note: Cannot update computed state

```jsx harmony
import { createState } from "hookex";

const CounterState = createState(1);

setInterval(
  () =>
    CounterState(prev => {
      console.log(prev);
      return prev + 1;
    }),
  3000
);
```

## Using State as event handler

You can pass state to element event, it can process input synthetic event (event.target.value/event.target.checked)

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, useStates } from "hookex";

const ValueState = createState("Hello world !!!");
const CheckedState = createState(true);

function App() {
  const [value, checked] = useStates(ValueState, CheckedState);

  return (
    <>
      <p>
        <input value={value} onChange={ValueState} />
      </p>
      <p>{value}</p>
      <p>
        <input type="checkbox" checked={checked} onChange={CheckedState} />
      </p>
      <p>{checked ? "checked" : "unchecked"}</p>
    </>
  );
}

render(<App />, document.getElementById("root"));
```

# API References

1. createState(defaultValue)
1. createState(dependencies, functor, options)
1. createAction(dependencies, functor)
1. useStates(...states)
1. withAsyncStates(states, fallbackOrOptions)
1. updateStates(stateMap, data)
1. AsyncRender
1. persistStates(stateMap, initialData, onChange)
1. compose(...funcs)
1. hoc(functor)
1. memoize(func)
1. configure(optionsOrCallback)

