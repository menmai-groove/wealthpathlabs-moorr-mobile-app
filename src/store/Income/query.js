const { gql } = require('@apollo/client');

const UPDATE_CLIENT = {
  label: 'Income/UPDATE_CLIENT',
  query: gql`
    mutation MeMutation($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            personalInfo {
              client1 {
                fName
              }
              client2 {
                fName
              }
              dependants {
                _id
                name
              }
            }
          }
        }
      }
    }
  `,
};

const SUBMIT_INCOME = {
  label: 'Income/SUBMIT_INCOME',
  query: gql`
    mutation MeMutation($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            income {
              _id
              type
              employer {
                phone
              }
              probationMonthsRemaining
              amount
              frequency
              nextPayDate
              nextPayDateStart
            }
          }
        }
      }
    }
  `,
};

const GET_DETAIL_INCOME_QUERY = gql`
  query ($ids: [ObjectId!]) {
    me {
      client {
        income(ids: $ids) {
          _id
          name
          frequency
          notes
          startDate
          moneySmarts
          industry {
            industryClass
            industryDivision
          }
          position
          natureOfWork
          amount
          type
          employer {
            name
            phone
          }
          basis {
            name
            details {
              type
              ownershipStructure
              directors {
                _id
                name
              }
              shareholders {
                _id
                name
              }
            }
          }
          assessedTaxReturn {
            FY
            salary
            profit
            _id
          }
          business {
            nature
          }
          averageOvertimeIncomePA
          averageCommissionPA
          averageBonusPA
          taxDeductions {
            frequency
            name
            amount
            _id
            amountAsAt
          }
          paymentFrequency
          isTaxDeductible
          isTaxDeductibleAsAt
          ownership {
            owners {
              owner
              percentage
              _id
            }
            ownershipType
            ownershipDesc
            ownershipAsAt
          }
          amount
          amountAsAt
          averageBonusPAAsAt
          averageCommissionPAAsAt
          averageOvertimeIncomePAAsAt
          isArchived
          archivedDate
          nextPayDate
          nextPayDateStart
        }
      }
    }
  }
`;

const GET_DETAIL_INVESTMENT_QUERY = {
  label: 'Income/GET_DETAIL_INVESTMENT_QUERY',
  query: gql`
    query ($ids: [ObjectId!]) {
      me {
        client {
          assets {
            investments(ids: $ids) {
              _id
              name
              income
              adHocIncome
              ownership {
                ownershipType
                owners {
                  owner
                  percentage
                }
                ownershipAsAt
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

const GET_DETAIL_PROPERTY_QUERY = {
  label: 'Income/GET_DETAIL_PROPERTY_QUERY',
  query: gql`
    query ($ids: [ObjectId!]) {
      me {
        client {
          assets {
            properties(ids: $ids) {
              _id
              name
              income
              adhocIncome
              address {
                formatted
              }
              ownership {
                ownershipType
                owners {
                  owner
                  percentage
                }
                ownershipAsAt
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

export {
  UPDATE_CLIENT,
  SUBMIT_INCOME,
  GET_DETAIL_INCOME_QUERY,
  GET_DETAIL_INVESTMENT_QUERY,
  GET_DETAIL_PROPERTY_QUERY,
};
