import { createAction, createState } from "../index";

test("Should read and write data on single state properly", () => {
  const state = createState(1);

  expect(state.value).toBe(1);
  state(5);
  expect(state.value).toBe(5);
});

test("Should computed state properly", () => {
  const baseValueState = createState(1);
  const doubleValueState = createState(
    [baseValueState],
    baseValue => baseValue * 2,
    { sync: true }
  );
  expect(doubleValueState.value).toBe(2);
});

test("Should do update once only though actions dispatch many time", () => {
  const state = createState(2);
  const callback = jest.fn();
  state.subscribe(callback);

  const action1 = createAction([], state1 => {
    action2();
    action2();
  });
  const action2 = createAction([state], state2 => {
    state2(state2() + 1);
  });

  action1();

  expect(state.value).toBe(4);
  expect(callback.mock.calls.length).toBe(1);
});
