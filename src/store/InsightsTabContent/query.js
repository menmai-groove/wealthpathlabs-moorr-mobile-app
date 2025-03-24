import { gql } from '@apollo/client';

const GET_HISTORICAL_VALUES_QUERY = {
  label: 'InsightsTabContent/GET_HISTORICAL_VALUES_QUERY',
  query: gql`
    query QueryHistoricalValues($query: GraphQuery!) {
      me {
        insights {
          graph(query: $query) {
            dataSets {
              id
              values {
                value
                date

                field
                cardId
                stringValue

                # metadata
                # frequency
                # frequencyName
                # updated
              }
            }
          }
        }
      }
    }
  `,
};

export { GET_HISTORICAL_VALUES_QUERY };
