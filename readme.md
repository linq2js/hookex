#hookex

A state manager for React without reducer, Provider, dispatcher etc.
Created for large projects

# Samples

## Counter App

```jsx harmony
import React from "react";
import { render } from "react-dom";
import { createState, createAction, useStates } from "hookex";

// define $Count state with 1 as default value
const $Count = createState(1);
// define an action, specified $Count as dependencies
// action body receives $Counter accessor
// using count() to get current state value and count(newValue) to update state
const Increase = createAction([$Count], count => count(count() + 1));

function App() {
  const [count] = useStates($Count);
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

const $Count = createState(1);
const Increase = createAction([$Count], count => count(count() + 1));
const $DoubleCount = createState([$Count], count => count * 2, { sync: true });

function App() {
  const [count, doubleCount] = useStates($Count, $DoubleCount);
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
const $SearchTerm = createState("");
const UpdateSearchTerm = createAction([$SearchTerm], (searchTerm, value) =>
  searchTerm(value)
);
// once searchTerm changed, UserInfo state will be recomputed
const $UserInfo = createState([$SearchTerm], async searchTerm => {
  const res = await fetch(apiUrl + searchTerm);
  return await res.json();
});

function App() {
  const [searchTerm, userInfo] = useStates($SearchTerm, $UserInfo);
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
const $SearchTerm = createState("");
const UpdateSearchTerm = createAction([$SearchTerm], (searchTerm, value) =>
  searchTerm(value)
);
const $UserInfo = createState([$SearchTerm], async searchTerm => {
  const res = await fetch(apiUrl + searchTerm);
  return await res.json();
});

function UserInfo({ data }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

function App() {
  const [searchTerm] = useStates($SearchTerm);

  return (
    <div>
      <p>
        <input
          type="text"
          value={searchTerm}
          onChange={e => UpdateSearchTerm(e.target.value)}
        />
      </p>
      <AsyncRender render={UserInfo} state={$UserInfo}>
        Loading...
      </AsyncRender>
    </div>
  );
}

render(<App />, document.getElementById("root"));
```
