import { useUserReducer } from "../../app/hooks"
import JSONSchemaForm from "../../components/JSONSchemaForm"

const loginJsonSchema = {
  'type': 'object',
  'properties': {
    'username': {
      'type': 'string',
      'default': 'a',
    },
    'password': {
      'type': 'string',
      'default': 'a',
    },
  },
  'required': ['username', 'password'],
}

export default function Form() {
  const { login } = useUserReducer()

  return (
    // @ts-ignore
    <JSONSchemaForm title={'Login'} onSubmit={login} schema={loginJsonSchema} />
  )
}
