export const UPDATE_USERNAME = "loginReducer/UPDATE_USERNAME";
export const UPDATE_PASSWORD = "loginReducer/UPDATE_PASSWORD";
export const ON_LOGGEDIN = "loginReducer/ON_LOGGEDIN";

export const updateUsername = (val) => (disptch) => {
  disptch({
    type: UPDATE_USERNAME,
    payload: val,
  });
};

export const updatePassword = (val) => (disptch) => {
  disptch({
    type: UPDATE_PASSWORD,
    payload: val,
  });
};

export const onLoggedin = (val) => (disptch) => {
  disptch({
    type: ON_LOGGEDIN,
    payload: val,
  });
};
