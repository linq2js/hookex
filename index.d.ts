interface Set<T> {}

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

export function createAction(states: IState[], functor: Function): IAction;

export function useStates(...states: IState[]);

export function withAsyncStates(stateMap: IStateMap, fallbackOrOptions);

export function mock(actionMockings: [IAction, IState[]][], functor: Function);

export function loadStates(states: IStateMap, data: any);

export function exportStateValues(states: IStateMap);

export function persist(
  states: IStateMap,
  data: any,
  onChange: (state: any) => void,
  debounce?: number
);
