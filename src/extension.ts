// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createCommentaryFile } from './fileUtilities';


function showCommentaryFile(docUri : vscode.Uri, fileName = "main.md") {
		
	const commentaryFile = createCommentaryFile(docUri, fileName);

	// show it in a window
	vscode.window.showTextDocument(vscode.Uri.file(commentaryFile), {
		viewColumn: vscode.ViewColumn.Beside
	});
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let showCommentaryHandler = vscode.commands.registerTextEditorCommand('commentary.showCommentary', (textEditor, edit) => {
		const docUri = textEditor.document.uri;

		showCommentaryFile(docUri);
	});

	let showNamedCommentaryHandler = vscode.commands.registerTextEditorCommand("commentary.showNamedCommentary",
		async (textEditor, edit) => {
			const docUri = textEditor.document.uri;

			let result = await vscode.window.showInputBox({
				value: 'main.md',
				valueSelection: [2, 4],
				placeHolder: '',
				title: 'Name the file',
				validateInput: text => {
					return null;
				}
			});

			if (result === undefined) {
				return;
			}

			if (!result.endsWith(".md")) {
				result = result + ".md";
			}

			showCommentaryFile(docUri, result);
	});

	context.subscriptions.push(showCommentaryHandler);
	context.subscriptions.push(showNamedCommentaryHandler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
