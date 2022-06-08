
<br />
<p align="center">
  <h3 align="center">Redux Toolkit project example</h3>
</p>
<br />
<br />

## Getting Started

To get a local copy up and running follow these simple steps.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/adefrutoscasado/redux-toolkit-example-project
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start the mock server
   ```sh
   npm run mock-server:dev
   ```
3. Start the frontend application
   ```sh
   npm start
   ```

## Examples

### Login

- JWT refresh token strategy.
- Use of `mutex` to avoid repeating token refresh requests.
- Use of `createAsyncThunk()`, `isAsyncThunkAction()`, `isPending()`, `isRejected()`, `isFulfilled()`, `createAction()`, `isAnyOf()` utils.
- Use of `unwrap()`.

### Counter (Redux toolkit original example)

- Use of `createSlice()`, `createAsyncThunk()`.

### Todo

- Todo list.
- Use of `createEntityAdapter()`, its `sortComparer` and its CRUD operations.
- Use of `prepare()` function.

### Blog

- A blog integrated with a mock server.
- Use of `createApi()`.
- Use of `createEntityAdapter()`.
- Tag invalidation.
- Implementation of normal updates and optimistic updates.

### Pets

- Displays pets of persons.
- Use of `createApi()`.
- Use of `createEntityAdapter()`.
- Get selectors **dinamically** based on the arguments you used in the query of `createApi()`.
