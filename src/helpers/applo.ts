import { onError } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const LOCAL_STORAGE_KEY = 'plate_redactor_value';

export const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED') {
        logoutUser();
      }
    });
  }
});

export const httpLink = new HttpLink({
  uri: process.env.VITE_GRAPHQL_SERVER ? process.env.VITE_GRAPHQL_SERVER : `http://127.0.0.1:3000/graphql`,
});

export const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  }
  return {
    headers: {
      ...headers,
    },
  };
});

function logoutUser() {
  localStorage.removeItem('jwt');
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.location.href = '/login';
}
