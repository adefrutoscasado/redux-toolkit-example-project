
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
          [{ type: POST_TAG, id: 'LIST' }]
        return tags
      }
    }),
    getPost: builder.query<Post, number>({
      query: (id) => `${ROUTES.POSTS()}${id}`,
      providesTags: (result, error, id) => {
        return [{ type: POST_TAG, id }]
      },
    }),
    postPost: builder.mutation({
      query: (body) => ({
        url: ROUTES.POSTS(),
        method: 'POST',
        body,
      }),
      invalidatesTags: [POST_TAG],
    }),
    updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: `${ROUTES.POSTS()}${body.id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: POST_TAG, id: arg.id }],
    }),
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
  selectById: selectPostById,
  //  @ts-ignore
} = adapter.getSelectors(state => selectPostsResultData(state) ?? initialState)


export default postsApiSlice