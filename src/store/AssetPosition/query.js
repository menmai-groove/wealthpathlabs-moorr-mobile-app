import { gql } from '@apollo/client';

const GET_ASSET_POSITION_QUERY = {
  label: 'AssetPosition/GET_ASSET_POSITION_QUERY',
  query: gql`
    query QueryAssetPosition($query: GraphQuery!) {
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

export { GET_ASSET_POSITION_QUERY };
