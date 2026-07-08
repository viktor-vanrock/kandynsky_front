import { ReactNode, FC } from 'react';
import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

interface ApolloProviderWithClientProps {
  children: ReactNode;
}

// Создаём клиент СИНХРОННО — вне компонента
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/api/graphql',
  options: {
    reconnect: true,
  },
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

const ApolloProviderChangeToken: FC<ApolloProviderWithClientProps> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloProviderChangeToken;