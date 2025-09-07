import { useState, useCallback, useMemo } from 'react';
import { useVSCodeMessaging } from './hooks/useVSCodeMessaging';
import type { Todo, TodoType } from './types/todo';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Search, Plus, Trash2, History, Edit2, Clock, Calendar } from 'lucide-react';

function App() {
  const {
    todos,
    todoType,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    switchTodoType
  } = useVSCodeMessaging();

  const [searchQuery, setSearchQuery] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [multilineDialog, setMultilineDialog] = useState<{
    open: boolean;
    text: string;
    lines: string[];
  }>({ open: false, text: '', lines: [] });

  // Filter todos based on search and completion status
  const filteredTodos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const activeTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    if (showHistory) {
      return completedTodos
        .filter(t => t.text.toLowerCase().includes(query))
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    }

    return activeTodos.filter(t => t.text.toLowerCase().includes(query));
  }, [todos, searchQuery, showHistory]);

  const handleAddTodo = useCallback(() => {
    const text = newTodoText.trim();
    if (!text) return;

    // Check for multiline input
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 1) {
      setMultilineDialog({ open: true, text, lines });
      return;
    }

    addTodo(text);
    setNewTodoText('');
  }, [newTodoText, addTodo]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length > 1) {
      e.preventDefault();
      setMultilineDialog({ open: true, text, lines });
    }
  }, []);

  const handleMultilineChoice = useCallback((split: boolean) => {
    if (split) {
      multilineDialog.lines.forEach(line => {
        addTodo(line.trim());
      });
    } else {
      addTodo(multilineDialog.text);
    }
    setMultilineDialog({ open: false, text: '', lines: [] });
    setNewTodoText('');
  }, [multilineDialog, addTodo]);

  const handleToggleTodo = useCallback((todo: Todo) => {
    updateTodo({ ...todo, completed: !todo.completed });
  }, [updateTodo]);

  const handleStartEdit = useCallback((e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation();
    setEditingId(todo.id);
    setEditText(todo.text);
  }, []);

  const handleSaveEdit = useCallback((todo: Todo) => {
    if (editText.trim() && editText !== todo.text) {
      updateTodo({ ...todo, text: editText.trim() });
    }
    setEditingId(null);
    setEditText('');
  }, [editText, updateTodo]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const handleTodoClick = useCallback((todo: Todo) => {
    // Only open dialog if not editing
    if (editingId !== todo.id) {
      setSelectedTodo(todo);
    }
  }, [editingId]);

  const handleDeleteTodo = useCallback((e: React.MouseEvent, todoId: string) => {
    e.stopPropagation();
    deleteTodo(todoId);
  }, [deleteTodo]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? 'just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-vscode-sidebar-fg/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar-bg text-vscode-sidebar-fg">
      {/* Header with Tabs and History Button */}
      <div className="p-2 border-b border-vscode-input-border">
        <div className="flex items-center justify-between">
          <Tabs value={todoType} onValueChange={(value) => switchTodoType(value as TodoType)} className="flex-none">
            <TabsList className="h-7">
              <TabsTrigger value="global" className="text-xs h-6">Global</TabsTrigger>
              <TabsTrigger value="project" className="text-xs h-6">Project</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="h-6 text-xs"
          >
            <History className="h-3 w-3 mr-1" />
            {showHistory ? 'Active' : 'History'}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-vscode-input-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-vscode-sidebar-fg/50" />
          <Input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Todo List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-vscode-sidebar-fg/50 text-sm">
                {showHistory ? 'No completed todos' : 'No todos yet. Add one below!'}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-start gap-2 p-2 rounded hover:bg-vscode-list-hover cursor-pointer"
                  onClick={() => handleTodoClick(todo)}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggleTodo(todo)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(todo);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="h-6 text-xs"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(todo)}
                        className="h-6 w-6 p-0"
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className={`text-sm truncate ${todo.completed ? 'line-through opacity-50' : ''}`}>
                          {todo.text}
                        </span>
                        <span className="text-xs text-vscode-sidebar-fg/30">
                          {formatDate(todo.completedAt || todo.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!todo.completed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleStartEdit(e, todo)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteTodo(e, todo.id)}
                          className="h-6 w-6 p-0 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-vscode-input-border p-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new todo..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              onPaste={handlePaste}
              className="flex-1 h-7 text-xs"
            />
            <Button
              size="sm"
              onClick={handleAddTodo}
              disabled={!newTodoText.trim()}
              className="h-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {showHistory && filteredTodos.length > 0 && (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearCompleted}
                className="h-6 text-xs hover:text-red-500"
              >
                Clear History
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Todo Details Dialog */}
      <Dialog open={!!selectedTodo} onOpenChange={(open) => !open && setSelectedTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {selectedTodo?.completed ? (
                <span className="text-green-500">✓</span>
              ) : (
                <Clock className="h-4 w-4 text-vscode-sidebar-fg/50" />
              )}
              Todo Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-vscode-input-bg rounded-md">
              <p className={`text-sm ${selectedTodo?.completed ? 'line-through opacity-50' : ''}`}>
                {selectedTodo?.text}
              </p>
            </div>
            <div className="space-y-2 text-xs text-vscode-sidebar-fg/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Created: {selectedTodo && formatFullDate(selectedTodo.createdAt)}</span>
              </div>
              {selectedTodo?.completed && selectedTodo.completedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Completed: {formatFullDate(selectedTodo.completedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <span className="px-2 py-0.5 bg-vscode-badge-bg text-vscode-badge-fg rounded text-xs">
                  {selectedTodo?.projectPath ? 'Project' : 'Global'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between">
              {!selectedTodo?.completed ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedTodo) {
                        handleToggleTodo(selectedTodo);
                        setSelectedTodo(null);
                      }
                    }}
                    className="flex-1 mr-2"
                  >
                    Mark as Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (selectedTodo) {
                        deleteTodo(selectedTodo.id);
                        setSelectedTodo(null);
                      }
                    }}
                    className="hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (selectedTodo) {
                      deleteTodo(selectedTodo.id);
                      setSelectedTodo(null);
                    }
                  }}
                  className="hover:text-red-500 mx-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multiline Dialog */}
      <Dialog open={multilineDialog.open} onOpenChange={(open) => 
        setMultilineDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multiple Lines Detected</DialogTitle>
            <DialogDescription>
              You're trying to add {multilineDialog.lines.length} lines.
              Would you like to create separate todos for each line?
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-32 overflow-y-auto p-2 bg-vscode-input-bg rounded text-xs">
            {multilineDialog.lines.map((line, i) => (
              <div key={i}>• {line}</div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleMultilineChoice(false)}
            >
              Keep as one
            </Button>
            <Button onClick={() => handleMultilineChoice(true)}>
              Split into {multilineDialog.lines.length} todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
