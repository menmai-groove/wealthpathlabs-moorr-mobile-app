const { gql } = require('@apollo/client');

const SEARCH_INDUSTRY = {
  label: 'Industry/SEARCH_INDUSTRY',
  query: gql`
    query Industry($search: String, $limit: Int, $page: Int) {
      me {
        staticValues {
          dropdown {
            general {
              industry {
                search(search: $search, limit: $limit, page: $page) {
                  totalPages
                  list {
                    label
                    value {
                      class
                      division
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
};

const GET_INDUSTRY_DIVISIONS = {
  label: 'Industry/GET_INDUSTRY_DIVISIONS',
  query: gql`
    query Industry {
      me {
        staticValues {
          dropdown {
            general {
              industry {
                divisions {
                  label
                  value
                }
              }
            }
          }
        }
      }
    }
  `,
};

const GET_INDUSTRY_CLASSES = {
  label: 'Industry/GET_INDUSTRY_CLASSES',
  query: gql`
    query Industry($division: String) {
      me {
        staticValues {
          dropdown {
            general {
              industry {
                classes(division: $division) {
                  label
                  value {
                    class
                    division
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
};

export { SEARCH_INDUSTRY, GET_INDUSTRY_DIVISIONS, GET_INDUSTRY_CLASSES };
