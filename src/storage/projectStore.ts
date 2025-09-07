import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Todo } from '../models/todo';

export class ProjectTodoStore {
  private static readonly TODO_FILE = '.vscode/todos.json';
  
  constructor(private workspaceFolder?: vscode.WorkspaceFolder) {}

  private get todoFilePath(): string | undefined {
    if (!this.workspaceFolder) {
      return undefined;
    }
    return path.join(this.workspaceFolder.uri.fsPath, ProjectTodoStore.TODO_FILE);
  }

  async ensureVscodeFolder(): Promise<void> {
    if (!this.workspaceFolder) {
      return;
    }
    
    const vscodePath = path.join(this.workspaceFolder.uri.fsPath, '.vscode');
    try {
      await fs.access(vscodePath);
    } catch {
      await fs.mkdir(vscodePath, { recursive: true });
    }
  }

  async getTodos(): Promise<Todo[]> {
    const filePath = this.todoFilePath;
    if (!filePath) {
      return [];
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return data.todos || [];
    } catch {
      return [];
    }
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    const filePath = this.todoFilePath;
    if (!filePath) {
      return;
    }

    await this.ensureVscodeFolder();
    
    const data = {
      version: '1.0.0',
      todos: todos,
      lastModified: new Date().toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async addTodo(todo: Todo): Promise<void> {
    const todos = await this.getTodos();
    todos.push({ ...todo, projectPath: this.workspaceFolder?.uri.fsPath });
    await this.saveTodos(todos);
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const todos = await this.getTodos();
    const index = todos.findIndex(t => t.id === id);
    
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      await this.saveTodos(todos);
      return todos[index];
    }
    
    return undefined;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const todos = await this.getTodos();
    const filteredTodos = todos.filter(t => t.id !== id);
    
    if (filteredTodos.length !== todos.length) {
      await this.saveTodos(filteredTodos);
      return true;
    }
    
    return false;
  }

  async clearCompleted(): Promise<void> {
    const todos = await this.getTodos();
    const activeTodos = todos.filter(t => !t.completed);
    await this.saveTodos(activeTodos);
  }

  async getCompletedTodos(): Promise<Todo[]> {
    const todos = await this.getTodos();
    return todos.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }
}
