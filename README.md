# AI-First CRM – HCP Interaction Module (Frontend)

## 📌 Overview

This repository contains the **frontend application** for an **AI-First CRM system** designed to log, manage, and analyze Healthcare Professional (HCP) interactions.

The frontend provides:
- A structured interaction logging form
- An AI-powered assistant for natural language input
- Automatic form population using AI
- A clean, professional dashboard UI

It is built with **React + Vite** and communicates with the backend via standard REST APIs.

---

## 🎯 Objectives (Task 1 Alignment)

The frontend demonstrates:
- Human-friendly interaction logging
- AI-assisted workflows
- Clear separation of UI, logic, and API layers
- Seamless integration with an AI-powered backend (LangGraph + FastAPI)

This satisfies **Task 1 frontend requirements** of the assignment.

---

## ✨ Key Features

### 1️⃣ HCP Interaction Form
Users can log the following details:
- HCP Name  
- Interaction Type (Meeting, Call, etc.)
- Date & Time  
- Attendees  
- Topics Discussed  
- Product / Material Shared  
- Summary / Notes  

### 2️⃣ AI Assistant Panel
- Users describe interactions in natural language
- AI parses the description
- Relevant fields are auto-filled in the form
- Reduces manual data entry

### 3️⃣ Dual Input Modes
- **Form Mode** – Manual structured input
- **AI Mode** – Conversational AI-assisted input

### 4️⃣ Clean Dashboard UI
- Card-based layout
- Proper spacing & hierarchy
- Responsive design
- Submission-ready professional look

---

## 🧠 AI Auto-Fill Mechanism

The AI assistant emits structured data using a browser event:

```js
window.dispatchEvent(
  new CustomEvent("ai-fill-form", {
    detail: {
      hcpName,
      interactionType,
      summary,
      attendees,
      productsShared
    }
  })
);


