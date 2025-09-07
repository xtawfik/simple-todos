/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VSCode theme colors will be mapped here
        'vscode': {
          'editor-bg': 'var(--vscode-editor-background)',
          'editor-fg': 'var(--vscode-editor-foreground)',
          'sidebar-bg': 'var(--vscode-sideBar-background)',
          'sidebar-fg': 'var(--vscode-sideBar-foreground)',
          'input-bg': 'var(--vscode-input-background)',
          'input-fg': 'var(--vscode-input-foreground)',
          'input-border': 'var(--vscode-input-border)',
          'button-bg': 'var(--vscode-button-background)',
          'button-fg': 'var(--vscode-button-foreground)',
          'button-hover': 'var(--vscode-button-hoverBackground)',
          'list-hover': 'var(--vscode-list-hoverBackground)',
          'list-active': 'var(--vscode-list-activeSelectionBackground)',
          'focus-border': 'var(--vscode-focusBorder)',
          'badge-bg': 'var(--vscode-badge-background)',
          'badge-fg': 'var(--vscode-badge-foreground)',
        }
      }
    },
  },
  plugins: [],
}
