import * as vscode from 'vscode';
import { Todo } from '../models/todo';

export class GlobalTodoStore {
  private static readonly STORAGE_KEY = 'simpleTodos.globalTodos';
  
  constructor(private context: vscode.ExtensionContext) {}

  async getTodos(): Promise<Todo[]> {
    const todos = this.context.globalState.get<Todo[]>(GlobalTodoStore.STORAGE_KEY, []);
    return todos;
  }

  async addTodo(todo: Todo): Promise<void> {
    const todos = await this.getTodos();
    todos.push(todo);
    await this.context.globalState.update(GlobalTodoStore.STORAGE_KEY, todos);
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const todos = await this.getTodos();
    const index = todos.findIndex(t => t.id === id);
    
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      await this.context.globalState.update(GlobalTodoStore.STORAGE_KEY, todos);
      return todos[index];
    }
    
    return undefined;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const todos = await this.getTodos();
    const filteredTodos = todos.filter(t => t.id !== id);
    
    if (filteredTodos.length !== todos.length) {
      await this.context.globalState.update(GlobalTodoStore.STORAGE_KEY, filteredTodos);
      return true;
    }
    
    return false;
  }

  async clearCompleted(): Promise<void> {
    const todos = await this.getTodos();
    const activeTodos = todos.filter(t => !t.completed);
    await this.context.globalState.update(GlobalTodoStore.STORAGE_KEY, activeTodos);
  }

  async getCompletedTodos(): Promise<Todo[]> {
    const todos = await this.getTodos();
    return todos.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }
}
