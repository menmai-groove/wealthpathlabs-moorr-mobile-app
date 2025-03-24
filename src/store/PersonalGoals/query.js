const { gql } = require('@apollo/client');

const LIST_PERSONAL_GOALS = {
  label: 'PersonalGoals/LIST_PERSONAL_GOALS',
  query: gql`
    query Query(
      $sort: PersonalGoalsSorting
      $pagination: Pagination
      $filter: PersonalGoalsFilter
    ) {
      me {
        personalGoals(sort: $sort, pagination: $pagination, filter: $filter) {
          data: documents {
            description
            _id
            colour
            dueDate
            photo
            icon
            photoUrl
            isAchieved
            value
          }
          page
          limit
          total
        }
      }
    }
  `,
};

/**
  "pagination": {
    "page": 1,
    "limit": 10
  }
 */

const UPDATE_PERSONAL_GOAL = {
  label: 'PersonalGoals/UPDATE_PERSONAL_GOAL',
  query: gql`
    mutation updatePersonalGoal($data: PersonalGoalsUpdateData!) {
      me {
        personalGoals {
          update(data: $data) {
            _id
            description
            colour
            dueDate
            photo
            icon
            photoUrl
            isAchieved
            uid
            value
          }
        }
      }
    }
  `,
};

/**
  "data": {
    "id": string, // prefix: `__ObjectId__`
    "description": string,
    "dueDate": string, // format ISOString
    "colour": string,
    "photo": string,
    "isAchieved": bool
  }
 */

const GENERATE_URLS = {
  label: 'PersonalGoals/GENERATE_URLS',
  query: gql`
    mutation GetFileUploadLink($filenames: [String!]!) {
      me {
        client {
          getFileUploadLink(filenames: $filenames) {
            newFilename
            link
            namespace
            key
            sseKeyId
            sseMethod
          }
        }
      }
    }
  `,
};

const GET_LIST_PERSONAL_GOALS_YEARS = {
  label: 'PersonalGoals/GET_LIST_PERSONAL_GOALS_YEARS',
  query: gql`
    query {
      me {
        personalGoalsYears
      }
    }
  `,
};

export { LIST_PERSONAL_GOALS, UPDATE_PERSONAL_GOAL, GENERATE_URLS, GET_LIST_PERSONAL_GOALS_YEARS };
