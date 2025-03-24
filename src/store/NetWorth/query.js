import { gql } from '@apollo/client';

const GET_NET_WORTH_QUERY = {
  label: 'NetWorth/GET_NET_WORTH_QUERY',
  query: gql`
    query QueryNetWorth($query: GraphQuery!) {
      me {
        insights {
          graph(query: $query) {
            dataSets {
              id
              values {
                value
                date
              }
              type
              dataset
            }
          }
        }
      }
    }
  `,
};

export { GET_NET_WORTH_QUERY };
