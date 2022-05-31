
import * as ROUTES from '../../app/redux/api/routes'
import {
  createEntityAdapter,
  createSelector,
  EntityState,
} from '@reduxjs/toolkit'
import api from '../../app/redux/api/index'

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
    updatePostWithOptimism: builder.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
      query: ({ id, ...patch }) => ({
        url: `${ROUTES.POSTS()}${id}`,
        method: 'PATCH',
        patch,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          // IMPORTANT: This will manually use the dispatch of updateQueryData of 'getPost' to force the update,
          // but 'getPosts' wont be updated!
          // @ts-ignore
          api.util.updateQueryData('getPost', id, (draft) => {
            console.log()
            Object.assign(draft, patch)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()

          /**
           * Alternatively, on failure you can invalidate the corresponding cache tags
           * to trigger a re-fetch:
           * dispatch(api.util.invalidateTags(['Post']))
           */
        }
      },
    }),
    deletePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: `${ROUTES.POSTS()}${body.id}`,
        method: 'DELETE',
        body,
      }),
      // @ts-ignore
      invalidatesTags: (result, error, arg) => [{ type: POST_TAG, id: arg.id }], // invalidate single id
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  usePostPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUpdatePostWithOptimismMutation,
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
