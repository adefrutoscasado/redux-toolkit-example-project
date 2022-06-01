import { useUserReducer } from "../../app/hooks"
import JSONSchemaForm from "../../components/JSONSchemaForm"

const loginJsonSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      default: 'a',
    },
    password: {
      type: 'string',
      default: 'a',
    },
  },
  required: ['username', 'password'],
}

export default function Form() {
  const { login, isLoggingIn, loginError } = useUserReducer()

  return (
    <JSONSchemaForm
      title={'Login'}
      onSubmit={login}
      schema={loginJsonSchema}
      isFetching={isLoggingIn}
      error={loginError}
    />
  )
}
