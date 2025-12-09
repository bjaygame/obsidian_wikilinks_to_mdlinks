'use strict';

const obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

let extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (let p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

let WikilinksToMdlinks = /** @class */ (function (_super) {
    __extends(WikilinksToMdlinks, _super);
    function WikilinksToMdlinks() {
        return _super !== null && _super.apply(this, arguments) || this;
    };
    WikilinksToMdlinks.prototype.onload = function () {
        const _this = this;
        console.log('loading wikilinks-to-mdlinks plugin...');
        this.addCommand({
            id: "toggle-wiki-md-links",
            name: "Toggle selected wikilink to markdown link and vice versa",
            checkCallback: function (checking) {
                const currentView = _this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                if (!currentView || (currentView.getMode() !== 'source')) {
                    return false;
                }
                if (!checking) {
                    _this.toggleLink();
                }
                return true;
            },
            hotkeys: [{
                    modifiers: ["Mod", "Shift"],
                    key: "L"
                }]
        });
    };
    WikilinksToMdlinks.prototype.onunload = function () {
        console.log('unloading wikilinks-to-mdlinks plugin');
    };
    WikilinksToMdlinks.prototype.toggleLink = function () {
        const currentView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        const editor = currentView.editor;
        let cursor = editor.getCursor();
        const originalContent = editor.getLine(cursor.line);
        const regexHasExtension = /^([^\\]*)\.(\w+)$/;
        const regexURL = /^(https?|ftp):\/\//i;
        const regexWiki = /\[\[([^\]]+)\]\]/;
        const regexWikiGlobal = /\[\[([^\]]*)\]\]/g;
        const wikiMatches = originalContent.match(regexWikiGlobal);

        let i = 0;
        let newContent = "";
        if (wikiMatches) {
            for (let _i = 0, wikiMatches_1 = wikiMatches; _i < wikiMatches_1.length; _i++) {
                let itemLink = wikiMatches_1[_i];
                let sliceContent = originalContent.slice(i);
                let idx = sliceContent.indexOf(itemLink);
                if(idx !== -1)
                    newContent += sliceContent.slice(0,sliceContent.indexOf(itemLink));
                let index = i + idx;
                let indexEnd = index + itemLink.length;
                i = indexEnd;               
                let wikiText = itemLink.match(regexWiki)[1];
                let linkDir = wikiText;
                let linkDes = "";
                if(!wikiText.match(regexURL) && !wikiText.match(regexHasExtension)){
                    let desIdx = wikiText.indexOf('|');
                    if(desIdx !== -1){
                        linkDir = wikiText.slice(0, desIdx).trimEnd();
                        linkDes = wikiText.slice(desIdx+1).trimStart();
                    }                   
                    if(linkDir.indexOf(".md")==-1){
                        let anchorIndex = linkDir.indexOf('#');
                        if (anchorIndex !== -1)
                            linkDir = linkDir.slice(0, anchorIndex).trimEnd() + '.md' + linkDir.slice(anchorIndex);
                        else
                            linkDir = linkDir + '.md';
                    }    
                }
                let newItem = "[" + linkDes + "](" + linkDir + ")";
                newContent += newItem;
            }
            newContent += originalContent.slice(i);
            editor.replaceRange(
                newContent,
                {line: cursor.line, ch: 0},
                {line: cursor.line, ch: originalContent.length}
            );
            i = 0;
            newContent = "";
        }
    };
    return WikilinksToMdlinks;
}(obsidian.Plugin));

module.exports = WikilinksToMdlinks;

/* nosourcemap */
