const { createAction, createState } = require("../dist/index");

test("Should do update once only though actions dispatch many time", () => {
  const state1 = createState(1);
  const state2 = createState(2);
  const callback = jest.fn();
  state2.subscribe(callback);

  const action1 = createAction([state1], state1 => {
    state1(state1() + 1);
    action2();
    action2();
  });
  const action2 = createAction([state2], state2 => {
    state2(state2() + 1);
  });

  action1();

  expect(state1.value).toBe(2);
  expect(state2.value).toBe(4);
  expect(callback.mock.calls.length).toBe(1);
});
