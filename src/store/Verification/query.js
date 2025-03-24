import { gql } from '@apollo/client';

const VERIFY_AUTHENTICATOR_QUERY = {
  label: 'Verification/VERIFY_AUTHENTICATOR_QUERY',
  query: gql`
    mutation VerifyAuthenticator($pin: String!, $deviceId: String) {
      verifyAuthenticator(pin: $pin, deviceId: $deviceId) {
        access {
          token
          decoded {
            exp
            iat
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

const VERIFY_SMS_QUERY = {
  label: 'Verification/VERIFY_SMS_QUERY',
  query: gql`
    mutation VerifySms($pin: String!) {
      verifySms(pin: $pin) {
        access {
          token
          decoded {
            exp
            iat
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

const RESEND_AUTHENTICATOR_QUERY = {
  label: 'Verification/RESEND_AUTHENTICATOR_QUERY',
  query: gql`
    mutation ResendSms {
      resendSms {
        message
        nextSendSMS
      }
    }
  `,
};

const TWO_FA_SETTINGS_QUERY = {
  label: 'Verification/TWO_FA_SETTINGS_QUERY',
  query: gql`
    query TwoFAMethods {
      twoFaSettings {
        google
        email
        sms
      }
    }
  `,
};

const GENERATE_EMAIL_CODE_QUERY = {
  label: 'Verification/GENERATE_EMAIL_CODE_QUERY',
  query: gql`
    mutation GenerateEmailCode {
      generateEmailCode
    }
  `,
};

const VERIFY_EMAIL_CODE_QUERY = {
  label: 'Verification/VERIFY_EMAIL_CODE_QUERY',
  query: gql`
    mutation VerifyEmailCode($verifyEmailCodePin: String!) {
      verifyEmailCode(pin: $verifyEmailCodePin) {
        access {
          token
          decoded {
            exp
            iat
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

export {
  VERIFY_AUTHENTICATOR_QUERY,
  VERIFY_SMS_QUERY,
  RESEND_AUTHENTICATOR_QUERY,
  TWO_FA_SETTINGS_QUERY,
  GENERATE_EMAIL_CODE_QUERY,
  VERIFY_EMAIL_CODE_QUERY,
};
