# Simple Todos

A clean and intuitive todo list extension for Visual Studio Code that helps you stay organized with both global and project-specific todos.

<img alt="CleanShot 2025-09-07 at 13 11 15@2x" src="https://github.com/user-attachments/assets/0e80b688-fc4f-421c-a2ad-785371858226" />

## ✨ Features

- **📝 Dual Todo Lists**: Maintain separate todo lists for global tasks and project-specific tasks
- **🎨 Theme Integration**: Automatically matches your VSCode theme colors for a seamless experience
- **🔍 Instant Search**: Quickly find todos with real-time search filtering
- **✏️ Inline Editing**: Edit todos directly in the list without dialogs
- **📅 Smart Timestamps**: See when todos were created or completed with relative time display
- **📋 Multiline Support**: Paste multiple lines and choose to create separate todos or keep as one
- **📜 History View**: Browse and manage completed todos
- **⚡ Quick Add**: Use keyboard shortcut (`Ctrl+Alt+T` / `Cmd+Alt+T`) to quickly add todos
- **💾 Persistent Storage**: Global todos are saved in VSCode storage, project todos in `.vscode/todos.json`
  
<img alt="CleanShot 2025-09-07 at 13 11 42@2x" src="https://github.com/user-attachments/assets/c72560fb-eda4-4213-9312-53d3241d8620" />

`Paste multiple lines and choose to create separate todos or keep as one`

<img alt="CleanShot 2025-09-07 at 13 11 52@2x" src="https://github.com/user-attachments/assets/72f42276-6d77-40d4-aa04-71adcec59341" />

`TODO details modal`

<img alt="CleanShot 2025-09-07 at 13 12 24@2x" src="https://github.com/user-attachments/assets/98b647ba-935b-41c7-ab7a-8ab1889ed5de" />

`Completed TODOs history`


## 🚀 Getting Started

1. Install the extension from the VSCode Marketplace
2. Open the Simple Todos sidebar in the Explorer view
3. Start adding todos!

### Keyboard Shortcuts

- `Ctrl+Alt+T` (Windows/Linux) or `Cmd+Alt+T` (Mac): Quick add todo
- `Enter`: Save when editing a todo
- `Escape`: Cancel editing

## 📦 Requirements

- VSCode version 1.103.0 or higher
- No additional dependencies required

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/simple-todos.git
cd simple-todos

# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Build the extension
npm run compile
npm run build:webview

# Open in VSCode and press F5 to run
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📢 Feedback

If you have any feedback or run into issues, please file an issue on the [GitHub repository](https://github.com/yourusername/simple-todos/issues).

---

**Enjoy staying organized with Simple Todos!** 🎉
