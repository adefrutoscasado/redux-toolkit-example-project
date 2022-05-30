
import * as ROUTES from './routes'
import {
  createEntityAdapter,
  createSelector,
  EntityState,
} from '@reduxjs/toolkit'
import api from './index'

type Post = {
  name: string,
  description: string,
  id: number
}

const adapter = createEntityAdapter<Post>()
const initialState = adapter.getInitialState()

export const POST_TAG = 'Post'

const postsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<EntityState<Post>, void>({
      query: ROUTES.POSTS,
      transformResponse: (responseData: Post[]) => {
        return adapter.setAll(initialState, responseData)
      },
      // @ts-ignore
      providesTags: (result) => {
        const tags = result && (Object.keys(result?.entities || [])) ?
          Object.values(result.ids).map((id) => ({ type: POST_TAG, id }))
          :
          [{ type: POST_TAG, id: 'LIST' }] // provide various ids. If no id, use the tag 'list'
        return tags
      }
    }),
    getPost: builder.query<Post, number>({
      query: (id) => `${ROUTES.POSTS()}${id}`,
      // @ts-ignore
      providesTags: (result, error, id) => {
        return [{ type: POST_TAG, id }] // provide single id
      },
    }),
    postPost: builder.mutation({
      query: (body) => ({
        url: ROUTES.POSTS(),
        method: 'POST',
        body,
      }),
      // @ts-ignore
      invalidatesTags: [POST_TAG], // invalidate entire list
    }),
    updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: `${ROUTES.POSTS()}${body.id}`,
        method: 'PATCH',
        body,
      }),
      // @ts-ignore
      invalidatesTags: (result, error, arg) => [{ type: POST_TAG, id: arg.id }], // invalidate single id
    }),
    // TODO: Create an optimistic update https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#optimistic-updates
  }),
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  usePostPostMutation,
  useUpdatePostMutation,
} = postsApiSlice

// @ts-ignore
const selectPostsResult = postsApiSlice.endpoints.getPosts.select()

const selectPostsResultData = createSelector(
  selectPostsResult,
  postsResult => postsResult?.data ?? initialState
)

export const {
  selectIds: selectPostsIds,
  selectEntities: selectPostsEntities,
  selectAll: selectAllPosts,
  selectTotal: selectPostsTotal,
  selectById: selectPostById_,
  //  @ts-ignore
} = adapter.getSelectors(state => selectPostsResultData(state) ?? initialState)

// helper to use 'selectById' cleaner
export const selectPostById = (id: Post['id']) => (state) => selectPostById_(state, id)

export default postsApiSlice
