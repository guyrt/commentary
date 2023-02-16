// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createRoot, findGitRoot } from './fileUtilities';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let showCommentaryHandler = vscode.commands.registerTextEditorCommand('commentary.showCommentary', (textEditor, edit) => {
		const docUri = textEditor.document.uri;
		
		// get the commentary doc location
		const gitRoot = findGitRoot(docUri.fsPath);

		// todo - if you run commentary inside commentary folder don't allow it. no recursive commentary

		const commentaryFile = createRoot(gitRoot);

		// show it in a window
		vscode.window.showTextDocument(vscode.Uri.file(commentaryFile), {
			viewColumn: vscode.ViewColumn.Beside
		});

	});

	context.subscriptions.push(showCommentaryHandler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
