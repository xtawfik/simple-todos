export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  projectPath?: string;
}

export type TodoType = 'global' | 'project';

export interface TodoMessage {
  type: 'getTodos' | 'addTodo' | 'updateTodo' | 'deleteTodo' | 'clearCompleted' | 'importTodos';
  todoType?: TodoType;
  todo?: Todo;
  todos?: Todo[];
  todoId?: string;
  text?: string;
}

export interface TodoResponse {
  type: 'todosLoaded' | 'todoAdded' | 'todoUpdated' | 'todoDeleted' | 'todosImported';
  todos?: Todo[];
  todo?: Todo;
  error?: string;
}
