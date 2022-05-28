import JSONSchemaForm from "@rjsf/core"
import { useUserReducer } from "../../app/hooks"

const loginJsonSchema = {
  'title': 'Login',
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

  const onSubmit = ({formData}) => {
    login(formData)
  }

  return (
    // @ts-ignore
    <JSONSchemaForm onSubmit={onSubmit} schema={loginJsonSchema} />
  )
}
