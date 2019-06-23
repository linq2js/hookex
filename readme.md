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
