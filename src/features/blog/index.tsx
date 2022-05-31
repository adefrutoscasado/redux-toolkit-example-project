import React, { useState } from 'react'
import './blog.css'
import {
  useGetPostsQuery,
  useGetPostQuery,
  usePostPostMutation,
  useUpdatePostMutation,
  useUpdatePostWithOptimismMutation,
  useDeletePostMutation,
  selectPostsIds,
  selectPostsEntities,
  selectAllPosts,
  selectPostsTotal,
  selectPostById,
} from './postApiSlice'
import {
  useAppSelector,
} from './../../app/hooks'
import JSONSchemaForm from './../../components/JSONSchemaForm'
import { Spinner, Alert, Card, Button, FormCheck } from './../../components/bootstrap'
import { useSelector } from 'react-redux'


const postPostJsonSchema = {
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string',
      'default': 'name',
    },
    'description': {
      'type': 'string',
      'default': 'description',
    },
  },
  'required': ['name', 'description'],
}

const updatePostJsonSchema = {
  'type': 'object',
  'properties': {
    'id': {
      'type': 'number',
    },
    'name': {
      'type': 'string',
      'default': 'name',
    },
    'description': {
      'type': 'string',
      'default': 'description',
    },
  },
  'required': ['id', 'name', 'description'],
}


const Data = ({
  isFetching = false,
  error = null as any,
  data = null as any,
}) => {
  return (
    <>
      {(data && !isFetching && !error) &&
        <pre>
          <code>
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      }
      {isFetching &&
        <div>
          <Spinner
            animation='border'
            variant='dark'
          />
        </div>
      }
      {(error && !isFetching)  &&
        <Alert variant={'danger'}>
          {JSON.stringify(error)}
        </Alert>
      }
    </>
  )
}


const AllPosts = () => {
  const { isFetching, error: getPostsError } = useGetPostsQuery()
  const allPosts = useAppSelector(selectAllPosts)
  const total = useAppSelector(selectPostsTotal)
  const [ postPost, { isLoading: isPostingPost, error: postingPostError } ] = usePostPostMutation()

  return (
    <Card className='all-posts'>
      <Card.Title>All posts (total: {total})</Card.Title>
      <Data
        data={allPosts}
        isFetching={isFetching}
        error={getPostsError}
      />
      {/* @ts-ignore */}
      <JSONSchemaForm
        title={'Create post'}
        onSubmit={postPost}
        schema={postPostJsonSchema}
        isFetching={isPostingPost}
        error={postingPostError}
      />
    </Card>
  )
}

const SinglePost = ({
  id,
  title = '',
}) => {
  const [ optimism, setOptimism ] = useState(false)
  const { data, isFetching, error: getPostError } = useGetPostQuery(id)
  const [ updatePost, { isLoading: isUpdatingPost, error: updatingPostError } ] = useUpdatePostMutation()
  const [ updatePostWithOptimism, { isLoading: isUpdatingPostWithOptimism, error: updatingWithOptimismPostError } ] = useUpdatePostWithOptimismMutation()
  const [ deletePost, { isLoading: isDeletingPost, error: deletingPostError } ] = useDeletePostMutation()
  const post = useSelector(selectPostById(id))

  const updatePost_ = optimism ? updatePostWithOptimism : updatePost
  const isUpdatingPost_ = optimism ? isUpdatingPostWithOptimism : isUpdatingPost
  const updatingPostError_ = optimism ? updatingWithOptimismPostError : updatingPostError

  return (
    <Card>
      <Card.Title>
        <div className='card-title-container'>
          <div>
            {title || `Post with id: ${id}`}
          </div>
          <div>
            <Button variant='danger' title='Delete' onClick={() => deletePost({id})}>
              {
                isDeletingPost ?
                  <Spinner
                    animation='border'
                    variant='white'
                    size='sm'
                  />
                  :
                  'x'
              }
            </Button>
          </div>
        </div>
      </Card.Title>
      <Data
        data={data}
        isFetching={isFetching}
        error={getPostError}
      />
      <JSONSchemaForm
        title={'Update post'}
        onSubmit={updatePost_}
        schema={updatePostJsonSchema}
        // REVIEW: Why using data instead of following post generates strange behaviour in json schema form?
        defaultValues={post}
        isFetching={isUpdatingPost_}
        error={updatingPostError_ || deletingPostError}
      />
      <FormCheck
          type='switch'
          id={id + title}
          label='Update with optimism :)'
          checked={optimism}
          onChange={ev => setOptimism(ev.target.checked)}
      />
    </Card>
  )
}

const SinglePostList = () => {
  const postsIds = useAppSelector(selectPostsIds) || []
  return (
    <div className='single-post-list-container'>
      {
        postsIds.map(id => <SinglePost id={id} key={id} />)
      }
    </div>
  )

}

const Blog = () => {

  return (
    <div className='blog-container'>
      <AllPosts />
      <div className='special-single-post-list-container'>
        <SinglePost id={1} title='Post with id: 1 (repeated)' />
        <SinglePost id={100} title='Unexisting post (error state)' />
      </div>
      <SinglePostList />
    </div>
  )
}

export default Blog
