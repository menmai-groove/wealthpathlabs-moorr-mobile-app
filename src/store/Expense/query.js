const { gql } = require('@apollo/client');

const SUBMIT_NEW_EXPENSE_MUTATION = {
  label: 'Expense/SUBMIT_NEW_EXPENSE_MUTATION',
  query: gql`
    mutation SUBMIT_NEW_EXPENSE_MUTATION($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            expenses {
              _id
              name
              holdingCostName
              essentialAmount
              discretionaryAmount
              isArchived
              archivedDate
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
              }
              frequency
              expenseGroup
              category
              isTaxDeductable
              billPaymentReminder
              jar
              note
            }
          }
        }
      }
    }
  `,
};

const GET_GROUP_EXPENSES_DATA_QUERY = {
  label: 'Expense/GET_GROUP_EXPENSES_DATA_QUERY',
  query: gql`
    query GET_GROUP_EXPENSES_DATA_QUERY($ids: [ObjectId!], $assetIds: [ObjectId!]) {
      me {
        client {
          expenses(ids: $ids) {
            _id
            category
            essentialAmount
            frequency
            jar
            type
            isTaxDeductable
            discretionaryAmount
            billPaymentReminder
            holdingCostName
            investmentAssetBills
            property
            note
            name
            expenseGroup
            ownership {
              ownershipDesc
              ownershipType
              owners {
                _id
                owner
                percentage
              }
            }
            jarAsAt
            isArchived
            archivedDate
            nextDueDate
            nextDueDateStart
          }
          assets {
            investments(ids: $assetIds) {
              _id
              name
              expenses
              ownership {
                ownershipDesc
                ownershipType
                owners {
                  _id
                  owner
                  percentage
                }
              }
              isArchived
              archivedDate
            }
            properties(ids: $assetIds) {
              _id
              name
              expenses
              ownership {
                ownershipDesc
                ownershipType
                owners {
                  _id
                  owner
                  percentage
                }
              }
              isArchived
              archivedDate
            }
          }
        }
      }
    }
  `,
};

const SUBMIT_UPDATE_GROUP_EXPENSES_MUTATION = assetType => ({
  label: 'Expense/SUBMIT_UPDATE_GROUP_EXPENSES_MUTATION',
  query: gql`
    mutation SUBMIT_UPDATE_GROUP_EXPENSES_MUTATION(
      $data: ClientUpdateData!
      $assetIds: [ObjectId!]
    ) {
      me {
        client {
          update(data: $data) {
            assets {
              ${assetType}(ids: $assetIds) {
                _id
                name
                expenses
              }
            }
          }
        }
      }
    }
  `,
});

const GET_EXPENSES_DATA_QUERY = {
  label: 'Expense/GET_EXPENSES_DATA_QUERY',
  query: gql`
    query GET_EXPENSES_DATA_QUERY($ids: [ObjectId!]) {
      me {
        client {
          expenses(ids: $ids) {
            _id
            category
            essentialAmount
            frequency
            jar
            type
            isTaxDeductable
            discretionaryAmount
            billPaymentReminder
            holdingCostName
            note
            name
            investmentAssetBills
            property
            expenseGroup
            ownership {
              ownershipDesc
              ownershipType
              owners {
                _id
                owner
                percentage
              }
              ownershipAsAt
            }
            categoryAsAt
            amountAsAt
            isTaxDeductableAsAt
            jarAsAt
            isArchived
            archivedDate
            nextDueDate
            nextDueDateStart
          }
        }
      }
    }
  `,
};

export {
  SUBMIT_NEW_EXPENSE_MUTATION,
  SUBMIT_UPDATE_GROUP_EXPENSES_MUTATION,
  GET_GROUP_EXPENSES_DATA_QUERY,
  GET_EXPENSES_DATA_QUERY,
};
