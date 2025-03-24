import { gql } from '@apollo/client';

const ADD_NEW_ASSET_QUERY = {
  label: 'Asset/ADD_NEW_ASSET_QUERY',
  query: gql`
    mutation UpdateAsset($data: ClientUpdateData!) {
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

const GET_OTHER_ASSET_QUERY = {
  label: 'Asset/GET_OTHER_ASSET_QUERY',
  query: gql`
    query getDetailAsset($id: [ObjectId!]) {
      me {
        client {
          assets {
            otherAssets(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              value
              yearlyGrowth
              yearlyYield
              purchasePrice
              datePurchased
              notes
              valueAsAt
              isArchived
              archivedDate
            }
          }
        }
      }
    }
  `,
};

const GET_VEHICLE_QUERY = {
  label: 'Asset/GET_VEHICLE_QUERY',
  query: gql`
    query getDetailAsset($id: [ObjectId!]) {
      me {
        client {
          assets {
            vehicles(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              vehicleType
              manufacturer
              year
              value
              purchasePrice
              datePurchased
              notes
              valueAsAt
              isArchived
              archivedDate
            }
          }
        }
      }
    }
  `,
};

const GET_BANK_ACCOUNT_QUERY = {
  label: 'Asset/GET_BANK_ACCOUNT_QUERY',
  query: gql`
    query getDetailAsset($id: [ObjectId!]) {
      me {
        client {
          assets {
            bankAccounts(ids: $id) {
              _id
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              name
              accountType
              otherType
              balance
              interestRate
              institution
              last4
              isPrimary
              notes
              balanceAsAt
              interestRateAsAt
              isTrackedInMoneySmarts
              isTrackedInMoneySmartsAsAt
              isArchived
              archivedDate
            }
          }
        }
      }
    }
  `,
};

const GET_SUPER_FUND_QUERY = {
  label: 'Asset/GET_SUPER_FUND_QUERY',
  query: gql`
    query getDetailAsset($id: [ObjectId!]) {
      me {
        client {
          assets {
            superFunds(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              isSmsf
              value
              provider
              product
              strategy
              salarySacrificeBool
              salarySacrificeClient1
              salarySacrificeClient1Frequency
              salarySacrificeClient2
              salarySacrificeClient2Frequency
              personalContributionsBool
              personalContributionsClient1
              personalContributionsClient1Frequency
              personalContributionsClient2
              personalContributionsClient2Frequency
              notes
              salarySacrificeClient1AsAt
              salarySacrificeClient2AsAt
              personalContributionsClient1AsAt
              personalContributionsClient2AsAt
              valueAsAt
              isArchived
              archivedDate
              nextContributionClient1Date
              nextContributionClient1DateStart
              nextContributionClient2Date
              nextContributionClient2DateStart
            }
          }
        }
      }
    }
  `,
};

const GET_LIFE_INSURANCE_QUERY = {
  label: 'Asset/GET_LIFE_INSURANCE_QUERY',
  query: gql`
    query getDetailAsset($id: [ObjectId!]) {
      me {
        client {
          assets {
            lifeInsurance(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              value
              policyProvider
              purchasePrice
              datePurchased
              notes
              valueAsAt
              isArchived
              archivedDate
            }
          }
        }
      }
    }
  `,
};

const GET_PROPERTY_QUERY = {
  label: 'Asset/GET_PROPERTY_QUERY',
  query: gql`
    query getPropertyAsset($id: [ObjectId!], $assetIds: [ObjectId!], $propertyId: ObjectId!) {
      me {
        client {
          assets {
            properties(ids: $id) {
              _id
              name
              currentValue
              purpose
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              address {
                isManual
                formatted
                floor
                unit
                number
                street
                streetType
                postcode
                suburb
                state
                country
                longitude
                latitude
                gnafId
              }
              purchasePrice
              datePurchased
              settlementDate
              income
              adhocIncome
              expenses
              capitalGrowth
              projectedCapitalGrowth
              propertyType
              titleType
              material
              condition
              landSize
              landSizeUnit
              internalLivingSpaceSize
              bedrooms
              bathrooms
              livingSpaces
              carSpaces
              isBrandNew
              managingAgent
              managingAgentContactName
              managingAgentContactNo
              addlInfo
              purposeAsAt
              currentValueAsAt
              capitalGrowthAsAt
              projectedCapitalGrowthAsAt
              depreciationMethod
              isArchived
              archivedDate
            }
          }
          expenses(assetIds: $assetIds) {
            _id
            name
            essentialAmount
            discretionaryAmount
            frequency
            holdingCostName
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
              ownershipAsAt
            }
          }
          income(assetIds: $assetIds) {
            _id
            name
            amount
            amountAsAt
            frequency
            type
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
              ownershipAsAt
            }
            moneySmarts
            notes
          }
        }
        annualDepreciation(propertyId: $propertyId) {
          annualDepreciationAmount
          annualDepreciationAmountAsAt
        }
        historicalTracking {
          getValues(cardId: $propertyId, field: "purpose") {
            values {
              id
              cardId
              childCardId
              field
              index
              asAt
              stringValue
            }
          }
        }
      }
    }
  `,
};

const GET_INVESTMENT_QUERY_DEPRECATED = {
  label: 'Asset/GET_INVESTMENT_QUERY_DEPRECATED',
  query: gql`
    query QueryInvestment($id: [ObjectId!], $assetIds: [ObjectId!]) {
      me {
        client {
          assets {
            investments(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              type
              providerName
              purchaseDate
              settlementDate
              purchasePrice
              currentValue
              income
              adHocIncome
              expenses
              yearlyGrowthRate
              projectsCapitalGrowth
              addlInfo
              contributions {
                _id
                startDate
                endDate
                amount
                frequency
                # amountAsAt
              }
              currentValueAsAt
              projectsCapitalGrowthAsAt
              typeAsAt
              isArchived
              archivedDate
              nextContributionDate
              nextContributionDateStart
            }
          }
          expenses(assetIds: $assetIds) {
            _id
            name
            essentialAmount
            discretionaryAmount
            frequency
            holdingCostName
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
              ownershipAsAt
            }
          }
          income(assetIds: $assetIds) {
            _id
            name
            amount
            amountAsAt
            frequency
            type
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
              ownershipAsAt
            }
            moneySmarts
            notes
          }
        }
      }
    }
  `,
};

const GET_INVESTMENT_QUERY = {
  label: 'Asset/GET_INVESTMENT_QUERY',
  query: gql`
    query QueryInvestment($id: [ObjectId!], $assetIds: [ObjectId!]) {
      me {
        client {
          assets {
            investments(ids: $id) {
              _id
              name
              ownership {
                ownershipType
                ownershipDesc
                owners {
                  _id
                  owner
                  percentage
                }
                ownershipAsAt
              }
              type
              providerName
              purchaseDate
              settlementDate
              purchasePrice
              currentValue
              income
              adHocIncome
              expenses
              yearlyGrowthRate
              projectsCapitalGrowth
              addlInfo
              contributionAmount
              contributionAmountAsAt
              contributionFrequency
              currentValueAsAt
              projectsCapitalGrowthAsAt
              isArchived
              archivedDate
              nextContributionDate
              nextContributionDateStart
            }
          }
          expenses(assetIds: $assetIds) {
            _id
            name
            essentialAmount
            discretionaryAmount
            frequency
            holdingCostName
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
              ownershipAsAt
            }
          }
          income(assetIds: $assetIds) {
            _id
            name
            amount
            amountAsAt
            frequency
            type
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
              ownershipAsAt
            }
            moneySmarts
            notes
          }
        }
      }
    }
  `,
};

const GET_PROPERTY_EXTRA_INCOME_QUERY = {
  label: 'Asset/GET_PROPERTY_EXTRA_INCOME_QUERY',
  query: gql`
    query getPropertyExtraAsset($incomeIds: [ObjectId!]) {
      me {
        client {
          income(ids: $incomeIds) {
            _id
            amount
            amountAsAt
            type
            frequency
            isArchived
            ownership {
              ownershipType
              ownershipDesc
              owners {
                _id
                owner
                percentage
              }
            }
          }
        }
      }
    }
  `,
};

const GET_PROPERTY_EXTRA_EXPENSE_QUERY = {
  label: 'Asset/GET_PROPERTY_EXTRA_EXPENSE_QUERY',
  query: gql`
    query getPropertyExtraAsset($expenseIds: [ObjectId!]) {
      me {
        client {
          expenses(ids: $expenseIds) {
            _id
            holdingCostName
            essentialAmount
            isArchived
            ownership {
              ownershipType
              ownershipDesc
              owners {
                _id
                owner
                percentage
              }
            }
          }
        }
      }
    }
  `,
};

const GET_PROPERTY_EXTRA_EXPENSE_QUERY_2 = {
  label: 'Asset/GET_PROPERTY_EXTRA_EXPENSE_QUERY',
  query: gql`
    query getPropertyExtraAsset($expenseIds: [ObjectId!]) {
      me {
        client {
          expenses(ids: $expenseIds) {
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
  `,
};

export {
  ADD_NEW_ASSET_QUERY,
  GET_BANK_ACCOUNT_QUERY,
  GET_LIFE_INSURANCE_QUERY,
  GET_OTHER_ASSET_QUERY,
  GET_SUPER_FUND_QUERY,
  GET_VEHICLE_QUERY,
  GET_PROPERTY_QUERY,
  GET_PROPERTY_EXTRA_INCOME_QUERY,
  GET_PROPERTY_EXTRA_EXPENSE_QUERY,
  GET_PROPERTY_EXTRA_EXPENSE_QUERY_2,
  GET_INVESTMENT_QUERY_DEPRECATED,
  GET_INVESTMENT_QUERY,
};
