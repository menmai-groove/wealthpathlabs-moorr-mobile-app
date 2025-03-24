import { gql } from '@apollo/client';

const GET_ASSETS_QUERY = {
  label: 'Borrowing/GET_ASSETS_QUERY',
  query: gql`
    query assetsSearch {
      me {
        client {
          smartSearch(
            paths: ["assets.vehicles", "assets.properties", "assets.investments"]
            value: ""
          ) {
            assets {
              vehicles {
                _id
                name
              }
              properties {
                _id
                name
              }
              investments {
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

const UPDATE_BORROWING_QUERY = {
  label: 'Borrowing/UPDATE_BORROWING_QUERY',
  query: gql`
    mutation ($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            _id
            borrowings {
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

const GET_DETAIL_BORROWING_QUERY = {
  label: 'Borrowing/GET_DETAIL_BORROWING_QUERY',
  query: gql`
    query ($ids: [ObjectId!]) {
      me {
        client {
          borrowings(ids: $ids) {
            _id
            moneySmartsJar
            borrower {
              ownershipDesc
              ownershipType
              owners {
                _id
                owner
                percentage
              }
              ownershipAsAt
            }
            otherBorrowerPercentage
            type
            name
            primaryPurpose
            detailedPurpose
            otherDetailedPurpose
            accountNumber
            originalAmount
            startDate

            outstanding
            baseRate
            discountRate
            loanFees
            loanFeesFrequency
            upfrontFees
            term
            fixedTerm
            fixedRateEndDate
            firstPayment

            interestRate
            interestRatePostFixed
            interestOnlyEndDate
            interestOnlyExpiryDate

            repayment
            repaymentFreq
            repaymentType

            LMI
            LMIBool
            limit

            paymentAccount
            ongoingPaymentAccount

            isOffset
            offset
            offsets {
              offset
              _id
            }

            properties
            investments
            vehicles

            securedAgainstProperties
            securedAgainstInvestments
            securedAgainstVehicles

            provider
            otherProvider

            settledLoan
            isAutoPaymentSweep
            isClosed
            closedDate
            expiryDate

            addlInfo
            otherBorrowerAddlInfo

            interestRateAsAt
            loanFeesAsAt
            outstandingAsAt
            repaymentAsAt
            repaymentTypeAsAt
            securedAgainstAsAt
            typeAsAt
            limitAsAt
            offsetsAsAt
            purposeAsAt

            isTrackedInMoneySmarts
            isTrackedInMoneySmartsAsAt
            isArchived
            archivedDate

            nextRepaymentDate
            nextRepaymentDateStart
          }
        }
      }
    }
  `,
};

const GET_LINKED_OFFSETS_QUERY = {
  label: 'Borrowing/GET_LINKED_OFFSETS_QUERY',
  query: gql`
    query {
      me {
        client {
          borrowings {
            _id
            name
            offsets {
              _id
              offset
            }
          }
        }
      }
    }
  `,
};

export {
  GET_ASSETS_QUERY,
  UPDATE_BORROWING_QUERY,
  GET_DETAIL_BORROWING_QUERY,
  GET_LINKED_OFFSETS_QUERY,
};
