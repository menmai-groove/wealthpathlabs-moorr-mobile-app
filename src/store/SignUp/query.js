import { gql } from '@apollo/client';

const REGISTER_QUERY = {
  label: 'SignUp/REGISTER_QUERY',
  query: gql`
    # Register request
    mutation Register($email: String!, $password: String!, $agreedPoliciesAt: CurrentDate) {
      register(email: $email, password: $password, agreedPoliciesAt: $agreedPoliciesAt)
    }
  `,
};

const REGISTER_WITH_DATA_QUERY = {
  label: 'SignUp/REGISTER_WITH_DATA_QUERY',
  query: gql`
    # RegisterWithData request
    mutation RegisterWithData(
      $email: String!
      $password: String!
      $registerWithDataAgreedPoliciesAt2: CurrentDate
    ) {
      registerWithData(
        email: $email
        password: $password
        agreedPoliciesAt: $registerWithDataAgreedPoliciesAt2
      ) {
        userId
      }
    }
  `,
};

export { REGISTER_QUERY, REGISTER_WITH_DATA_QUERY };
