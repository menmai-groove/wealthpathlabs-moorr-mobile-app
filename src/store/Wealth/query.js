import { gql } from '@apollo/client';

const previousDate = `
  previousDate {
    cashflowSpeed {
      incomeSpeed {
        client1
        client2
        householdIncomeSpeed
      }
      spendingSpeed
      workingIncomeSpeed {
        client1
        client2
        householdWorkingIncomeSpeed
      }
      rentalIncomeSpeed {
        client1
        client2
        householdRentalIncomeSpeed
      }
      investmentIncomeSpeed {
        client1
        client2
        householdInvestmentIncomeSpeed
      }
      passiveIncomeSpeed {
        client1
        client2
        householdPassiveIncomeSpeed
      }
      savingSpeed
    }
    investmentSpeed {
      personalPropertyValueSpeed {
        client1
        client2
        householdPersonalPropertyValueSpeed
      }
      investmentPropertyValueSpeed {
        client1
        client2
        householdInvestmentPropertyValueSpeed
      }
      otherInvestmentValueSpeed {
        client1
        client2
        householdOtherInvestmentValueSpeed
      }
      superannuationSpeed {
        client1
        client2
        householdSuperannuationSpeed
      }
      debtReductionSpeed
      assetSpeed
    }
    nestEggSPEED
    netWorthPosition {
      assets {
        breakdown {
          superannuation
          properties
          bankAccounts
          vehicles
          investments
          otherAssets
        }
        totalAssets
      }
      liabilities {
        breakdown {
          personalPropertyLoans
          investmentPropertyLoans
          otherLoans
        }
        totalLiabilities
      }
      netWorth
    }
    wealthCLOCK
    wealthSPEED
  }  
`;

const definitions = `
  cashflowSpeed {
    definitions {
      incomeSpeed
      spendingSpeed
      workingIncomeSpeed
      rentalIncomeSpeed
      investmentIncomeSpeed
      passiveIncomeSpeed
      savingSpeed
    }
  }
  investmentSpeed {
    definitions {
      personalPropertyValueSpeed
      investmentPropertyValueSpeed
      otherInvestmentValueSpeed
      superannuationSpeed
      debtReductionSpeed
      assetSpeed
    }
  }
  definitions {
    assetSpeed
    debtReductionSpeed
    wealthCLOCK
    wealthSPEED
    nestEggSPEED
  }
`;

const UPDATE_CASHFLOW_SPEED_QUERY = {
  label: 'Wealth/UPDATE_CASHFLOW_SPEED_QUERY',
  query: gql`
    mutation CashflowSpeed($generate: Boolean) {
      me {
        client {
          wealthSpeed {
            cashflowSpeed {
              incomeSpeed(generate: $generate) {
                client1
                client2
                householdIncomeSpeed
              }
              spendingSpeed(generate: $generate)
              workingIncomeSpeed(generate: $generate) {
                client1
                client2
                householdWorkingIncomeSpeed
              }
              rentalIncomeSpeed(generate: $generate) {
                client1
                client2
                householdRentalIncomeSpeed
              }
              investmentIncomeSpeed(generate: $generate) {
                client1
                client2
                householdInvestmentIncomeSpeed
              }
              passiveIncomeSpeed(generate: $generate) {
                client1
                client2
                householdPassiveIncomeSpeed
              }
              savingSpeed(generate: $generate)
              spendingSpeed(generate: $generate)
            }
            historicalData {
              ${previousDate}   
              changesDiff {
                cashflowSpeed {
                  incomeSpeed {
                    client1
                    client2
                    householdIncomeSpeed
                  }
                  spendingSpeed
                  workingIncomeSpeed {
                    client1
                    client2
                    householdWorkingIncomeSpeed
                  }
                  rentalIncomeSpeed {
                    client1
                    client2
                    householdRentalIncomeSpeed
                  }
                  investmentIncomeSpeed {
                    client1
                    client2
                    householdInvestmentIncomeSpeed
                  }
                  passiveIncomeSpeed {
                    client1
                    client2
                    householdPassiveIncomeSpeed
                  }
                  savingSpeed
                  spendingSpeed
                }
                investmentSpeed {
                  assetSpeed
                  debtReductionSpeed
                  investmentPropertyValueSpeed {
                    client1
                    client2
                    householdInvestmentPropertyValueSpeed
                  }
                  personalPropertyValueSpeed {
                    client1
                    client2
                    householdPersonalPropertyValueSpeed
                  }
                  superannuationSpeed {
                    householdSuperannuationSpeed
                  }
                  otherInvestmentValueSpeed {
                    client1
                    client2
                    householdOtherInvestmentValueSpeed
                  }
                  superannuationSpeed {
                    client1
                    client2
                    householdSuperannuationSpeed
                  }
                }
                wealthCLOCK
                wealthSPEED
                nestEggSPEED
              }
            }
            generatedDate(generate: $generate)

            wealthCLOCK(generate: $generate)
            wealthSPEED(generate: $generate)
            nestEggSPEED(generate: $generate)

            investmentSpeed {
              assetSpeed
              debtReductionSpeed(generate: $generate) 
              investmentPropertyValueSpeed(generate: $generate) {
                client1
                client2
                householdInvestmentPropertyValueSpeed
              }
              otherInvestmentValueSpeed(generate: $generate) {
                client1
                client2
                householdOtherInvestmentValueSpeed
              }
              investmentPropertyValueSpeed(generate: $generate) {
                client1
                client2
                householdInvestmentPropertyValueSpeed
              }
              personalPropertyValueSpeed(generate: $generate) {
                client1
                client2
                householdPersonalPropertyValueSpeed
              }
              superannuationSpeed(generate: $generate) {
                client1
                client2
                householdSuperannuationSpeed
              }
            }
            netWorthPosition(generate: $generate) {
              liabilities {
                breakdown {
                  personalPropertyLoans
                  investmentPropertyLoans
                  otherLoans
                }
                totalLiabilities
              }
              assets {
                breakdown {
                  superannuation
                  properties
                  bankAccounts
                  vehicles
                  investments
                  otherAssets
                }
                totalAssets
              }
              netWorth
            }
            ${definitions}
            wealthPositionDetails {
              annualSurplusCashflow
              loanValuationRatio
              availableEquity
            }
          }
        }
      }
    }
  `,
};

const getHistoryWealthSpeedQuery = key => {
  return {
    label: 'Wealth/GET_HISTORY_OF_WEALTH_DATA',
    query: gql`
      mutation GetWealthSpeedData($range: String) {
        me {
          client {
            wealthSpeed {
              historicalData {
                rangeStart(range: $range)
                rangeEnd
                ${previousDate}     
                wealthSpeedData(range: $range) {
                  _id
                  generatedDate
                  clientUID
                  ${key}
                }
              }
            }
          }
        }
      }
    `,
  };
};

const GET_HISTORY_OF_WEALTH_CLOCK = {
  label: 'Wealth/GET_HISTORY_OF_WEALTH_CLOCK',
  query: gql`
    mutation GetWealthCLOCKData($range: String) {
      me {
        client {
          wealthSpeed {
            historicalData {
              ${previousDate}
              wealthSpeedData(range: $range) {
                _id
                generatedDate
                clientUID
                wealthCLOCK
                netWorthPosition {
                  netWorth
                }
              }
            }
          }
        }
      }
    }
  `,
};

const NET_WORTH_POSITION_MUTATION = {
  label: 'Wealth/NET_WORTH_POSITION_MUTATION',
  query: gql`
    mutation NetWorthPosition($range: String) {
      me {
        client {
          wealthSpeed {
            historicalData {
              rangeStart(range: $range)
              rangeEnd
              wealthSpeedData(range: $range) {
                _id
                generatedDate
                netWorthPosition {
                  assets {
                    breakdown {
                      superannuation
                      properties
                      bankAccounts
                      vehicles
                      investments
                      otherAssets
                    }
                    totalAssets
                  }
                  liabilities {
                    breakdown {
                      personalPropertyLoans
                      investmentPropertyLoans
                      otherLoans
                    }
                    totalLiabilities
                  }
                  netWorth
                }
              }
            }
          }
        }
      }
    }
  `,
};

export {
  UPDATE_CASHFLOW_SPEED_QUERY,
  GET_HISTORY_OF_WEALTH_CLOCK,
  getHistoryWealthSpeedQuery,
  NET_WORTH_POSITION_MUTATION,
};
