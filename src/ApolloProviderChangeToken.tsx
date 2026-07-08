import { useState, useEffect, ReactNode, FC } from 'react';
import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

interface ApolloProviderWithClientProps {
  children: ReactNode;
}

const ApolloProviderChangeToken: FC<ApolloProviderWithClientProps> = ({ children }) => {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          // authorization: `Bearer ${accessToken}`
        },
      };
    });

    const httpLink = createHttpLink({
      uri: import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/graphql` : '/api/graphql',
    });

    const wsLink = new WebSocketLink({
      uri: import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/graphql` : '/api/graphql',
      options: {
        reconnect: true,
      },
    });

    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      authLink.concat(httpLink),
    );

    const newClient = new ApolloClient({
      uri: import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/graphql` : '/api/graphql',
      cache: new InMemoryCache(),
      link,
      connectToDevTools: true,
    });

    setClient(newClient);
  }, []);

  if (!client) {
    return null;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloProviderChangeToken;
