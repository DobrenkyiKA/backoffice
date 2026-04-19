# 📖 Learning UI Description

The **Learning UI** is the frontend application for the Interview Preparation & Knowledge System. It provides interfaces for both end-users (learners) to consume content and administrators to manage and inspect the knowledge base and content production pipelines.

---

## 🎯 Business Perspective & Responsibilities

The Learning UI is responsible for the **User Experience** across different roles. It translates the core knowledge model into interactive and accessible interfaces.

### Key Responsibilities:
- **Learner Experience**: 
    - **Explore**: Browsing and reading interview questions and quizzes.
    - **Learn**: Structured learning mode for in-depth understanding.
    - **Quiz**: Interactive self-assessment and mistake analysis.
- **Admin Experience**:
    - **Topic Management**: Visualizing and managing the hierarchical topic structure.
    - **Content Inspection**: Providing a transparent, functional view of questions, answers, and explanations.
    - **Content Production Pipeline**: Managing the multi-stage, human-in-the-loop workflow for generating and approving new content (e.g., using AI assistance).
- **Security & Access**: Handling user authentication and authorization (via the Identity service).

---

## 🛠 Technology Stack

The application is built with modern frontend technologies for a fast, responsive, and type-safe experience:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Content Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) for rendering explanations and answers.
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🏗 Architecture

The project follows a modular structure organized by **features** and **layers**, leveraging Next.js App Router conventions.

### Directory Structure:
- `src/app`: Next.js App Router directory. Contains pages, layouts, and route handlers.
    - `admin`: Routes and components specifically for the Admin Backoffice.
    - `login`: Authentication-related pages.
- `src/features`: Contains domain-specific logic, components, and state management, organized by feature (e.g., `questions`, `topics`).
    - `*.api.ts`: API client functions for interacting with backend microservices.
    - `*.types.ts`: TypeScript interfaces and types for the feature domain.
    - `use*.ts`: Custom React hooks for feature-specific logic and data fetching.
- `src/components`: Shared, generic UI components (e.g., `MarkdownRenderer`).
- `src/auth`: Authentication logic, context, and service for managing JWT and user sessions.

### Key Patterns:
- **Feature-Based Organization**: Grouping related logic and components into feature directories to improve maintainability and scalability.
- **Custom Hooks**: Using React hooks to encapsulate business logic and data fetching, keeping components focused on presentation.
- **Component Composition**: Building complex UIs from smaller, reusable components.
- **Context API**: Used for global state management like Authentication.
