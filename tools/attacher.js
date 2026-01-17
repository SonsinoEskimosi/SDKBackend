// ==UserScript==
// @name         SDKInjector
// @namespace    http://tampermonkey.net/
// @version      2025-11-29
// @description  Inject a script from localhost
// @author       You
// @match        https://www.de-rococo.co.il/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // Only run in top window, not in iframes
    if (window !== window.top) {
        console.log('[SDKInjector] Skipping iframe');
        return;
    }
    
    // Prevent multiple injections
    if (window.__JSSDK_INJECTED__) {
        console.log('[SDKInjector] Already injected');
        return;
    }
    
    window.__JSSDK_INJECTED__ = true;
    
    console.log('[SDKInjector] Attempting to load script');
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://macaw-cheerful-ghastly.ngrok-free.app/sdk/sdk.js",
        onload: function(response) {
            if (response.status === 200) {
                const contentType = response.responseHeaders.toLowerCase();
                const isJavaScript = contentType.includes('application/javascript') || 
                                    contentType.includes('text/javascript') ||
                                    response.responseText.trim().startsWith('(function') ||
                                    response.responseText.trim().startsWith('!function');
                
                if (!isJavaScript) {
                    console.error('[SDKInjector] Response is not JavaScript. First 200 chars:', response.responseText.substring(0, 200));
                    return;
                }
                
                const script = document.createElement('script');
                script.textContent = response.responseText;
                (document.head || document.documentElement).appendChild(script);
                console.log('[SDKInjector] Script injected successfully');
            } else {
                console.error('[SDKInjector] Failed to load the script. Status:', response.status);
                console.error('[SDKInjector] Response:', response.responseText.substring(0, 200));
            }
        },
        onerror: function(error) {
            console.error('[SDKInjector] Network error:', error);
        }
    });
})();