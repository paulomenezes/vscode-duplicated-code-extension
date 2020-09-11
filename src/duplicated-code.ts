import * as vscode from 'vscode';

import { IClone } from '@jscpd/core';
import { DuplicatedCodeType } from './duplicated-code-type.enum';

export class DuplicatedCode extends vscode.TreeItem {
  public title?: string;

  private range1?: vscode.Range;
  private range2?: vscode.Range;
  private fileuri1?: vscode.Uri;
  private fileuri2?: vscode.Uri;

  constructor(
    public readonly index: number,
    public readonly clone: IClone | undefined,
    public readonly type: DuplicatedCodeType,
    public readonly workspaceFolder: vscode.WorkspaceFolder | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super('', collapsibleState);

    if (type === DuplicatedCodeType.workspace) {
      this.label = workspaceFolder?.name;
    } else if (clone) {
      const filenameA = clone.duplicationA.sourceId.split('/');
      const filenameB = clone.duplicationB.sourceId.split('/');

      const filename = type === DuplicatedCodeType.line ? filenameA : filenameB;

      const startA = `${clone.duplicationA.start.line}:${clone.duplicationA.start.column}`;
      const endA = `${clone.duplicationA.end.line}:${clone.duplicationA.end.column}`;

      const startB = `${clone.duplicationB.start.line}:${clone.duplicationB.start.column}`;
      const endB = `${clone.duplicationB.end.line}:${clone.duplicationB.end.column}`;

      const start = type === DuplicatedCodeType.line ? startA : startB;
      const end = type === DuplicatedCodeType.line ? endA : endB;

      const description = `${start} - ${end}`;

      this.label = filename[filename.length - 1];
      this.description = description;

      this.title = `${filenameA[filenameA.length - 1]} - ${filenameB[filenameB.length - 1]}`;

      this.command = {
        title: 'Open diff',
        command: 'duplicatedCode.openFile',
        arguments: [this],
      };

      this.range1 = new vscode.Range(
        new vscode.Position(clone.duplicationA.start.line - 1, (clone.duplicationA.start.column || 1) - 1),
        new vscode.Position(clone.duplicationA.end.line - 1, (clone.duplicationA.end.column || 1) - 1)
      );

      this.range2 = new vscode.Range(
        new vscode.Position(clone.duplicationB.start.line - 1, (clone.duplicationB.start.column || 1) - 1),
        new vscode.Position(clone.duplicationB.end.line - 1, (clone.duplicationB.end.column || 1) - 1)
      );

      this.fileuri1 = vscode.Uri.file(clone.duplicationA.sourceId);
      this.fileuri2 = vscode.Uri.file(clone.duplicationB.sourceId);
    }
  }

  public openFile(): void {
    if (this.clone) {
      vscode.commands.executeCommand('vscode.open', this.fileuri1, {
        selection: this.range1,
        viewColumn: vscode.ViewColumn.One,
      });

      vscode.commands.executeCommand('vscode.open', this.fileuri2, {
        selection: this.range2,
        viewColumn: vscode.ViewColumn.Two,
      });
    }
  }
}
