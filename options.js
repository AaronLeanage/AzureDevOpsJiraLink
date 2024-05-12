document.addEventListener('DOMContentLoaded', function() {
    var saveButton = document.getElementById('saveButton');

    saveButton.addEventListener('click', function() {
        var issuekey = document.getElementById('issuekey').value;
        var jiraurl = document.getElementById('jiraurl').value;

        if (!issuekey || !jiraurl) {
            alert("Both fields are required!");
            return;
        }

        chrome.storage.sync.set({
            issuekey: issuekey,
            jiraurl: jiraurl
        }, function() {
            alert("Settings saved!");
        });
    });

    // Load settings when the options page is opened
    chrome.storage.sync.get(['issuekey', 'jiraurl'], function(items) {
        document.getElementById('issuekey').value = items.issuekey || '';
        document.getElementById('jiraurl').value = items.jiraurl || '';
    });
});