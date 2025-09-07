import { useEffect, useState, useCallback } from 'react';
import type { Todo, TodoType, TodoMessage, TodoResponse } from '../types/todo';

export const useVSCodeMessaging = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoType, setTodoType] = useState<TodoType>('global');
  const [loading, setLoading] = useState(true);

  const sendMessage = useCallback((message: TodoMessage) => {
    window.vscode.postMessage(message);
  }, []);

  const loadTodos = useCallback((type: TodoType) => {
    setLoading(true);
    sendMessage({ type: 'getTodos', todoType: type });
  }, [sendMessage]);

  const addTodo = useCallback((text: string) => {
    sendMessage({ type: 'addTodo', text, todoType });
  }, [sendMessage, todoType]);

  const updateTodo = useCallback((todo: Todo) => {
    sendMessage({ type: 'updateTodo', todo, todoType });
  }, [sendMessage, todoType]);

  const deleteTodo = useCallback((todoId: string) => {
    sendMessage({ type: 'deleteTodo', todoId, todoType });
  }, [sendMessage, todoType]);

  const clearCompleted = useCallback(() => {
    sendMessage({ type: 'clearCompleted', todoType });
  }, [sendMessage, todoType]);

  const importTodos = useCallback((todos: Todo[]) => {
    sendMessage({ type: 'importTodos', todos, todoType });
  }, [sendMessage, todoType]);

  const switchTodoType = useCallback((type: TodoType) => {
    setTodoType(type);
    loadTodos(type);
  }, [loadTodos]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<TodoResponse>) => {
      const message = event.data;
      
      switch (message.type) {
        case 'todosLoaded':
          if (message.todos) {
            setTodos(message.todos);
            setLoading(false);
          }
          break;
        case 'todoAdded':
        case 'todoUpdated':
        case 'todoDeleted':
        case 'todosImported':
          // Todos will be refreshed by the extension
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Load initial todos
    loadTodos(todoType);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    todos,
    todoType,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    importTodos,
    switchTodoType,
    loadTodos
  };
};
