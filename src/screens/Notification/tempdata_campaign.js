const queryCampaign = campaignId => {
  switch (campaignId) {
    case 'home-loan-health-check-1':
      return {
        data: {
          me: {
            campaign: {
              get: {
                _id: '63ed57792ba6d3048b2b087e',
                campaignId: 'home-loan-health-check-1',
                dialogs: [
                  {
                    _id: '63ed57792ba6d3048b2b0884',
                    dialogId: 'home-loan-health-check-confirmed',
                    style: 'basic-popup', // popup
                    header: '**Success! Your request has been sent.**',
                    body: 'Great to see you are taking steps to optimise your money!\n\n**What’s next:**\n\n1. Make sure your contact number is correct, you can edit this here or on your profile page\n\n2. Update your mortgage details on the financial dashboard.\n\nAn Empower Wealth member will call you to discuss if they can help you reduce your rate and save you money!',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0885',
                        buttonId: 'success-close',
                        style: 'purple',
                        label: 'Close',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                  {
                    _id: '63ed57792ba6d3048b2b087f',
                    dialogId: 'home-loan-health-check-details',
                    style: 'opti-prompt', // ui
                    header: '**Home Loan Health Check**',
                    body: 'Staying with your current lender, could be costing you thousands, every year!\n\nCompetition is fierce right now, with lenders offering super **cheap rates** & **big cash-back offers**, to win your business.\n\n**How much could you be saving?**\n\nEmpower Wealth Mortgage Advisory is a multi-award winning brokerage, which last year, saved over $2 million in interest costs.\nThis year they are on track to **save over $3 million!**\n\nGet them to do all the research and paperwork, whilst you enjoy a stress free process and all the savings!!\n\nJust think how it will improve your WealthSPEED?',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0880',
                        buttonId: 'success-home-loan-health-check',
                        style: 'green',
                        label: 'Free Home Loan Health Check',
                        action: 'dialog',
                        dialogId: 'home-loan-health-check-confirmed',
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                      {
                        _id: '63ed57792ba6d3048b2b0xxx',
                        buttonId: 'success-link',
                        style: 'purple',
                        label: 'Open a link',
                        action: 'link',
                        dialogId: null,
                        link: 'https://www.moorr.com.au/wealthdashboard',
                        ui: null,
                        parameters: null,
                      },
                      {
                        _id: '63ed57792ba6d3048b2b0230',
                        buttonId: 'success-ui',
                        style: 'purple',
                        label: 'Go to Wealth Dashboard',
                        action: 'ui',
                        dialogId: null,
                        link: null,
                        ui: 'wealth_dashboard',
                        parameters: null,
                      },
                      {
                        _id: '63ed57792ba6d3048b2b0882',
                        buttonId: 'no-thanks',
                        style: 'grey-text',
                        label: 'No, Thanks',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                ],
                initialDialogId: 'home-loan-health-check-details',
              },
            },
          },
        },
      };
    case 'home-loan-health-check-2':
      return {
        data: {
          me: {
            campaign: {
              get: {
                _id: '63ed57792ba6d3048b2b087e',
                campaignId: 'home-loan-health-check-2',
                dialogs: [
                  {
                    _id: '63ed57792ba6d3048b2b0884',
                    dialogId: 'home-loan-health-check-confirmed',
                    style: 'basic-popup', // popup
                    header: '**STEP 1**',
                    body: 'Great to see you are taking steps to optimise your money!\n\n**What’s next:**\n\n1. Make sure your contact number is correct, you can edit this here or on your profile page\n\n2. Update your mortgage details on the financial dashboard.\n\nAn Empower Wealth member will call you to discuss if they can help you reduce your rate and save you money!',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0880',
                        buttonId: 'success-home-loan-health-check',
                        style: 'green',
                        label: 'Next',
                        action: 'dialog',
                        dialogId: 'home-loan-health-check-confirmed-2',
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                      {
                        _id: '63ed57792ba6d3048b2b0885',
                        buttonId: 'success-close',
                        style: 'purple',
                        label: 'Close',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                  {
                    _id: '63ed57792ba6d3048b2b08841',
                    dialogId: 'home-loan-health-check-confirmed-2',
                    style: 'basic-popup', // popup
                    header: '**STEP 2**',
                    body: '2. Great to see you are taking steps to optimise your money!\n\n**What’s next:**\n\n1. Make sure your contact number is correct, you can edit this here or on your profile page\n\n2. Update your mortgage details on the financial dashboard.\n\nAn Empower Wealth member will call you to discuss if they can help you reduce your rate and save you money!',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0885',
                        buttonId: 'success-close',
                        style: 'purple',
                        label: 'DONE',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                ],
                initialDialogId: 'home-loan-health-check-confirmed',
              },
            },
          },
        },
      };
    case 'home-loan-health-check-3':
      return {
        data: {
          me: {
            campaign: {
              get: {
                _id: '63ed57792ba6d3048b2b087e',
                campaignId: 'home-loan-health-check-1',
                dialogs: [
                  {
                    _id: '63ed57792ba6d3048b2b0884',
                    dialogId: 'home-loan-health-check-details-2',
                    style: 'opti-prompt', // ui
                    header: '**STEP 2**',
                    body: '2. Staying with your current lender, could be costing you thousands, every year!\n\nCompetition is fierce right now, with lenders offering super **cheap rates** & **big cash-back offers**, to win your business.\n\n**How much could you be saving?**\n\nEmpower Wealth Mortgage Advisory is a multi-award winning brokerage, which last year, saved over $2 million in interest costs.\nThis year they are on track to **save over $3 million!**\n\nGet them to do all the research and paperwork, whilst you enjoy a stress free process and all the savings!!\n\nJust think how it will improve your WealthSPEED?',
                    parameters: null,
                    buttons: [
                      // {
                      //   _id: '63ed57792ba6d3048b2b0880',
                      //   buttonId: 'success-home-loan-health-check',
                      //   style: 'green',
                      //   label: 'Free Home Loan Health Check',
                      //   action: 'dialog',
                      //   dialogId: 'home-loan-health-check-confirmed',
                      //   link: null,
                      //   ui: null,
                      //   parameters: null,
                      // },
                      {
                        _id: '63ed57792ba6d3048b2b0882',
                        buttonId: 'no-thanks',
                        style: 'purple',
                        label: 'DONE',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                  {
                    _id: '63ed57792ba6d3048b2b087f',
                    dialogId: 'home-loan-health-check-details',
                    style: 'opti-prompt', // ui
                    header: '**STEP 1**',
                    body: 'Staying with your current lender, could be costing you thousands, every year!\n\nCompetition is fierce right now, with lenders offering super **cheap rates** & **big cash-back offers**, to win your business.\n\n**How much could you be saving?**\n\nEmpower Wealth Mortgage Advisory is a multi-award winning brokerage, which last year, saved over $2 million in interest costs.\nThis year they are on track to **save over $3 million!**\n\nGet them to do all the research and paperwork, whilst you enjoy a stress free process and all the savings!!\n\nJust think how it will improve your WealthSPEED?',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0880',
                        buttonId: 'success-home-loan-health-check',
                        style: 'green',
                        label: 'Free Home Loan Health Check',
                        action: 'dialog',
                        dialogId: 'home-loan-health-check-details-2',
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                      {
                        _id: '63ed57792ba6d3048b2b0882',
                        buttonId: 'no-thanks',
                        style: 'grey-text',
                        label: 'No, Thanks',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                ],
                initialDialogId: 'home-loan-health-check-details',
              },
            },
          },
        },
      };
    default:
      return {
        data: {
          me: {
            campaign: {
              get: {
                _id: '63ed57792ba6d3048b2b087e',
                campaignId: 'home-loan-health-check',
                dialogs: [
                  {
                    _id: '63ed57792ba6d3048b2b0884',
                    dialogId: 'home-loan-health-check-confirmed',
                    style: 'basic-popup', // popup
                    header: '**Success! Your request has been sent.**',
                    body: 'Great to see you are taking steps to optimise your money!\n\n**What’s next:**\n\n1. Make sure your contact number is correct, you can edit this here or on your profile page\n\n2. Update your mortgage details on the financial dashboard.\n\nAn Empower Wealth member will call you to discuss if they can help you reduce your rate and save you money!',
                    parameters: null,
                    buttons: [
                      {
                        _id: '63ed57792ba6d3048b2b0885',
                        buttonId: 'success-close',
                        style: 'purple',
                        label: 'Close',
                        action: 'dismiss',
                        dialogId: null,
                        link: null,
                        ui: null,
                        parameters: null,
                      },
                    ],
                  },
                ],
                initialDialogId: 'home-loan-health-check-confirmed',
              },
            },
          },
        },
      };
  }
};

const mockData = [
  {
    _id: '621db29c580f67f93f296017',
    body: 'Campaign: Show only popup',
    createdDate: '2022-03-01T05:43:57.101Z',
    title: 'Campaign Title',
    type: 'Campaign',
    uid: '6209ad5d3bca481e228dc459',
    isRead: true,
    campaignId: 'home-loan-health-check',
  },
  {
    _id: '621db29c580f67f93f296018',
    body: 'Campaign: Opti-message => Popup',
    createdDate: '2022-03-01T05:43:57.101Z',
    title: 'Campaign Title 1',
    type: 'Campaign',
    uid: '6209ad5d3bca481e228dc459',
    isRead: true,
    campaignId: 'home-loan-health-check-1',
  },
  {
    _id: '621db29c580f67f93f296019',
    body: 'Campaign: Popup => Popup',
    createdDate: '2022-03-01T05:43:57.101Z',
    title: 'Campaign Title 2',
    type: 'Campaign',
    uid: '6209ad5d3bca481e228dc459',
    isRead: true,
    campaignId: 'home-loan-health-check-2',
  },
  {
    _id: '621db29c580f67f93f296019',
    body: 'Campaign:\n Opti-message => Opti-message',
    createdDate: '2022-03-01T05:43:57.101Z',
    title: 'Campaign Title 3',
    type: 'Campaign',
    uid: '6209ad5d3bca481e228dc459',
    isRead: true,
    campaignId: 'home-loan-health-check-3',
  },
  // {
  //   _id: '621db29d580f67f93f29601d',
  //   body: 'Open link',
  //   createdDate: '2022-03-01T05:43:57.101Z',
  //   title: 'Link Title',
  //   type: 'Link',
  //   uid: '6209ad5d3bca481e228dc459',
  //   isRead: true,
  //   link: 'https://my.moorr.com.au/links/feedback',
  // },
];

export { queryCampaign, mockData };
