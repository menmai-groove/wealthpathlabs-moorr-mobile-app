import { gql } from '@apollo/client';

const GET_CLIENT_HOME_EXPENSES = {
  label: 'Home/GET_CLIENT_HOME_EXPENSES',
  query: gql`
    query Client {
      me {
        client {
          homeDashboard {
            expenses {
              monthly {
                #7b & 8a
                total
                #8b
                breakdown {
                  key
                  total
                }
              }
            }
          }
        }
      }
    }
  `,
};

const GET_CLIENT_BORROWINGS = {
  label: 'Home/GET_CLIENT_BORROWINGS',
  query: gql`
    query Client {
      me {
        _id
        client {
          _id
          borrowings {
            key: type
            total: outstanding
          }
          computeTotal(
            groups: [{ key: "borrowing", queries: [{ paths: ["borrowing.outstanding"] }] }]
          ) {
            groups {
              key
              total
            }
          }
        }
      }
    }
  `,
};

const GET_CLIENT_QUERY = {
  label: 'Home/GET_CLIENT_QUERY',
  query: gql`
    query Client($groups: [ComputeTotalGroups]) {
      me {
        _id
        client {
          _id
          computeTotal(groups: $groups) {
            groups {
              key
              total
            }
          }
        }
      }
    }
  `,
};

// const GET_CLIENT_HISTORY_QUERY = {
//   label: 'Home/GET_CLIENT_HISTORY_QUERY',
//   query: gql`
//     query Client($items: [HistoricalTrackerParams]) {
//       me {
//         clientHistory {
//           historicalTracker(items: $items) {
//             key
//             total
//             data {
//               date
//               amount
//             }
//           }
//         }
//       }
//     }
//   `,
// };

const GET_FEEDBACK_TYPES = {
  label: 'Home/GET_FEEDBACK_TYPES',
  query: gql`
    query FeedbackTypes {
      me {
        feedbackTypes {
          name
          type
          pop
          canAsk
          askAt
        }
      }
    }
  `,
};

const DO_FEEDBACK_LATER = {
  label: 'Home/DO_FEEDBACK_LATER',
  query: gql`
    mutation DoFeedbackLater {
      me {
        doFeedbackLater
      }
    }
  `,
};

const ADD_FEEDBACK = {
  label: 'Home/ADD_FEEDBACK',
  query: gql`
    mutation AddFeedback($data: UserFeedbackData!) {
      me {
        addFeedback(data: $data)
      }
    }
  `,
};

const GET_SHOW_REVIEW_PROMPT = {
  label: 'Home/GET_SHOW_REVIEW_PROMPT',
  query: gql`
    mutation ShowReviewPrompt {
      me {
        showReviewPrompt
      }
    }
  `,
};

const SET_REVIEW_STATUS_MUTATION = {
  label: 'Home/SET_REVIEW_STATUS',
  query: gql`
    mutation SetReviewStatus($status: String!) {
      me {
        setReviewStatus(status: $status)
      }
    }
  `,
};

const ADD_FEEDBACK_SUGGESTION = {
  label: 'Home/ADD_FEEDBACK_SUGGESTION',
  query: gql`
    mutation AddFeedbackSuggestion($data: UserFeedbackSuggestionData!) {
      me {
        addFeedbackSuggestion(data: $data)
      }
    }
  `,
};

export {
  GET_CLIENT_HOME_EXPENSES,
  GET_CLIENT_BORROWINGS,
  GET_CLIENT_QUERY,
  // GET_CLIENT_HISTORY_QUERY,
  GET_FEEDBACK_TYPES,
  DO_FEEDBACK_LATER,
  ADD_FEEDBACK,
  GET_SHOW_REVIEW_PROMPT,
  SET_REVIEW_STATUS_MUTATION,
  ADD_FEEDBACK_SUGGESTION,
};
