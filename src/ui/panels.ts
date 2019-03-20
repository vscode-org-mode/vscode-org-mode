import * as vscode from 'vscode'
import * as path from 'path'
import { PanelType } from './panel'

export const WelcomePanel: PanelType = {
    title: 'Welcome to org Mode',
    viewType: 'org.welcome',
    getBody() {
        return `
                <h1>Welcome to Org Mode</h1>
                <p>Org for the Best</p>`;
    }
}
export const UpgradePanel: PanelType = {
    title: 'org Mode needs to be Upgraded',
    viewType: 'org.upgrade',
    getBody() {
        return `<h1>Org Mode version is outdated</h1>
                <p>Org for the Best</p>
            `;
    }
}