import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { AppConfigs } from 'constant';
import { PerformanceLib } from 'libs';

const httpLink = new HttpLink({
  uri: AppConfigs.rootAPI,
});

const errorLink = new ErrorLink(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      switch (err.extensions.code) {
        // Apollo Server sets code to UNAUTHENTICATED
        // when an AuthenticationError is thrown in a resolver
        case 'UNAUTHENTICATED':
          // Modify the operation context with a new token
          // Retry the request, returning the new observable
          return forward(operation);
      }
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      MoneyRollover: {
        fields: {
          checkupReporting: {
            merge: true,
          },
          getProvisionsjar: {
            merge: true,
          },
        },
      },
      User: {
        fields: {
          client: {
            merge: true,
          },
        },
      },
      Query: {
        fields: {
          me: {
            merge: true,
          },
        },
      },
    },
    addTypename: false,
  }),
});

const mutate = async (queryString, variables = {}, headers = {}) => {
  const queryBody = queryString?.loc?.source?.body;
  const httpTrace = await PerformanceLib.traceHttpRequest('queryBody', 'POST');
  try {
    if (__DEV__) {
      console.info('***** GraphQL mutation', {
        queryString: queryBody,
        variables: variables,
      });
    }
    let response = await client.mutate({
      mutation: queryString,
      variables,
      context: {
        headers,
      },
      fetchPolicy: 'network-only',
    });
    if (__DEV__) {
      console.info('***** GraphQL mutation response', response);
    }
    httpTrace.setHttpResponseCode(200);
    PerformanceLib.endTrace(httpTrace);
    return response;
  } catch (error) {
    if (__DEV__) {
      console.info('***** GraphQL mutation error', {
        queryString: queryBody,
        variables: variables,
        error,
      });
    }
    httpTrace.setHttpResponseCode(400);
    PerformanceLib.endTrace(httpTrace);
    if (error?.networkError?.result?.errors) {
      throw error?.networkError?.result?.errors;
    }
    if (error?.networkError) {
      throw [
        {
          message: error?.networkError?.message || 'internalServerError',
        },
      ];
    }
    if (error && error?.graphQLErrors?.length) {
      throw error.graphQLErrors;
    }
    if (error && error?.clientErrors?.length) {
      throw error.clientErrors;
    }
    throw error;
  }
};

const query = async (queryString, variables = {}, headers = {}) => {
  const queryBody = queryString?.loc?.source?.body;
  const httpTrace = await PerformanceLib.traceHttpRequest('queryBody', 'GET');
  try {
    if (__DEV__) {
      console.info('***** GraphQL query', {
        queryString: queryBody,
        variables: variables,
      });
    }
    let response = await client.query({
      query: queryString,
      variables,
      context: {
        headers,
      },
      fetchPolicy: 'network-only',
    });
    if (__DEV__) {
      console.info('***** GraphQL query response', response);
    }
    httpTrace.setHttpResponseCode(200);
    PerformanceLib.endTrace(httpTrace);
    return response;
  } catch (error) {
    if (__DEV__) {
      console.info('***** GraphQL query error', {
        queryString: queryBody,
        variables: variables,
        error,
      });
    }
    httpTrace.setHttpResponseCode(400);
    PerformanceLib.endTrace(httpTrace);
    if (error?.networkError?.result?.errors) {
      throw error?.networkError?.result?.errors;
    }
    if (error?.networkError) {
      throw [
        {
          message: error?.message || 'internalServerError',
        },
      ];
    }
    if (error && error?.graphQLErrors?.length) {
      throw error.graphQLErrors;
    }
    if (error && error?.clientErrors?.length) {
      throw error.clientErrors;
    }
    throw error;
  }
};

export { client, mutate, query };
