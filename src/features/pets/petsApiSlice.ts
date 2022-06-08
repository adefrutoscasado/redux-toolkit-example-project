
import * as ROUTES from '../../app/redux/api/routes'
import {
  createEntityAdapter,
  createSelector,
  EntityState,
} from '@reduxjs/toolkit'
import api from '../../app/redux/api/index'


type GetPersonPetsArgs = { id: number }
type Pet = {
  id: number,
  type: string,
}

const adapter = createEntityAdapter<Pet>({
  sortComparer: (a, b) => a.type.localeCompare(b.type),  // sort based on type¡
})

const initialState = adapter.getInitialState()

const petsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPersonPets: builder.query<EntityState<Pet>, GetPersonPetsArgs>({
      query: ({id}: GetPersonPetsArgs) => ROUTES.PERSON_PETS(id),
      transformResponse: (responseData: Pet[]) => {
        return adapter.setAll(initialState, responseData)
      },
    }),
  }),
})

export const {
  useGetPersonPetsQuery,
} = petsApiSlice


export const getSelectors = (
  query: GetPersonPetsArgs,
) => {
  const selectPersonPetsResult = petsApiSlice.endpoints.getPersonPets.select(query)

  const adapterSelectors = createSelector(
    selectPersonPetsResult,
    (result) => adapter.getSelectors(() => result?.data ?? initialState)
  )

  return {
    selectAll: createSelector(adapterSelectors, (s) =>
      s.selectAll(undefined)
    ),
    selectEntities: createSelector(adapterSelectors, (s) =>
      s.selectEntities(undefined)
    ),
    selectIds: createSelector(adapterSelectors, (s) =>
      s.selectIds(undefined)
    ),
    selectTotal: createSelector(adapterSelectors, (s) =>
      s.selectTotal(undefined)
    ),
    selectById: (id) => createSelector(adapterSelectors, (s) =>
      s.selectById(s, id)
    ),
  }
}


export default petsApiSlice
