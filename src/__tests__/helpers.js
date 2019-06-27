import { createAction, createState } from "../index";

test("date.day helper", () => {
  const state = createState(new Date("2019-01-01"));
  const action = createAction([state], state => state.add(1, "day"));
  action();
  expect(state.value.getDate()).toBe(2);
});

test("date.year helper", () => {
  const state = createState(new Date("2019-01-01"));
  const action = createAction([state], state => state.add(2, "year"));
  action();
  expect(state.value.getFullYear()).toBe(2021);
});

test("boolean helper", () => {
  const state = createState(true);
  const action = createAction([state], state => state.toggle());
  action();
  expect(state.value).toBe(false);
  action();
  expect(state.value).toBe(true);
});

test("number helper", () => {
  const state = createState(1);
  const action = createAction([state], state => state.add(1));
  action();
  expect(state.value).toBe(2);
});
