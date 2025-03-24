import { gql } from '@apollo/client';

const GET_NOTIFICATIONS = {
  label: 'Notification/GET_NOTIFICATIONS',
  query: gql`
    query Me($pagination: Pagination, $showOnLogin: Boolean, $isWeb: Boolean) {
      me {
        notifications(pagination: $pagination, showOnLogin: $showOnLogin, isWeb: $isWeb) {
          paginated {
            documents {
              _id
              uid
              title
              body
              type
              createdDate
              isRead
              icon
              link
              campaignId
              ui
              showOnLogin
              showOnLoginExpiry
            }
            page
            limit
            total
            totalBadge
          }
        }
      }
    }
  `,
};

const MARK_IT_AS_READ = {
  label: 'Notification/MARK_IT_AS_READ',
  query: gql`
    mutation Update($data: NotificationUpdateData!) {
      me {
        notifications {
          update(data: $data) {
            _id
            uid
            title
            body
            type
            createdDate
            isRead
            icon
            link
            campaignId
          }
        }
      }
    }
  `,
};

const MARK_ALL_AS_READ = {
  label: 'Notification/MARK_ALL_AS_READ',
  query: gql`
    mutation Update($pagination: Pagination) {
      me {
        notifications {
          markAllAsRead(pagination: $pagination) {
            paginated {
              totalBadge
            }
          }
        }
      }
    }
  `,
};
const VIEW_CAMPAIGN = {
  label: 'Notification/VIEW_CAMPAIGN',
  query: gql`
    mutation ViewCampaign($campaignId: String!) {
      me {
        campaign {
          get(campaignId: $campaignId) {
            campaignId
            initialDialogId
            dialogs {
              dialogId
              style
              header
              body
              parameters
              buttons {
                buttonId
                style
                label
                action
                dialogId
                link
                ui
                parameters
                _id
              }
              _id
            }
            _id
          }
        }
      }
    }
  `,
};
const CAMPAIGN_TRIGGER_BUTTON = {
  label: 'Notification/CAMPAIGN_TRIGGER_BUTTON',
  query: gql`
    mutation TriggerButton(
      $campaignId: String!
      $dialogId: String!
      $action: String!
      $buttonId: String!
    ) {
      me {
        campaign {
          trigger(
            campaignId: $campaignId
            dialogId: $dialogId
            action: $action
            buttonId: $buttonId
          )
        }
      }
    }
  `,
};

export {
  GET_NOTIFICATIONS,
  MARK_IT_AS_READ,
  MARK_ALL_AS_READ,
  VIEW_CAMPAIGN,
  CAMPAIGN_TRIGGER_BUTTON,
};
