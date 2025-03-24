import { gql } from '@apollo/client';

const LOGIN_QUERY = {
  label: 'Auth/LOGIN_QUERY',
  query: gql`
    mutation Login($email: String!, $password: String!, $deviceToken: String, $signature: String) {
      login(
        email: $email
        password: $password
        isMobileAppLogin: true
        deviceToken: $deviceToken
        signature: $signature
      ) {
        access {
          token
          decoded {
            strongAuth
            exp
            iat
          }
        }
        refresh {
          token
          decoded {
            exp
            iat
          }
        }
        authenticator
      }
    }
  `,
};

const REGISTER_QUERY = {
  label: 'Auth/REGISTER_QUERY',
  query: gql`
    mutation RegisterRequest($createUserInput: CreateUserInput) {
      register(createUserInput: $createUserInput) {
        _id
        email
        password
      }
    }
  `,
};

const REFRESH_ACCESS_TOKEN_QUERY = {
  label: 'Auth/REFRESH_ACCESS_TOKEN_QUERY',
  query: gql`
    mutation RefreshAccessToken($refresh: String!) {
      refreshAccessToken(refresh: $refresh) {
        access {
          token
          decoded {
            iat
            exp
            strongAuth
          }
        }
        refresh {
          token
          decoded {
            iat
            exp
          }
        }
      }
    }
  `,
};

const GET_ME = {
  label: 'Auth/GET_ME',
  query: gql`
    query Me {
      me {
        _id
        email
        tcAcceptedAt
        pcAcceptedAt
        partnerUID
        hasPartnerAccount
        client {
          _id
          surveyComplete
          personalInfo {
            client1 {
              _id
              dob
              email
              fName
              lName
              hPhone
              address {
                state
              }
              mPhone
            }
            client2 {
              _id
              dob
              email
              fName
              lName
              mPhone
            }
            dependants {
              _id
              age
              dob
              name
              relationship
            }
          }
          assets {
            bankAccounts {
              _id
              name
              balance
            }
          }
          borrowings {
            _id
            fixedTerm
            fixedRateEndDate
            interestRate
            isOffset
            name
            repayment
            repaymentType
            type
            borrower {
              # _id
              ownershipDesc
              ownershipType
              owners {
                percentage
                owner
                _id
              }
            }
            offsets {
              offset
            }
          }
          income {
            _id
            amount
            name
            moneySmarts
            ownership {
              # _id
              ownershipDesc
              ownershipType
              owners {
                _id
                owner
                percentage
              }
            }
          }
        }
        featureFlags {
          identifier
        }
      }
    }
  `,
};

const UPDATE_ME = {
  label: 'Auth/UPDATE_ME',
  query: gql`
    mutation Me($data: UserInput!) {
      me {
        update(data: $data) {
          tcAcceptedAt
          pcAcceptedAt
        }
      }
    }
  `,
};

const UPDATE_ME1 = {
  label: 'Auth/UPDATE_ME1',
  query: gql`
    mutation Update($data: ClientUpdateData!) {
      me {
        client {
          update(data: $data) {
            _id
            personalInfo {
              _id
              client1 {
                _id
                fName
                lName
                email
                dob
                mPhone
              }
              client2 {
                _id
                fName
                lName
                email
                dob
                mPhone
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

const ADD_DEVICE_QUERY = {
  label: 'Auth/ADD_DEVICE_QUERY',
  query: gql`
    mutation Me($info: FCMAuthInput!, $deviceId: String!, $ref: String!) {
      me {
        addDevice(info: $info, deviceId: $deviceId, ref: $ref)
      }
    }
  `,
};

const VERIFY_DEVICE_QUERY = {
  label: 'Auth/VERIFY_DEVICE_QUERY',
  query: gql`
    mutation ($pin: String!, $deviceId: String!, $pushToken: String!) {
      me {
        verifyDevice(pin: $pin, deviceId: $deviceId, pushToken: $pushToken) {
          refresh {
            token
            decoded {
              iat
              exp
            }
          }
          access {
            token
            decoded {
              iat
              exp
              strongAuth
            }
          }
        }
      }
    }
  `,
};

const LOGOUT_QUERY = {
  label: 'Auth/LOGOUT_QUERY',
  query: gql`
    mutation ($pushToken: String) {
      logout(pushToken: $pushToken)
    }
  `,
};

const REFRESH_DEVICE_ACCESS_TOKEN_QUERY = {
  label: 'Auth/REFRESH_DEVICE_ACCESS_TOKEN_QUERY',
  query: gql`
    mutation ($token: String!, $refresh: String!, $ref: String!) {
      refreshDeviceAccessToken(token: $token, refresh: $refresh, ref: $ref)
    }
  `,
};

const CHANGE_PASSWORD_QUERY = {
  label: 'Auth/CHANGE_PASSWORD_QUERY',
  query: gql`
    mutation Me($password: String!, $newPassword: String!) {
      me {
        changePassword(password: $password, newPassword: $newPassword)
      }
    }
  `,
};

const GET_STATIC_VALUES_QUERY = {
  label: 'Auth/GET_STATIC_VALUES_QUERY',
  query: gql`
    query staticValues {
      me {
        staticValues {
          dropdown {
            general {
              owners {
                label
                value {
                  owner
                  percentage
                }
              }
              frequency {
                label
                value
              }
              incomeTypes {
                label
                value
              }
              employmentBasis {
                label
                value
              }
              ownershipStructure {
                label
                value
              }
              trustType {
                label
                value
              }
              issue {
                label
                value
              }
              ownersWithOthers {
                label
                value {
                  owner
                  percentage
                }
              }
            }
            income {
              assessedTaxReturn {
                FY {
                  label
                  value
                }
              }
            }
            moneySMARTS {
              jars {
                label
                value
              }
              rolloverJars {
                label
                value
              }
            }
            expenses {
              category {
                bill {
                  label
                  value
                }
                spending {
                  label
                  value
                }
                investmentHoldingCosts {
                  label
                  value
                }
                propertyHoldingCosts {
                  label
                  value
                }
              }
              propertyExpenseType {
                label
                value
              }
              investmentAssetBillsTypes {
                label
                value
              }
            }
            assets {
              properties {
                primaryPurpose {
                  label
                  value
                }
                tenureTypes {
                  label
                  value
                }
                propertyTypes {
                  label
                  value
                }
                titleTypes {
                  label
                  value
                }
                materialTypes {
                  label
                  value
                }
                conditionTypes {
                  label
                  value
                }
                lotUnits {
                  label
                  value
                }
              }
              investment {
                type {
                  label
                  value
                }
              }
              bankAccounts {
                type {
                  label
                  value
                }
                institutions {
                  label
                  value
                }
              }
              vehicles {
                type {
                  label
                  value
                }
                year {
                  label
                  value
                }
              }
              superFunds {
                strategy {
                  label
                  value
                }
                product {
                  label
                  value
                }
                provider {
                  label
                  value
                }
              }
              types {
                label
                value
              }
            }
            borrowings {
              loanType {
                label
                value
                tags
              }
              primaryPurpose {
                label
                value
              }
              detailedPurposes {
                realEstate {
                  label
                  value
                }
                refinancing {
                  label
                  value
                }
                generalSpending {
                  label
                  value
                }
                other {
                  label
                  value
                }
              }
              provider {
                label
                value
              }
              repaymentType {
                label
                value
              }
              offsetAccounts {
                label
                value
              }
              repaymentAccounts {
                label
                value
              }
            }
          }
          default {
            defaultPropertyHoldingCosts {
              label
              value
            }
            defaultInvestmentHoldingCosts {
              label
              value
            }
            expenses {
              bills {
                category
                tier1
                tier2
                tier3
                tier4
                jar
              }
              spending {
                category
                tier1
                tier2
                tier3
                tier4
                jar
              }
            }
          }
        }
      }
    }
  `,
};

const GET_STATIC_VALUES_DEFAULT_QUERY = gql`
  query DefaultStaticValues {
    me {
      staticValues {
        default {
          defaultInvestmentHoldingCosts {
            label
            value
          }
          defaultPropertyHoldingCosts {
            label
            value
          }
          simExpenses {
            billCategories
            spendingCategories
          }
          expenses {
            bills {
              tier1
              category
              tier2
              tier3
              tier4
              jar
            }
            spending {
              category
              tier1
              tier2
              tier3
              tier4
              jar
            }
          }
        }
        dropdown {
          expenses {
            category {
              investmentHoldingCosts {
                label
                value
              }
              propertyHoldingCosts {
                label
                value
              }
            }
          }
        }
      }
    }
  }
`;

const GET_CURRENT_TIME_QUERY = {
  label: 'Auth/GET_CURRENT_TIME_QUERY',
  query: gql`
    query GET_CURRENT_TIME {
      time
    }
  `,
};

const DELETE_ACCOUNT = {
  label: 'Auth/DELETE_ACCOUNT',
  query: gql`
    mutation DoAction($slug: String!) {
      me {
        doAction(slug: $slug) {
          next
          ui
          title
          body
        }
      }
    }
  `,
};

const UPDATE_USER_EMAIL_QUERY = {
  label: 'Auth/UPDATE_USER_EMAIL',
  query: gql`
    mutation UpdateUserEmail($data: UserEmailUpdateData!) {
      me {
        updateUserEmail(data: $data) {
          email
        }
      }
    }
  `,
};

const GET_MY_KNOWLEDGE_LINK = {
  label: 'Auth/UPDATE_USER_EMAIL',
  query: gql`
    query KnowledgeBaseLink {
      me {
        knowledgeBase {
          link {
            url
          }
        }
      }
    }
  `,
};

export {
  LOGIN_QUERY,
  REGISTER_QUERY,
  REFRESH_ACCESS_TOKEN_QUERY,
  GET_ME,
  UPDATE_ME,
  UPDATE_ME1,
  ADD_DEVICE_QUERY,
  VERIFY_DEVICE_QUERY,
  LOGOUT_QUERY,
  REFRESH_DEVICE_ACCESS_TOKEN_QUERY,
  CHANGE_PASSWORD_QUERY,
  GET_STATIC_VALUES_QUERY,
  GET_STATIC_VALUES_DEFAULT_QUERY,
  GET_CURRENT_TIME_QUERY,
  DELETE_ACCOUNT,
  UPDATE_USER_EMAIL_QUERY,
  GET_MY_KNOWLEDGE_LINK,
};
