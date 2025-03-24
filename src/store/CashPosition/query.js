import { gql } from '@apollo/client';

const GET_CASH_POSITION_QUERY = {
  label: 'CashPosition/GET_CASH_POSITION_QUERY',
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

export { GET_CASH_POSITION_QUERY };
