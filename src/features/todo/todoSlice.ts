

import { createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit'
import { RootState } from '../../app/redux/store'

type Todo = {
  id: string,
  description: string,
  priority: number,
}

const adapter = createEntityAdapter<Todo>({
  // Not working when changing it live?
  sortComparer: (a, b) => b.priority - a.priority,  // sort based on id
})

// You can pass additional state
const emptyState = adapter.getInitialState()

const initialState = [
  {
    description: "Learn react",
    id: nanoid(),
    priority: 3,
  },
  {
    description: "Learn redux-toolkit",
    id: nanoid(),
    priority: 2,
  },
] as Todo[]

const filledState = adapter.upsertMany(emptyState, initialState)

export const todoSlice = createSlice({
  name: 'todo',
  initialState: filledState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        adapter.addOne(state, action.payload)
      },
      // TODO: How to type return type?
      prepare: (todo: Omit<Todo, 'id' | 'priority'>): any => {
        // IMPORTANT: Should return an object with payload as key
        return { payload: {...todo, id: nanoid(), priority: 0} }
      },
    },
    incrementTodoPriority: (state, action) => {
      const { id } = action.payload
      const { selectById } = adapter.getSelectors()
      const selectedTodo = selectById(state, id)
      // Cannot mutate selected by id todo since its readonly: Cannot assign to read only property 'priority' of object
      // if (selectedTodo) selectedTodo.priority = selectedTodo.priority+1
      if (selectedTodo) adapter.updateOne(
        state,
        {
          id: id,
          changes: {
            priority: selectedTodo?.priority + 1
          }
        }
      )
    },
    // Same without using CRUD entity adapter operators
    // incrementTodoPriority: (state, action) => {
    //   const { id } = action.payload
    //   const todoToModify = state.entities[id] // state is formed by { entities, id }
    //   if (todoToModify) todoToModify.priority++ // You can just mutate that desired entity
    // },
    decrementTodoPriority: (state, action) => {
      const { id } = action.payload
      const { selectById } = adapter.getSelectors()
      const selectedTodo = selectById(state, id)
      // Cannot mutate selected by id todo since its readonly: Cannot assign to read only property 'priority' of object
      // if (selectedTodo) selectedTodo.priority = selectedTodo.priority+1
      if (selectedTodo) adapter.updateOne(
        state,
        {
          id: id,
          changes: {
            priority: selectedTodo?.priority - 1
          }
        }
      )
    },
    updateTodo: (state, action) => {
      const { id, ...rest } = action.payload as Todo
      adapter.updateOne(
        state,
        {
          id: id,
          changes: {
            ...rest
          }
        }
      )
    },
    // upsertOne doesnt need the 'changes' key. Just use adapter.upsertOne(state, {id, description, priority}).
    // So passing the function works fine
    upsertTodo: adapter.upsertOne,
    deleteTodo: adapter.removeOne,
  },
})

export const {
  addTodo,
  updateTodo,
  upsertTodo,
  incrementTodoPriority,
  decrementTodoPriority,
  deleteTodo,
} = todoSlice.actions

export const {
  selectAll: selectAllTodos,
  selectEntities: selectTodosEntities,
  selectIds: selectTodosIds,
  selectById: selectTodoById_,
} = adapter.getSelectors((state: RootState) => state.todo)

export const selectPostById = (id: Todo['id']) => (state: RootState) => selectTodoById_(state, id)

export default todoSlice.reducer

