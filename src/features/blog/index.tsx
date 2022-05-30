import React from 'react'
import './blog.css'
import {
  useGetPostsQuery,
  useGetPostQuery,
  usePostPostMutation,
  useUpdatePostMutation,
  selectPostsIds,
  selectPostsEntities,
  selectAllPosts,
  selectPostsTotal,
  selectPostById,
} from './../../app/redux/api/post'
import {
  useAppSelector,
} from './../../app/hooks'
import JSONSchemaForm from './../../components/JSONSchemaForm'
import { Spinner, Alert, Card } from './../../components/bootstrap'


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
  'required': ['name', 'description'],
}


const Layout = ({
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
      <Layout
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
  const { isFetching, error: getPostError } = useGetPostQuery(id)
  const post = useAppSelector(selectPostById(id))
  const [ updatePost, { isLoading: isUpdatingPost, error: updatingPostError } ] = useUpdatePostMutation()

  return (
    <Card>
      <Card.Title>{title || `Post with id: ${id}`}</Card.Title>
      <Layout
        data={post}
        isFetching={isFetching}
        error={getPostError}
      />
      {/* @ts-ignore */}
      <JSONSchemaForm
        title={'Update post'}
        onSubmit={updatePost}
        schema={updatePostJsonSchema}
        defaultValues={post}
        isFetching={isUpdatingPost}
        error={updatingPostError}
      />
    </Card>
  )
}

const SinglePostList = () => {
  const postsIds = useAppSelector(selectPostsIds) || []
  return (
    <div className='single-post-list-container'>
      {
        postsIds.map((id) =>
          <>
            <SinglePost id={id} />
          </>
        )
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
