

import { createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit'

type Todo = {
  id: number,
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
]
// @ts-ignore
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
      // @ts-ignore TODO: Whats wrong here?
      prepare: (todo) => {
        // IMPORTANT: Should return an object with payload as key
        return { payload: {...todo, id: nanoid(), priority: 0} }
      },
    },
    incrementTodoPriority: (state, action) => {
      const { id } = action.payload
      const {selectById} = adapter.getSelectors()
      const selectedTodo = selectById(state, id)
      // Cannot mutate selected by id todo since its readonly: Cannot assign to read only property 'priority' of object
      // if (selectedTodo) selectedTodo.priority = selectedTodo.priority+1
      if (selectedTodo) adapter.updateOne(
        state,
        {
          id: id,
          changes: {
            priority: selectedTodo?.priority
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
    updateTodo: (state, action) => {
      const { id, ...rest } = action.payload
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
    // upsertOne doesnt need the 'changes' key. Just use adapter.updateOne(state, {id, description}.
    // So passing the function works fine
    upsertTodo: adapter.upsertOne,
  },
})

export const {
  addTodo,
  updateTodo,
  upsertTodo,
  incrementTodoPriority,
} = todoSlice.actions

export const {
  selectAll: selectAllTodos,
  selectEntities: selectTodosEntities,
  selectIds: selectTodosIds,
  selectById: selectTodoById_,
  // @ts-ignore
} = adapter.getSelectors((state) => state.todo)

export const selectPostById = (id: Todo['id']) => (state) => selectTodoById_(state, id)

export default todoSlice.reducer

