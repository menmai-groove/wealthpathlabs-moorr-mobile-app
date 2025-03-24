import themeDefault from 'theme/theme.json';

const Global = {};
const Local = {};

Global.Palette = {
  set: paletteObject => {
    Local.palette = paletteObject;
  },
  get: () => Local.palette || themeDefault.palette,
};

Global.Loading = {
  set: loadingObject => {
    Local.loading = loadingObject;
  },
  get: () => Local.loading,
};

Global.Dim = {
  set: dimObject => {
    Local.dim = dimObject;
  },
  get: () => Local.dim,
};

Global.PopupBrowser = {
  set: popupBrowser => {
    Local.popupBrowser = popupBrowser;
  },
  get: () => Local.popupBrowser,
};

Global.BackgroundTask = {
  setID: id => {
    Local.backgroundID = id;
  },
  getID: () => Local.backgroundID || null,
};

Global.Tenant = {
  set: tenant => {
    Local.tenant = tenant;
  },
  get: () => Local.tenant,
};

Global.ConfirmModal = {
  set: obj => {
    if (obj) {
      Local.confirmModal = obj;
    }
  },
  get: () => Local.confirmModal,
};

Global.CustomModal = {
  set: obj => {
    if (obj) {
      Local.customModal = obj;
    }
  },
  get: () => Local.customModal,
};

Global.ImagePickerModal = {
  set: obj => {
    if (obj) {
      Local.imagePickerModal = obj;
    }
  },
  get: () => Local.imagePickerModal,
};
Global.ImageCropPicker = {
  set: obj => {
    if (obj) {
      Local.imageCropPicker = obj;
    }
  },
  get: () => Local.imageCropPicker,
};

Global.CalendarModal = {
  set: obj => {
    if (obj) {
      Local.calendarModal = obj;
    }
  },
  get: () => Local.calendarModal,
};

Global.Toast = {
  set: obj => {
    if (obj) {
      Local.toast = obj;
    }
  },
  get: () => Local.toast,
};

Global.ResultModal = {
  set: obj => {
    if (obj) {
      Local.resultModal = obj;
    }
  },
  get: () => Local.resultModal,
};

Global.ScreenModal = {
  set: obj => {
    if (obj) {
      Local.screenModal = obj;
    }
  },
  get: () => Local.screenModal,
};

Global.MenuModal = {
  set: obj => {
    if (obj) {
      Local.menuModal = obj;
    }
  },
  get: () => Local.menuModal,
};

Global.OptiModal = {
  set: obj => {
    if (obj) {
      Local.optiModal = obj;
    }
  },
  get: () => Local.optiModal,
};

Global.CalendarInModal = {
  set: obj => {
    if (obj) {
      Local.CalendarInModal = obj;
    }
  },
  get: () => Local.CalendarInModal,
};

Global.HistoricalLog = {
  set: obj => {
    if (obj) {
      Local.HistoricalLog = obj;
    }
  },
  get: () => Local.HistoricalLog,
};

Global.PreviousRoute = {
  set: obj => {
    if (obj) {
      Local.PreviousRoute = obj;
    }
  },
  get: () => Local.PreviousRoute,
};

export default Global;
