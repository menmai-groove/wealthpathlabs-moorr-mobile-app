import { gql } from '@apollo/client';

const GET_DEBT_POSITION_QUERY = {
  label: 'DebtPosition/GET_DEBT_POSITION_QUERY',
  query: gql`
    query QueryDebtPosition($query: GraphQuery!) {
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

export { GET_DEBT_POSITION_QUERY };
