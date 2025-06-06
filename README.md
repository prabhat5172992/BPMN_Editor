# BPMN Editor

A web-based BPMN (Business Process Model and Notation) editor built with **React**, **TypeScript**, and **Vite**. This project allows users to create, edit, and export BPMN diagrams directly in the browser.

## Features

- **Drag-and-drop BPMN elements**: Start events, tasks, gateways, end events, and more.
- **Element properties panel**: Edit labels, IDs, and other properties.
- **Zoom and pan**: Navigate large diagrams easily.
- **Import/Export**: Load and save BPMN diagrams in XML format.
- **Undo/Redo**: Step backward and forward through your changes.
- **Keyboard shortcuts**: Speed up your workflow.
- **Responsive UI**: Works on desktop and tablets.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/your-username/bpmn-editor.git
cd bpmn-editor
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
bpmn-editor/
├── public/             # Static assets
├── src/
│   ├── components/     # React components (BPMN canvas, palette, properties panel, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions (BPMN XML parsing, exporting, etc.)
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── package.json
├── vite.config.ts
└── README.md
```

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [bpmn-js](https://bpmn.io/toolkit/bpmn-js/) (for BPMN rendering and editing)
- [ESLint](https://eslint.org/) (with recommended TypeScript and React rules)

## Customization

You can extend the editor by:

- Adding custom BPMN elements or overlays
- Integrating with backend services for diagram storage
- Customizing the properties panel

## License

This project is licensed under the MIT License.

---

> _This project was bootstrapped with the React + TypeScript + Vite template. See below for original template details._

---

# React + TypeScript + Vite (Original Template Info)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```