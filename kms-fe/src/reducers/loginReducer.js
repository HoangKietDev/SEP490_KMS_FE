import {
  UPDATE_USERNAME,
  UPDATE_PASSWORD,
  ON_LOGGEDIN,
} from "../actions/LoginAction";

const initialState = {
  username: "",
  password: "",
  isLoggedin: false,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USERNAME: {
      return {
        ...state,
        username: action.payload,
      };
    }

    case UPDATE_PASSWORD: {
      return {
        ...state,
        password: action.payload,
      };
    }

    case ON_LOGGEDIN: {
      return {
        ...state,
        isLoggedin: action.payload,
      };
    }

    default:
      return state;
  }
};

export default loginReducer;
