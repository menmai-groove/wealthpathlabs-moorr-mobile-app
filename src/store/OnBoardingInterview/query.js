const { gql } = require('@apollo/client');

const UPDATE_CLIENT = {
  label: 'OnBoardingInterview/UPDATE_CLIENT',
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

export { UPDATE_CLIENT };
