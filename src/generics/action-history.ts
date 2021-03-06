import { Reducer } from 'redux'

type ActionHistory<ActionType> = {
  following: Array<ActionType>,
  history: Array<ActionType>,
  latest: ActionType | undefined,
}

namespace ActionHistory {
  export type Bind<ActionType extends string = string> = {
    actionHistory: ActionHistory<ActionType>
  }
  export function of<ActionType extends string = string>(following: Array<ActionType>) {
    return {
      actionHistory: {
        history: [],
        following,
        latest: undefined 
      }
    }
  }
  export function push<ActionType extends string = string>(
    ah: ActionHistory<ActionType>, action: ActionType
  ){
    if(ah.following.includes(action)){
      return {
        history: [...ah.history, action],
        latest: action,
        following: ah.following
      }
    }
    return ah
  }
  export function filter<ActionType extends string = string>(
    filter: (action: ActionType) => boolean,
    { history, following, latest }: ActionHistory<ActionType>, 
  ){
    history = history.filter(filter)
    return {
      history,
      following: following.filter(filter),
      latest: history[history.length - 1]
    }
  }
  export function filterWithPrefix<ActionType extends string = string>(
    prefix: string,
    { history, following, latest }: ActionHistory<ActionType>, 
  ){
    let filter = (action: ActionType) => action.startsWith(prefix)
    history = history.filter(filter)
    return {
      history,
      following: following.filter(filter),
      latest: history[history.length - 1]
    }
  }
  export function bind<
    ActionType extends string = string,
    S extends Bind<ActionType> = Bind<ActionType>
  >(reducer: Reducer<S>, initialState?: S){
    let wrapped = (_state: S, action): S => {
      // we call the reducer first in case initialState was provided there
      let state = reducer(_state, action)
      let actionHistory = push(state.actionHistory, action.type)
      return Object.assign({}, state, { actionHistory })
    }
    return initialState ? (_state: S = initialState, action) => wrapped(_state, action) : wrapped
  }
}


export default ActionHistory
