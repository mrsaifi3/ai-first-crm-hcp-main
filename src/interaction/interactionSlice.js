import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "form",
  interactions: [],
};

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === "form" ? "chat" : "form";
    },
    addInteraction(state, action) {
      state.interactions.push({
        id: Date.now(),
        ...action.payload,
      });
    },
  },
});

export const { toggleMode, addInteraction } = interactionSlice.actions;

// ✅ THIS LINE WAS MISSING OR WRONG BEFORE
export default interactionSlice.reducer;












