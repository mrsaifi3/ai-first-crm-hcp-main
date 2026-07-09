import { configureStore } from "@reduxjs/toolkit";
import interactionReducer from "../interaction/interactionSlice";

export const store = configureStore({
  reducer: {
    interaction: interactionReducer,
  },
});






