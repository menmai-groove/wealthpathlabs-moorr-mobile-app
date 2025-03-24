import { gql } from '@apollo/client';

const GET_CLIENT_QUERY = {
  label: 'MoneySmartsDashboard/GET_CLIENT_QUERY',
  query: gql`
    query Client($groups: [ComputeTotalGroups]) {
      me {
        _id
        client {
          _id
          computeTotal(groups: $groups) {
            groups {
              key
              total
            }
          }
        }
      }
    }
  `,
};

const GET_CHECKUP_REPORTING_QUERY = {
  label: 'MoneySmartsDashboard/GET_CHECKUP_REPORTING_QUERY',
  query: gql`
    query MoneyRollovers(
      $pagination: Pagination
      $sort: MoneyRolloverSortMap
      $filter: MoneyRolloverFilter
    ) {
      me {
        moneyRollovers(pagination: $pagination, sort: $sort, filter: $filter) {
          documents {
            _id
            startDate
            balances {
              _id
              credit
              primary
            }
            state
            checkupReporting {
              moneyInBreakdown {
                monthly {
                  groups {
                    key
                    total
                  }
                  total
                }
                yearly {
                  groups {
                    key
                    total
                  }
                  total
                }
              }
              moneyOutBreakdown {
                monthly {
                  groups {
                    key
                    total
                  }
                  total
                }
                yearly {
                  groups {
                    key
                    total
                  }
                  total
                }
              }
              moneyOutExpenseMonthlyBreakdown {
                monthlyTotal
                yearlyTotal
                key
                jar
              }
              moneyOutBorrowingsMonthlyBreakdown {
                key
                monthlyTotal
                yearlyTotal
              }
              totalMoneyIn {
                monthly
                yearly
              }
              totalMoneyOut {
                monthly
                yearly
              }
              totalTargetedSurplus {
                monthly
                yearly
              }
              weekly7DayFloatAllocation
              # weekly7DayFloatAllocation {
              #   yearly {
              #     groups {
              #       key
              #       total
              #     }
              #     total
              #   }
              #   monthly {
              #     groups {
              #       key
              #       total
              #     }
              #     total
              #   }
              # }
              reports {
                monthly {
                  accumulatedActualSurplus
                }
                yearly {
                  accumulatedActualSurplus
                }
              }
            }
            items {
              _id
              periodId
              name
              expenseId
              date
              amount
            }
            getProvisionsjar {
              provisions {
                expense {
                  name
                  _id
                }
                totalAmount
                spentAmount
                remainingAmount
                transactions {
                  _id
                  name
                  date
                  amount
                  periodId
                  expenseId
                  expenseName
                }
              }
              summary {
                totalAmount
                spentAmount
                remainingAmount
              }
              previousProvisions {
                expense {
                  _id
                  name
                }
                archivedAndPreviousDateRange {
                  from
                  to
                }
                remainingAmount
                spentAmount
                totalAmount
                transactions {
                  _id
                  name
                  date
                  amount
                  periodId
                  expenseId
                  expenseName
                }
                isArchived
              }
              previousSummary {
                spentAmount
                remainingAmount
                totalAmount
              }
            }
          }
        }
      }
    }
  `,
};

const DELETE_TRANSACTION_QUERY = {
  label: 'MoneySmartsDashboard/DELETE_TRANSACTION_QUERY',
  query: gql`
    mutation ($documentID: NewOrObjectId!, $id: NewOrObjectId!, $expenseId: NewOrObjectId!) {
      me {
        moneyRollovers {
          update(
            data: { _id: $documentID, items: [{ _id: $id, expenseId: $expenseId, _delete: true }] }
          ) {
            _id
            startDate
            items {
              _id
              name
              date
              amount
            }
            state
          }
        }
      }
    }
  `,
};

const ADD_EDIT_TRANSACTION_QUERY = {
  label: 'MoneySmartsDashboard/ADD_EDIT_TRANSACTION_QUERY',
  query: gql`
    mutation (
      $documentID: NewOrObjectId!
      $expenseId: NewOrObjectId!
      $name: String
      $date: Date
      $amount: Float
      $id: NewOrObjectId!
    ) {
      me {
        moneyRollovers {
          update(
            data: {
              _id: $documentID
              items: [
                { _id: $id, name: $name, date: $date, amount: $amount, expenseId: $expenseId }
              ]
            }
          ) {
            _id
            startDate
            items {
              _id
              expenseId
              name
              date
              amount
            }
            state
          }
        }
      }
    }
  `,
};

export {
  GET_CLIENT_QUERY,
  GET_CHECKUP_REPORTING_QUERY,
  ADD_EDIT_TRANSACTION_QUERY,
  DELETE_TRANSACTION_QUERY,
};
