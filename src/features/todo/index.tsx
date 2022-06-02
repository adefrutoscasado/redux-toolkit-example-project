import React from 'react'
import {
  selectAllTodos,
  addTodo,
  updateTodo,
  upsertTodo,
  selectTodosEntities,
  selectTodosIds,
  selectPostById,
  incrementTodoPriority,
} from './todoSlice'
import { useAppSelector, useAppDispatch } from './../../app/hooks'
import JSONSchemaForm from '../../components/JSONSchemaForm'
import { Button } from './../../components/bootstrap'

const addTodoJsonSchema = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      default: 'Something to do',
    },
  },
  required: ['description'],
}

const updateTodoJsonSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    description: {
      type: 'string',
      default: 'Something to do',
    },
  },
  required: ['id', 'description'],
}

const Todo = ({
  id
}) => {
  const dispatch = useAppDispatch()
  const todo = useAppSelector(selectPostById(id))
  const dispatchUpsertTodo = (formData) => dispatch(upsertTodo(formData))
  const dispatchUpdateTodo = (formData) => dispatch(updateTodo(formData))
  const dispatchIncrementTodoPriority = () => dispatch(incrementTodoPriority({id: todo?.id}))
  return (
    <>
      <pre>
        <code>
          {JSON.stringify(todo, null, 2)}
        </code>
      </pre>
      <Button onClick={dispatchIncrementTodoPriority}>Increment priority</Button>
      <JSONSchemaForm
        title={'Update todo: ' + todo?.description}
        schema = {updateTodoJsonSchema}
        onSubmit = {dispatchUpdateTodo}
        defaultValues = {todo}
      />
    </>
  )
}

const Todos = () => {
  const dispatch = useAppDispatch()
  const todos = useAppSelector(selectTodosIds)

  const dispatchAddTodo = (formData) => dispatch(addTodo(formData))
  const dispatchUpdateTodo = (formData) => dispatch(updateTodo(formData))
  const dispatchUpsertTodo = (formData) => dispatch(upsertTodo(formData))

  return (
    <div>
      Todo
      <JSONSchemaForm
        title = 'Add todo'
        schema = {addTodoJsonSchema}
        onSubmit = {dispatchAddTodo}
      />
      <div>
        {
          todos.map(id => <Todo id={id} />)
        }
      </div>
    </div>
  )
}

export default Todos
