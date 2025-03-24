const { gql } = require('@apollo/client');

const GET_MONTHLY_CHECKUP = {
  label: 'MonthlyCheckUp/GET_MONTHLY_CHECKUP',
  query: gql`
    query MoneyRollovers(
      $pagination: Pagination
      $sort: MoneyRolloverSortMap
      $filter: MoneyRolloverFilter
    ) {
      me {
        moneyRollovers(pagination: $pagination, sort: $sort, filter: $filter) {
          page
          total
          limit
          documents {
            _id
            startDate
            endDate
            state
            isAsAtCurrentDate
            balancesAsAt {
              checkupBalances {
                bankAccounts {
                  amount
                  cardId
                  _id
                  isLegacy
                  name
                }
                checkupDate
                creditCards {
                  amount
                  cardId
                  isLegacy
                  _id
                  name
                }
                isLegacyCheckupDate
                totalBankAccountAmt
                totalCreditCardAmt
              }
              checkupDates
              totalCheckupsBalances {
                checkupDate
                credit
                primary
              }
            }
            balances {
              _id
              credit
              primary
            }
            getProvisionsjar {
              summary {
                totalAmount
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
            checkupReporting {
              totalMoneyOut {
                monthly
                yearly
              }
              reports {
                monthly {
                  primaryAccountBalance
                  creditCardBalance
                  cashPosition
                  cashPositionOpening
                  cashPositionEnding
                  changeInCashPosition
                  provisioningSpent
                  monthlyAllocatedProvisionsSpending
                  yearlyRemainingProvisioningTotal
                  accumulatedActualSurplus
                  monthlyActualSurplus
                  targetedMonthlySurplus
                  rollingTargetedSurplus
                  monthlyExcessSurplus
                  accumulatedExcessSurplus
                  shiftedMonthlyOut # Savings Flag in Regular Spending charts
                  shiftedMoneyOut # Spending Flag in Regular Spending charts
                }
                yearly {
                  accumulatedActualSurplus
                }
              }
            }
            getProvisionsMonthlySpending {
              month
              amount
            }
            getYearlyRemainingProvisions {
              amount
              month
            }
          }
        }
      }
    }
  `,
};

const UPDATE_MONTHLY_CHECKUP = {
  label: 'MonthlyCheckUp/UPDATE_MONTHLY_CHECKUP',
  query: gql`
    mutation MoneyRollovers($data: [MoneyRolloverInput]!) {
      me {
        moneyRollovers {
          update(data: $data) {
            _id
            balances {
              _id
              credit
              primary
            }
            startDate
            state
            balancesAsAt {
              checkupBalances {
                bankAccounts {
                  amount
                  cardId
                  _id
                  isLegacy
                  name
                }
                checkupDate
                creditCards {
                  amount
                  cardId
                  isLegacy
                  _id
                  name
                }
                isLegacyCheckupDate
                totalBankAccountAmt
                totalCreditCardAmt
              }
              checkupDates
              totalCheckupsBalances {
                checkupDate
                credit
                primary
              }
            }
          }
        }
      }
    }
  `,
};

const FIND_BALANCES_AS_AT = {
  label: 'MonthlyCheckUp/FIND_BALANCES_AS_AT',
  query: gql`
    query findBalancesAsAt($filter: MoneyRolloverFilter) {
      me {
        moneyRollovers(filter: $filter) {
          documents {
            _id
            startDate
            balances {
              _id
              credit
              primary
            }
            balancesAsAt {
              checkupBalances {
                bankAccounts {
                  amount
                  cardId
                  _id
                  isLegacy
                  name
                }
                checkupDate
                creditCards {
                  amount
                  cardId
                  isLegacy
                  _id
                  name
                }
                isLegacyCheckupDate
                totalBankAccountAmt
                totalCreditCardAmt
              }
              checkupDates
              totalCheckupsBalances {
                checkupDate
                credit
                primary
              }
            }
          }
        }
      }
    }
  `,
};

const MUTATION_CHANGE_START_DATE = {
  label: 'MonthlyCheckUp/CHANGE_START_DATE',
  query: gql`
    mutation ($data: [MoneyRolloverInput]!) {
      me {
        moneyRollovers {
          update(data: $data) {
            startDate
          }
        }
      }
    }
  `,
};

const GET_MONNEYSMART_TRACKED_CARDS = {
  label: 'MonthlyCheckUp/GET_MONNEYSMART_TRACKED_CARDS',
  query: gql`
    query getMoneySmartsTrackedCards($date: Date, $filter: MoneyRolloverFilter) {
      me {
        moneyRollovers(filter: $filter) {
          documents {
            getMoneySmartsTrackedCards(date: $date) {
              _id
              name
              type
            }
          }
        }
      }
    }
  `,
};
const HISTORICAL_TRACKING_ADD_NUMBERS_QUERY = {
  label: 'MonthlyCheckUp/HISTORICAL_TRACKING_ADD_NUMBERS',
  query: gql`
    mutation historicalTrackingAddNumbers(
      $historicalNumberChangeInput: [HistoricalNumberChangeInput]
    ) {
      me {
        historicalTracking {
          addNumbers(historicalNumberChangeInput: $historicalNumberChangeInput) {
            message
            refreshCard
            success
          }
        }
      }
    }
  `,
};

const MUTATION_ROLLOVER_CHECKUP = {
  label: 'MonthlyCheckUp/ROLLOVER_CHECKUP',
  query: gql`
    mutation ($startDate: String!, $endDate: String) {
      me {
        rollover(startDate: $startDate, endDate: $endDate)
      }
    }
  `,
};

const QUERY_GET_MONEY_SMARTS_TRACKING_CARDS = {
  label: 'MonthlyCheckUp/GET_MONEY_SMARTS_TRACKING_CARDS',
  query: gql`
    query GetMoneySMARTSTrackingCards {
      me {
        client {
          assets {
            bankAccounts {
              _id
              name
              balance
              accountType
              isTrackedInMoneySmarts
              isArchived
            }
          }
          borrowings {
            _id
            name
            outstanding
            type
            isTrackedInMoneySmarts
            isArchived
          }
        }
        moneyRollovers {
          documents {
            _id
            startDate
            state
          }
        }
      }
    }
  `,
};

const MUTATION_UPDATE_MONEY_SMARTS_TRACKING_CARDS = {
  label: 'MonthlyCheckUp/UPDATE_MONEY_SMARTS_TRACKING_CARDS',
  query: gql`
    mutation UpdateMoneySMARTSTrackingCards($updateData: ClientUpdateData!) {
      me {
        client {
          update(data: $updateData) {
            assets {
              bankAccounts {
                _id
              }
            }
            borrowings {
              _id
            }
          }
        }
      }
    }
  `,
};

export {
  GET_MONTHLY_CHECKUP,
  UPDATE_MONTHLY_CHECKUP,
  FIND_BALANCES_AS_AT,
  GET_MONNEYSMART_TRACKED_CARDS,
  HISTORICAL_TRACKING_ADD_NUMBERS_QUERY,
  MUTATION_CHANGE_START_DATE,
  MUTATION_ROLLOVER_CHECKUP,
  QUERY_GET_MONEY_SMARTS_TRACKING_CARDS,
  MUTATION_UPDATE_MONEY_SMARTS_TRACKING_CARDS,
};
