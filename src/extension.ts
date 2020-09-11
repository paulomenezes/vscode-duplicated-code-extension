import * as vscode from 'vscode';

import { DuplicatedCode } from './duplicated-code';
import { DuplicatedCodeProvider } from './duplicated-code.provider';

export function activate() {
  const duplicatedCodeProvider = new DuplicatedCodeProvider(vscode.workspace.workspaceFolders);
  vscode.window.registerTreeDataProvider('duplicatedCode', duplicatedCodeProvider);

  vscode.commands.registerCommand('duplicatedCode.refreshEntry', () => {
    duplicatedCodeProvider._onDidChangeTreeData.fire();
  });

  vscode.commands.registerCommand('duplicatedCode.openFile', (duplicateCode: DuplicatedCode) => {
    duplicateCode.openFile();
  });
}
