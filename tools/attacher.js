// ==UserScript==
// @name         SDKInjector
// @namespace    http://tampermonkey.net/
// @version      2025-11-29
// @description  Inject a script from localhost
// @author       You
// @match        https://www.de-rococo.co.il/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    console.log('[SDKInjector] Attempting to load script');
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://localhost:3001/sdk/sdk.js",
        onload: function(response) {
            if (response.status === 200) {
                const script = document.createElement('script');
                script.textContent = response.responseText;
                document.body.appendChild(script);
            } else {
                console.error('[SDKInjector] Failed to load the script: ', response.status);
            }
        }
    });
})();