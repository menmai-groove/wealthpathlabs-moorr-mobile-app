import { gql } from '@apollo/client';

export const GET_FINANCIAL_SUMMARY_QUERY = {
  label: 'FinancialDashboard/GET_FINANCIAL_SUMMARY_QUERY',
  query: gql`
    query queryFinancialSummary {
      me {
        financialDashboard {
          income {
            total #1
            breakdown {
              key
              amount
            }
          }
          #5
          borrowings {
            total
            breakdown {
              key
              amount
            }
          }
          #4
          assets {
            total
            breakdown {
              key
              amount
            }
          }
          #3
          expenses {
            total
            breakdown {
              key
              amount
            }
          }
        }
        client {
          assets {
            properties {
              _id
              currentValue
              name
              address {
                unit
                number
                street
              }
            }
          }
        }
      }
    }
  `,
};

export const GET_FINANCIAL_LIST_QUERY = {
  label: 'FinancialDashboard/GET_FINANCIAL_LIST_QUERY',
  query: gql`
    query queryFinancialList(
      $searchKey: String
      $filter: FilterItemsType
      $desc: Boolean
      $pagination: Pagination
    ) {
      me {
        financialDashboard(
          searchKey: $searchKey
          filter: $filter
          desc: $desc
          pagination: $pagination
        ) {
          pageSize # no. of items in a page
          total # no. of overall items
          page # current page
          totalPages # no. of total pages
          data {
            item {
              id
              name #9
              amount #7
              frequency #8
              jar #10
              type #6 - used for the label
              typeValue # - the actual value
              currentRepayments #11
              repaymentFrequency #12
              totalAssetIncome #14
              assetId
              annualAmount # just incase you need it
              isArchived
              archivedDate
              linkedIncomeExpenses {
                _id
                type
                name
                amount
              }
            }
            type
            cards {
              item {
                id
                name #9
                amount #7
                frequency #8
                jar #10
                type #6 - used for the label
                typeValue # - the actual value
                currentRepayments #11
                repaymentFrequency #12
                totalAssetIncome #14
                assetId
                annualAmount # just incase you need it
                isArchived
                archivedDate
                linkedIncomeExpenses {
                  _id
                  type
                  name
                  amount
                }
              }
              type
            }
          }
        }
      }
    }
  `,
};

export const GET_FILTER_FIELDS_QUERY = {
  label: 'FinancialDashboard/GET_FILTER_FIELDS_QUERY',
  query: gql`
    query queryFinancialFilterListType {
      me {
        financialDashboardFilters {
          assets {
            label
            value
          }
          borrowings {
            label
            value
            tags
          }
          expenses {
            label
            value
          }
          income {
            label
            value
          }
        }
      }
    }
  `,
};

export const DELETE_FINANCIAL_CARD_MUTATION = {
  label: 'FinancialDashboard/DELETE_FINANCIAL_CARD_MUTATION',
  query: gql`
    mutation mutationDeleteFinancialCards($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            _id
          }
        }
      }
    }
  `,
};

export const INVESTMENT_INFO_QUERY = {
  label: 'FinancialDashboard/INVESTMENT_INFO_QUERY',
  query: gql`
    query queryInvestmentInfo($ids: [ObjectId!]) {
      me {
        client {
          assets {
            investments(ids: $ids) {
              _id
              name
              type
              expenses
              adHocIncome
              income
            }
          }
        }
      }
    }
  `,
};
export const PROPERTIES_INFO_QUERY = {
  label: 'FinancialDashboard/PROPERTIES_INFO_QUERY',
  query: gql`
    query queryPropertiesInfo($ids: [ObjectId!]) {
      me {
        client {
          assets {
            properties(ids: $ids) {
              _id
              name
              expenses
              adhocIncome
              income
            }
          }
        }
      }
    }
  `,
};

export const ARCHIVE_FINANCIAL_CARD_MUTATION = {
  label: 'FinancialDashboard/ARCHIVE_FINANCIAL_CARD_MUTATION',
  query: gql`
    mutation archiveCard($cardId: ObjectId!, $asAt: Date!) {
      me {
        historicalTracking {
          archiveCard(cardId: $cardId, asAt: $asAt) {
            success
          }
        }
      }
    }
  `,
};

export const DELETE_FINANCIAL_CARD_2_MUTATION = {
  label: 'FinancialDashboard/DELETE_FINANCIAL_CARD_2_MUTATION',
  query: gql`
    mutation deleteCard($cardId: ObjectId!) {
      me {
        historicalTracking {
          deleteCard(cardId: $cardId) {
            success
          }
        }
      }
    }
  `,
};

export const RESTORE_FINANCIAL_CARD_MUTATION = {
  label: 'FinancialDashboard/RESTORE_FINANCIAL_CARD_MUTATION',
  query: gql`
    mutation restoreCard($cardId: ObjectId!, $asAt: Date!) {
      me {
        historicalTracking {
          restoreCard(cardId: $cardId, asAt: $asAt) {
            success
          }
        }
      }
    }
  `,
};

export const GET_LATEST_AS_AT_QUERY = {
  label: 'FinancialDashboard/GET_LATEST_AS_AT_QUERY',
  query: gql`
    mutation getLatestAsAt($cardId: ObjectId!) {
      me {
        historicalTracking {
          latestAsAt(cardId: $cardId) {
            latestAsAt
          }
        }
      }
    }
  `,
};

export const UPDATE_NEXT_PAY_DATE_START_MUTATION = {
  label: 'FinancialDashboard/UPDATE_NEXT_PAY_DATE',
  query: gql`
    mutation MeMutation(
      $data: ClientUpdateData!
      $includeIncome: Boolean!
      $includeExpenses: Boolean!
      $includeAssets: Boolean!
      $includeBorrowings: Boolean!
    ) {
      me {
        client {
          update(data: $data) {
            income @include(if: $includeIncome) {
              _id
              nextPayDate
              nextPayDateStart
            }
            expenses @include(if: $includeExpenses) {
              _id
              nextDueDate
              nextDueDateStart
            }
            assets @include(if: $includeAssets) {
              investments {
                _id
                nextContributionDate
                nextContributionDateStart
              }
              superFunds {
                _id
                nextContributionClient1Date
                nextContributionClient1DateStart
                nextContributionClient2Date
                nextContributionClient2DateStart
              }
            }
            borrowings @include(if: $includeBorrowings) {
              _id
              nextRepaymentDate
              nextRepaymentDateStart
            }
          }
        }
      }
    }
  `,
};
