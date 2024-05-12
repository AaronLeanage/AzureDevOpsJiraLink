document.addEventListener('DOMContentLoaded', function() {
    var saveButton = document.getElementById('saveButton');
	var outputTextLabel = document.getElementById('outputText');
	var msgCounter = 1;

    saveButton.addEventListener('click', function() {
        var issuekey = document.getElementById('issuekey').value;
        var jiraurl = document.getElementById('jiraurl').value;

        if (!issuekey || !jiraurl) {
			if (outputTextLabel.style["color"] !== 'red') {
				msgCounter = 1;
				outputTextLabel.style["color"] = 'red';
				outputTextLabel.innerHTML = "Both fields are required!";
			}
            else {
				msgCounter++;
				outputTextLabel.innerHTML = `Both fields are required! (${msgCounter})`;
			}
            return;
        }

        chrome.storage.sync.set({
            issuekey: issuekey,
            jiraurl: jiraurl
        }, function() {
			if (outputTextLabel.style["color"] !== 'green') {
				msgCounter = 1;
				outputTextLabel.style["color"] = 'green';
				outputTextLabel.innerHTML = "Settings Saved!";
			}
            else {
				msgCounter++;
				outputTextLabel.innerHTML = `Settings Saved! (${msgCounter})`;
			}
        });
    });

    // Load settings when the options page is opened
    chrome.storage.sync.get(['issuekey', 'jiraurl'], function(items) {
        document.getElementById('issuekey').value = items.issuekey || '';
        document.getElementById('jiraurl').value = items.jiraurl || '';
    });
});