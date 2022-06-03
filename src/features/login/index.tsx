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

  const onSubmit = (formData) => login(formData)
    // By default, dispatching asyncThunks never results in errors (errors are just saved at redux)
    // Using 'unwrap', the dispatch action will throw an error if the asyncThunk fails. Useful if we want to create then and catch logic (instead of using isError, error, data, isFetching states...).
    .unwrap()
    .then((result) => {
      /*
        Here you can access the result of the asyncThunk.
        If we don't use 'unwrap', error will be returned here as:
        {
          error: {name: "AxiosError", message: "Request failed with status code 401", code: "ERR_BAD_REQUEST"}
          meta: {arg: {…}, requestId: "3eIa5l0L3J12ADFrkxirt", rejectedWithValue: false, requestStatus: "rejected", aborted: false, …}
          payload: undefined
          type: "session/login/rejected"
        }
      */
      console.log(`Login response at then: `, result)
    })
    .catch((error) => {
      // Here you can access the error of the asyncThunk. If you don't use 'unwrap', this part will never be reached.
      console.log('Error is available at catch due to using unwrap: ', error)
    })

  console.log(loginError)

  return (
    <>
      <JSONSchemaForm
        title={'Login'}
        onSubmit={onSubmit}
        schema={loginJsonSchema}
        isFetching={isLoggingIn}
        error={loginError}
      />
      {loginError && loginError.code === "ERR_NETWORK" &&
        <>
          <div>Have you started the server?</div>
          <div>Use: <code>npm run mock-server:dev</code></div>
        </>
      }
    </>
  )
}
