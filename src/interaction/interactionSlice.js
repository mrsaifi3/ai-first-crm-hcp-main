import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "form",
  interactions: [],
  formPrefill: null,
  listRefresh: 0,
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
    setFormPrefill(state, action) {
      state.formPrefill = action.payload;
    },
    refreshList(state) {
      state.listRefresh += 1;
    },
  },
});

export const { toggleMode, addInteraction, setFormPrefill, refreshList } = interactionSlice.actions;

// ✅ THIS LINE WAS MISSING OR WRONG BEFORE
export default interactionSlice.reducer;












