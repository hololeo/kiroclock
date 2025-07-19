const vscode = require('vscode');

function activate(context) {
    let statusBarItem;
    let updateInterval;

    function createStatusBarItem() {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'extension.toggleCountdown';
        statusBarItem.show();
        context.subscriptions.push(statusBarItem);
    }

    function getTimeToMidnightUTC() {
        const now = new Date();
        const midnight = new Date(now);
        
        // Set to next midnight UTC
        midnight.setUTCHours(24, 0, 0, 0);
        
        const diff = midnight.getTime() - now.getTime();
        return diff;
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateCountdown() {
        const timeLeft = getTimeToMidnightUTC();
        
        if (timeLeft <= 0) {
            // Reset to next midnight when current countdown reaches zero
            const formatted = formatTime(getTimeToMidnightUTC());
            statusBarItem.text = `👻 ${formatted}`;
        } else {
            const formatted = formatTime(timeLeft);
            statusBarItem.text = `👻 ${formatted}`;
        }
    }

    function startCountdown() {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        updateCountdown(); // Initial update
        updateInterval = setInterval(updateCountdown, 1000);
    }

    function stopCountdown() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        if (statusBarItem) {
            statusBarItem.text = '👻 Stopped';
        }
    }

    // Create status bar item and start countdown
    createStatusBarItem();
    startCountdown();

    // Register commands
    let toggleCommand = vscode.commands.registerCommand('extension.toggleCountdown', () => {
        if (updateInterval) {
            stopCountdown();
            vscode.window.showInformationMessage('Countdown stopped');
        } else {
            startCountdown();
            vscode.window.showInformationMessage('Countdown started');
        }
    });

    let startCommand = vscode.commands.registerCommand('extension.startCountdown', () => {
        startCountdown();
        vscode.window.showInformationMessage('Countdown to midnight UTC started');
    });

    let stopCommand = vscode.commands.registerCommand('extension.stopCountdown', () => {
        stopCountdown();
        vscode.window.showInformationMessage('Countdown stopped');
    });

    context.subscriptions.push(toggleCommand, startCommand, stopCommand);

    // Cleanup on deactivation
    context.subscriptions.push({
        dispose: () => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
            if (statusBarItem) {
                statusBarItem.dispose();
            }
        }
    });
}

function deactivate() {
    // Cleanup is handled in activate function
}

module.exports = {
    activate,
    deactivate
};
