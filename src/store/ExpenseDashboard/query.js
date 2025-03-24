import { gql } from '@apollo/client';

export const GET_FINANCIAL_LIST_QUERY = {
  label: 'ExpenseDashboard/GET_FINANCIAL_LIST_QUERY',
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
  label: 'ExpenseDashboard/GET_FILTER_FIELDS_QUERY',
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
  label: 'ExpenseDashboard/DELETE_FINANCIAL_CARD_MUTATION',
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
  label: 'ExpenseDashboard/INVESTMENT_INFO_QUERY',
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
  label: 'ExpenseDashboard/PROPERTIES_INFO_QUERY',
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

export const GET_GROUPING_AND_ITEMS_QUERY = {
  label: 'ExpenseDashboard/GET_GROUPING_AND_ITEMS_QUERY',
  query: gql`
    query ExpensesDashboard($frequency: FrequencyEnum, $sortType: SortType, $desc: Boolean) {
      me {
        expensesDashboard(
          frequency: $frequency
          pagination: { page: 1, limit: 999999 }
          sortType: $sortType
          desc: $desc
        ) {
          grouping {
            breakdown {
              amount
              key
            }
            page
            pageSize
            total
            totalPages
          }
          targetedExpenses

          items {
            breakdown {
              amount
              key
            }
            page
            pageSize
            total
            totalPages
          }
        }
      }
    }
  `,
};

export const GET_BREAKDƠN_ITEMS_QUERY = {
  label: 'ExpenseDashboard/GET_BREAKDƠN_ITEMS_QUERY',
  query: gql`
    query ExpensesDashboard(
      $frequency: FrequencyEnum
      $pagination: Pagination
      $sortType: SortType
      $desc: Boolean
      $type: ItemTypeEnum
      $key: String
    ) {
      me {
        expensesDashboardItems(
          frequency: $frequency
          pagination: $pagination
          sortType: $sortType
          desc: $desc
          type: $type
          key: $key
        ) {
          data {
            _id
            amount
            name
            assetId
            type
            typeValue
          }
          page
          pageSize
          total
          totalPages
        }
      }
    }
  `,
};
