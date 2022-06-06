
import * as ROUTES from '../../app/redux/api/routes'
import {
  createEntityAdapter,
  createSelector,
  EntityState,
} from '@reduxjs/toolkit'
import api, { POST_TAG } from '../../app/redux/api/index'
import { RootState } from '../../app/redux/store'

type Post = {
  id: number,
  name: string,
  description: string,
}


const adapter = createEntityAdapter<Post>({
  // Declare the ID field
  selectId: (post) => post.id, // Unnecessary specification, since default its 'id'
  // Keep the "all IDs" array sorted based on id order
  sortComparer: (a, b) => a.id - b.id,  // sort based on id
  // sortComparer: (a, b) => b.id - a.id, // inverse sort based on id
})
const initialState = adapter.getInitialState()

const postsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<EntityState<Post>, void>({
      query: ROUTES.POSTS,
      transformResponse: (responseData: Post[]) => {
        return adapter.setAll(initialState, responseData)
      },
      // @ts-ignore
      providesTags: (result) => {
        // REVIEW: What to do if result is undefined?
        if (!result) return [{ type: POST_TAG, id: 'LIST' }]

        const tags = (result.ids.length > 0) ?
          Object.values(result.ids).map((id) => ({ type: POST_TAG, id }))
          :
          [{ type: POST_TAG, id: 'LIST' }]
        return tags
      }
    }),
    getPost: builder.query<Post, number>({
      query: (id) => ROUTES.POST(id),
      providesTags: (result, error, id) => {
        return [{ type: POST_TAG, id }] // provides single id
      },
    }),
    postPost: builder.mutation({
      query: (body) => ({
        url: ROUTES.POSTS(),
        method: 'POST',
        body,
      }),
      invalidatesTags: [POST_TAG], // invalidates entire list
    }),
    updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: ROUTES.POST(body.id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: POST_TAG, id: arg.id }], // invalidate single id
    }),
    updatePostWithOptimism: builder.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
      query: ({ id, ...patch }) => ({
        url: ROUTES.POST(id),
        method: 'PATCH',
        body: patch,
      }),
      // WARNING: onQueryStarted function requires hard reload to apply in browser
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // @ts-ignore Update the data of getPost request manually
        const manualGetPostUpdate = dispatch(api.util.updateQueryData('getPost', id, (draft) => {
          Object.assign(draft, patch)
        }))
        // @ts-ignore Update the data of getPosts request manually
        const manualGetsPostUpdate = dispatch(api.util.updateQueryData('getPosts', undefined, (draft) => {
          // @ts-ignore: REVIEW: Any way to use adapter.updateOne() function?
          Object.assign(draft.entities[id], patch)
        }))
        try {
          await queryFulfilled
          /**
           * Alternatively, here you can trigger a re-fetch of getPosts (instead of updating it manually using 'manualGetsPostUpdate').
           * Since it's independent from 'getPost', it won't update since theres no tag invalidation.
           * dispatch(api.endpoints.getPosts.initiate(undefined, {forceRefetch: true}))
           */
        } catch {
          manualGetPostUpdate.undo()
          manualGetsPostUpdate.undo()
          /**
           * Alternatively, on failure you can invalidate the corresponding cache tags to trigger a re-fetch:
           * dispatch(api.util.invalidateTags(['Post'])) // invalidates entire list
           */
        }
      },
    }),
    deletePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: ROUTES.POST(body.id),
        method: 'DELETE',
        body,
      }),
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
} = adapter.getSelectors((state: RootState) => selectPostsResultData(state) ?? initialState)

// helper to use 'selectById' cleaner
export const selectPostById = (id: Post['id']) => (state: RootState) => selectPostById_(state, id)

export default postsApiSlice

export const apiMain = api
