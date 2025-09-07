import * as vscode from 'vscode';
import { TodoViewProvider } from './TodoViewProvider';

let todoProvider: TodoViewProvider;

export function activate(context: vscode.ExtensionContext) {
	console.log('Simple Todos extension is now active!');
	vscode.window.showInformationMessage('Simple Todos extension activated!');

	// Create and register the webview provider
	todoProvider = new TodoViewProvider(context.extensionUri, context);
	
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			TodoViewProvider.viewType,
			todoProvider,
			{
				webviewOptions: {
					retainContextWhenHidden: true
				}
			}
		)
	);

	// Register the quick add command
	context.subscriptions.push(
		vscode.commands.registerCommand('simpleTodos.quickAdd', async () => {
			const options: vscode.InputBoxOptions = {
				placeHolder: 'Enter your todo',
				prompt: 'Add a new todo item',
				validateInput: (text: string) => {
					return text.trim() === '' ? 'Please enter a todo' : null;
				}
			};

			const todoText = await vscode.window.showInputBox(options);
			
			if (todoText) {
				// Ask whether to add to global or project todos
				const quickPick = await vscode.window.showQuickPick(
					['Global', 'Project'],
					{
						placeHolder: 'Select todo type',
						canPickMany: false
					}
				);

				if (quickPick) {
					await todoProvider.quickAddTodo(todoText, quickPick === 'Global');
					vscode.window.showInformationMessage(`Todo added to ${quickPick} list`);
				}
			}
		})
	);

	// Register the toggle sidebar command
	context.subscriptions.push(
		vscode.commands.registerCommand('simpleTodos.toggleSidebar', () => {
			vscode.commands.executeCommand('simpleTodos.todoView.focus');
		})
	);
}

export function deactivate() {}
