import React, { useState } from 'react'
import {
  useGetPersonPetsQuery,
  getSelectors,
} from './petsApiSlice'
import { useSelector } from 'react-redux'


const App = () => {
  const { isFetching: isFetchingId1 } = useGetPersonPetsQuery({id: 1})
  const { isFetching: isFetchingId2 } = useGetPersonPetsQuery({id: 2})

  // Dinamically get selectors based on parent query
  const { selectAll: selectAllFromId1, selectById: selectByIdFromId1 } = getSelectors({id: 1})
  const { selectAll: selectAllFromId2 } = getSelectors({id: 2})

  // use selectors based on parent id
  const allFromId1 = useSelector(selectAllFromId1)
  const allFromId2 = useSelector(selectAllFromId2)

  const pet1fromId1 = useSelector(selectByIdFromId1(1))

  return (
    <div>
      <h3>Pets of person with ID 1:</h3>
      {isFetchingId1 ?
        'Fetching pets...'
        :
        <>
          <h4><code>selectAll</code> selectors of pets of person 1</h4>
          <pre>
            <code>
              {JSON.stringify(allFromId1, null, 2)}
            </code>
          </pre>
          <h4><code>selectById</code> selectors of pets of person 1</h4>
          <pre>
            <code>
              {JSON.stringify(pet1fromId1, null, 2)}
            </code>
          </pre>
        </>
      }
      <h3>Pets of person with ID 2:</h3>
      {isFetchingId2 ?
        'Fetching pets...'
        :
        <>
        <h4><code>selectAll</code> selector of pets of person 2</h4>
        <pre>
          <code>
            {JSON.stringify(allFromId2, null, 2)}
          </code>
        </pre>
        </>
      }
    </div>
  )
}

export default App
