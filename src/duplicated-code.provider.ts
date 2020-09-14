import * as vscode from 'vscode';
import { IClone, JSCPD, getStoreManager } from 'jscpd';

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

    let exclude: string[] | undefined = vscode.workspace.getConfiguration('duplicated-code').get('exclude');

    if (!exclude) {
      exclude = ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/build/**'];
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
      const path = `${element.workspaceFolder?.uri.path!}/`;

      const cpd = new JSCPD({
        noSymlinks: true,
        storeOptions: {
          '*': {
            type: 'memory',
            options: {
              name: 'memory',
              persist: false,
            },
          },
        },
        absolute: false,
        path: [path],
        ignore: exclude,
        gitignore: true,
        silent: true,
        debug: false,
        output: undefined,
      });

      return cpd
        .detectInFiles([path])
        .then((clones: IClone[]) => {
          this.clones = clones;

          getStoreManager().close();

          return clones.map(
            (clone, index) => new DuplicatedCode(index, clone, DuplicatedCodeType.line, undefined, vscode.TreeItemCollapsibleState.Collapsed)
          );
        })
        .catch((error) => {
          console.log(error);
          return [];
        });
    } else {
      return [new DuplicatedCode(-1, this.clones[element.index], DuplicatedCodeType.detail, undefined, vscode.TreeItemCollapsibleState.None)];
    }
  }
}
