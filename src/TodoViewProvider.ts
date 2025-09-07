import * as vscode from 'vscode';
import * as path from 'path';
import { GlobalTodoStore } from './storage/globalStore';
import { ProjectTodoStore } from './storage/projectStore';
import { Todo, TodoMessage, TodoType } from './models/todo';

export class TodoViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'simpleTodos.todoView';
  private _view?: vscode.WebviewView;
  private globalStore: GlobalTodoStore;
  private projectStore: ProjectTodoStore;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private context: vscode.ExtensionContext
  ) {
    this.globalStore = new GlobalTodoStore(context);
    this.projectStore = new ProjectTodoStore(vscode.workspace.workspaceFolders?.[0]);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'webview-ui/dist')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message: TodoMessage) => {
      switch (message.type) {
        case 'getTodos':
          await this.handleGetTodos(message.todoType || 'global');
          break;
        case 'addTodo':
          await this.handleAddTodo(message.text || '', message.todoType || 'global');
          break;
        case 'updateTodo':
          if (message.todo) {
            await this.handleUpdateTodo(message.todo, message.todoType || 'global');
          }
          break;
        case 'deleteTodo':
          if (message.todoId) {
            await this.handleDeleteTodo(message.todoId, message.todoType || 'global');
          }
          break;
        case 'clearCompleted':
          await this.handleClearCompleted(message.todoType || 'global');
          break;
        case 'importTodos':
          if (message.todos) {
            await this.handleImportTodos(message.todos, message.todoType || 'global');
          }
          break;
      }
    });

    // Load initial todos
    this.handleGetTodos('global');
  }

  private async handleGetTodos(todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    const todos = await store.getTodos();
    
    this._view?.webview.postMessage({
      type: 'todosLoaded',
      todos: todos
    });
  }

  private async handleAddTodo(text: string, todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    
    const newTodo: Todo = {
      id: this.generateId(),
      text: text,
      completed: false,
      createdAt: Date.now()
    };

    await store.addTodo(newTodo);
    
    this._view?.webview.postMessage({
      type: 'todoAdded',
      todo: newTodo
    });

    // Refresh the list
    this.handleGetTodos(todoType);
  }

  private async handleUpdateTodo(todo: Todo, todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    
    const updates: Partial<Todo> = {
      text: todo.text,
      completed: todo.completed
    };

    if (todo.completed && !todo.completedAt) {
      updates.completedAt = Date.now();
    } else if (!todo.completed) {
      updates.completedAt = undefined;
    }

    const updatedTodo = await store.updateTodo(todo.id, updates);
    
    if (updatedTodo) {
      this._view?.webview.postMessage({
        type: 'todoUpdated',
        todo: updatedTodo
      });
    }

    // Refresh the list
    this.handleGetTodos(todoType);
  }

  private async handleDeleteTodo(todoId: string, todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    const deleted = await store.deleteTodo(todoId);
    
    if (deleted) {
      this._view?.webview.postMessage({
        type: 'todoDeleted'
      });
    }

    // Refresh the list
    this.handleGetTodos(todoType);
  }

  private async handleClearCompleted(todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    await store.clearCompleted();
    
    // Refresh the list
    this.handleGetTodos(todoType);
  }

  private async handleImportTodos(todos: Todo[], todoType: TodoType) {
    const store = todoType === 'global' ? this.globalStore : this.projectStore;
    
    for (const todo of todos) {
      await store.addTodo(todo);
    }

    this._view?.webview.postMessage({
      type: 'todosImported'
    });

    // Refresh the list
    this.handleGetTodos(todoType);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'assets', 'index.js'));
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'assets', 'index.css'));

    // Get the theme colors from VSCode
    const colors = {
      '--vscode-editor-background': 'var(--vscode-editor-background)',
      '--vscode-editor-foreground': 'var(--vscode-editor-foreground)',
      '--vscode-sideBar-background': 'var(--vscode-sideBar-background)',
      '--vscode-sideBar-foreground': 'var(--vscode-sideBar-foreground)',
      '--vscode-input-background': 'var(--vscode-input-background)',
      '--vscode-input-foreground': 'var(--vscode-input-foreground)',
      '--vscode-input-border': 'var(--vscode-input-border)',
      '--vscode-button-background': 'var(--vscode-button-background)',
      '--vscode-button-foreground': 'var(--vscode-button-foreground)',
      '--vscode-button-hoverBackground': 'var(--vscode-button-hoverBackground)',
      '--vscode-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
      '--vscode-list-activeSelectionBackground': 'var(--vscode-list-activeSelectionBackground)',
      '--vscode-focusBorder': 'var(--vscode-focusBorder)',
      '--vscode-badge-background': 'var(--vscode-badge-background)',
      '--vscode-badge-foreground': 'var(--vscode-badge-foreground)',
      '--vscode-scrollbarSlider-background': 'var(--vscode-scrollbarSlider-background)',
      '--vscode-scrollbarSlider-hoverBackground': 'var(--vscode-scrollbarSlider-hoverBackground)',
      '--vscode-scrollbarSlider-activeBackground': 'var(--vscode-scrollbarSlider-activeBackground)',
    };

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
        <link href="${stylesUri}" rel="stylesheet">
        <title>Simple Todos</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          window.vscode = vscode;
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  private getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public async quickAddTodo(text: string, isGlobal: boolean = true) {
    await this.handleAddTodo(text, isGlobal ? 'global' : 'project');
  }
}
