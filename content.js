// content.js

// Settings
var issuekeyRegex;
var jiraurlHost;

// Function to retrieve settings and set global variables
function getSettings() {
    chrome.storage.sync.get(['issuekey', 'jiraurl'], function(items) {
        if (!items.jiraurl || !items.issuekey) {
            chrome.runtime.sendMessage({"action": "openOptionsPage"});
            return false;
        }

        issuekeyRegex = new RegExp(`(${items.issuekey}-\\d+)`, 'g');
        var inputUrl = items.jiraurl;
        if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
            inputUrl = "http://" + inputUrl;
        }
        jiraurlHost = new URL(inputUrl).hostname;
    });
    return true;
}

function addLinkToDetailPage() {
    let prTitleDiv = document.querySelector('.repos-pr-title-row');
    if (prTitleDiv) {
        let prTitle = prTitleDiv.querySelector('.bolt-textfield-input');
        if (prTitle)
        {
            let matches = prTitle.value.match(issuekeyRegex);
            if (matches) {
                let aDiv = prTitleDiv.parentElement.parentElement;
    
                let jiraButtons = Array.from(aDiv.getElementsByClassName("jira-link-button-class"));
                jiraButtons.forEach(function(element) {
                    aDiv.removeChild(element);
                });
    
                matches.forEach(match => {
                    let link = `https://${jiraurlHost}/browse/${match}`;
                    
                    let a = aDiv.querySelector(`#jira-link-button-${match}`);
                    if (a) {
                        a.setAttribute('href', link);
                        a.innerText = `View issue in Jira [${match}]`;
                    } else {
                        a = document.createElement('a');
                        a.setAttribute('id', `jira-link-button-${match}`);
                        a.setAttribute('class', 'bolt-link jira-link-button-class');
                        a.setAttribute('href', link);
                        a.setAttribute('target', '_blank');
                        a.setAttribute('style', 'padding-left:10px;padding-top:10px');
                        a.innerText = `View issue in Jira [${match}]`;
                        aDiv.appendChild(a);
                    }
                });
            }
        }
    }
}

function addLinkToListPage() {
    let prRows = Array.from(document.getElementsByClassName('bolt-table-cell-content'));
    if (prRows) {
        prRows.forEach(prRow => {
            let prTitleDiv = prRow.querySelector('.body-l');
            if (prTitleDiv) {
                let prTitle = prTitleDiv.innerHTML;
                if (!prTitle.includes("<a target='_blank' class='bolt-link'")) {
                    prTitle = prTitle.replace(issuekeyRegex, `<a target='_blank' class='bolt-link' href='https://${jiraurlHost}/browse/$1'>$1</a>`);
                    prTitleDiv.innerHTML = prTitle;
                }
            }
        });
    }
}

function performModifications() {
    if (window.location.href.includes('/pullrequest/')) {
        addLinkToDetailPage();
    }
    else if (window.location.href.includes('/pullrequests')) {
        addLinkToListPage();
    }
}


function throttle(func, limit) {
    let inThrottle;
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            // Call the function immediately
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Throttle the MutationObserver to not run too frequently
const throttledCallback = throttle(function (mutations) {
    stopObserver();
    performModifications();
    startObserver();
}, 650);

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(throttledCallback);

function stopObserver() {
    observer.disconnect();
}
function startObserver() {
    // Define the type of mutations to observe (childList for added/removed nodes) then start observing the target node for configured mutations
    observer.observe(document.body, { childList: false, subtree: true, attributes: true});
}

if (getSettings()) {
    startObserver();
}
