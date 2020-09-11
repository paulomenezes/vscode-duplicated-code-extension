import * as vscode from 'vscode';
import { IClone } from '@jscpd/core';
import { detectClones } from 'jscpd';

import { DuplicatedCode } from './duplicated-code';
import { DuplicatedCodeType } from './duplicated-code-type.enum';

export class DuplicatedCodeProvider implements vscode.TreeDataProvider<DuplicatedCode> {
  public _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

  private clones: IClone[] = [];

  constructor(private workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined) {}

  getTreeItem(element: DuplicatedCode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: DuplicatedCode | undefined): vscode.ProviderResult<DuplicatedCode[]> {
    if (!this.workspaceFolders || this.workspaceFolders.length === 0) {
      vscode.window.showInformationMessage('Empty workspace');
      return Promise.resolve([]);
    }

    if (!element) {
      return this.workspaceFolders.map(
        (workspace) =>
          new DuplicatedCode(
            -1,
            undefined,
            DuplicatedCodeType.workspace,
            workspace,
            this.workspaceFolders?.length === 1 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed
          )
      );
    } else if (element.type === DuplicatedCodeType.workspace) {
      return detectClones({
        noSymlinks: true,
        reporters: [],
        path: [element.workspaceFolder?.uri.path!],
        ignore: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/build/**', '**/*.js'],
      }).then((clones: IClone[]) => {
        this.clones = clones;
        return clones.map(
          (clone, index) => new DuplicatedCode(index, clone, DuplicatedCodeType.line, undefined, vscode.TreeItemCollapsibleState.Collapsed)
        );
      });
    } else {
      return [new DuplicatedCode(-1, this.clones[element.index], DuplicatedCodeType.detail, undefined, vscode.TreeItemCollapsibleState.None)];
    }
  }
}
