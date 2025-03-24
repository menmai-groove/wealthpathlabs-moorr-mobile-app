import { gql } from '@apollo/client';

const FORGOT_PASSWORD_QUERY = {
  label: 'ResetPassword/FORGOT_PASSWORD_QUERY',
  query: gql`
    mutation GetResetPasswordLinkMutation($email: String!) {
      getResetPasswordLink(email: $email)
    }
  `,
};

export { FORGOT_PASSWORD_QUERY };
