import React, { useMemo } from 'react'
import ColorHash from 'color-hash'
import {
  selectAllTodos,
  addTodo,
  updateTodo,
  upsertTodo,
  selectTodosEntities,
  selectTodosIds,
  selectPostById,
  incrementTodoPriority,
  decrementTodoPriority,
  deleteTodo,
} from './todoSlice'
import { useAppSelector, useAppDispatch } from './../../app/hooks'
import JSONSchemaForm from '../../components/JSONSchemaForm'
import { Button, Card } from './../../components/bootstrap'
import './todo.css'
import { EntityId } from '@reduxjs/toolkit'
const colorHash = new ColorHash()


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
  const dispatchDecrementTodoPriority = () => dispatch(decrementTodoPriority({id: todo?.id}))
  const dispatchDeleteTodo = () => dispatch(deleteTodo(todo?.id as EntityId))

  const backgroundColor = useMemo(() => colorHash.hex(id), [id])

  return (
    <Card
      className='todo-card'
      style={{backgroundColor}}
    >
      <pre>
        <code>
          {JSON.stringify(todo, null, 2)}
        </code>
      </pre>
      <div className='todo-actions'>
        <Button onClick={dispatchIncrementTodoPriority}>+ priority</Button>
        <Button onClick={dispatchDecrementTodoPriority}>- priority</Button>
        <Button onClick={dispatchDeleteTodo} variant='danger'>Delete</Button>
      </div>
      <JSONSchemaForm
        schema = {updateTodoJsonSchema}
        onSubmit = {dispatchUpdateTodo}
        defaultValues = {todo}
        label = 'Update todo'
      />
    </Card>
  )
}

const Todos = () => {
  const dispatch = useAppDispatch()
  const todos = useAppSelector(selectTodosIds)

  // REVIEW: Better way to type actions or use inference?
  const dispatchAddTodo = (formData: Parameters<typeof addTodo>[0]) => dispatch(addTodo(formData))

  return (
    <div className='todo-container'>
      <div>
        <JSONSchemaForm
          title = 'Add todo'
          schema = {addTodoJsonSchema}
          onSubmit = {dispatchAddTodo}
        />
      </div>
      <div className='todo-list'>
        {
          todos.map(id => <Todo id={id} key={id} />)
        }
      </div>
    </div>
  )
}

export default Todos
