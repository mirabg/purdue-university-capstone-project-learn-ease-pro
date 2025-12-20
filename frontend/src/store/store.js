import { configureStore } from "@reduxjs/toolkit";

// Placeholder reducer until features are added
const placeholderReducer = (state = {}, action) => {
  return state;
};

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    // Additional reducers will be added here as features are developed
  },
});

export default store;
