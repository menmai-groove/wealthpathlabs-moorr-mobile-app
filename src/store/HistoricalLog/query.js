const { gql } = require('@apollo/client');

const GET_HISTORICAL_LOG = {
  label: 'HistoricalLog/GET_HISTORICAL_LOG',
  query: gql`
    query TrackingList(
      $cardId: ObjectId!
      $childCardId: ObjectId
      $field: String!
      $sortOrder: Int
      $excludeArchive: Boolean
    ) {
      me {
        historicalTracking {
          getValues(
            cardId: $cardId
            childCardId: $childCardId
            field: $field
            sortOrder: $sortOrder
            excludeArchive: $excludeArchive
          ) {
            values {
              id
              cardId
              childCardId
              field
              index
              asAt
              stringValue
              numberValue
              ownershipId
              frequency
              frequencyName
              updateType
            }
            ownershipDetails {
              _id
              ownershipType
              owners {
                owner
                percentage
              }
              ownershipAsAt
              ownershipDesc
            }
          }
          archiveDates(cardId: $cardId, sortOrder: $sortOrder) {
            values {
              actionType
              asAt
              cardArchiveId
              cardId
            }
          }
        }
      }
    }
  `,
};

const ADD_HISTORICAL_LOG_NUMBER_MUTATION = {
  label: 'HistoricalLog/ADD_HISTORICAL_LOG_NUMBER',
  query: gql`
    mutation AddNumber(
      $cardId: ObjectId!
      $field: String!
      $asAt: Date!
      $value: Float!
      $childCardId: ObjectId
      $frequencyName: String
    ) {
      me {
        historicalTracking {
          addNumber(
            cardId: $cardId
            field: $field
            asAt: $asAt
            value: $value
            childCardId: $childCardId
            frequencyName: $frequencyName
          ) {
            success
            refreshCard
            message
          }
        }
      }
    }
  `,
};

const ADD_HISTORICAL_LOG_NUMBER_FREQUENCY_MUTATION = {
  label: 'HistoricalLog/ADD_HISTORICAL_LOG_NUMBER_FREQUENCY',
  query: gql`
    mutation AddNumberFrequency(
      $cardId: ObjectId!
      $field: String!
      $asAt: Date!
      $value: Float!
      $frequencyName: String
      $childCardId: ObjectId
    ) {
      me {
        historicalTracking {
          addNumber(
            cardId: $cardId
            field: $field
            asAt: $asAt
            value: $value
            frequencyName: $frequencyName
            childCardId: $childCardId
          ) {
            success
            refreshCard
            message
          }
        }
      }
    }
  `,
};

const ADD_HISTORICAL_LOG_STRING_MUTATION = {
  label: 'HistoricalLog/ADD_HISTORICAL_LOG_STRING',
  query: gql`
    mutation AddString(
      $cardId: ObjectId!
      $field: String!
      $asAt: Date!
      $value: String!
      $childCardId: ObjectId
    ) {
      me {
        historicalTracking {
          addString(
            cardId: $cardId
            field: $field
            asAt: $asAt
            value: $value
            childCardId: $childCardId
          ) {
            success
            refreshCard
            message
          }
        }
      }
    }
  `,
};

const ADD_HISTORICAL_LOG_OWNERSHIP_MUTATION = {
  label: 'HistoricalLog/ADD_HISTORICAL_LOG_OWNERSHIP',
  query: gql`
    mutation AddOwnership(
      $cardId: ObjectId!
      $field: String!
      $asAt: Date!
      $value: OwnershipInput!
      $childCardId: ObjectId
    ) {
      me {
        historicalTracking {
          addOwnership(
            cardId: $cardId
            field: $field
            asAt: $asAt
            value: $value
            childCardId: $childCardId
          ) {
            success
            refreshCard
            message
          }
        }
      }
    }
  `,
};

const ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION = {
  label: 'HistoricalLog/ADD_HISTORICAL_LOG_OBJECT_IDS',
  query: gql`
    mutation AddObjectIds(
      $cardId: ObjectId!
      $field: String!
      $asAt: Date!
      $values: [String]!
      $childCardId: ObjectId
    ) {
      me {
        historicalTracking {
          addObjectIds(
            cardId: $cardId
            field: $field
            asAt: $asAt
            values: $values
            childCardId: $childCardId
          ) {
            success
            refreshCard
            message
          }
        }
      }
    }
  `,
};

const DELETE_HISTORICAL_LOG_QUERY = {
  label: 'HistoricalLog/DELETE_HISTORICAL_LOG',
  query: gql`
    query DeleteTracking(
      $cardId: ObjectId!
      $childCardId: ObjectId
      $field: String!
      $asAt: Date!
    ) {
      me {
        historicalTracking {
          delete(cardId: $cardId, childCardId: $childCardId, field: $field, asAt: $asAt) {
            success
            refreshCard
          }
        }
      }
    }
  `,
};

export {
  GET_HISTORICAL_LOG,
  ADD_HISTORICAL_LOG_NUMBER_MUTATION,
  ADD_HISTORICAL_LOG_NUMBER_FREQUENCY_MUTATION,
  ADD_HISTORICAL_LOG_STRING_MUTATION,
  ADD_HISTORICAL_LOG_OWNERSHIP_MUTATION,
  ADD_HISTORICAL_LOG_OBJECT_IDS_MUTATION,
  DELETE_HISTORICAL_LOG_QUERY,
};
