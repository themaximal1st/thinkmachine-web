export const getNodeAndOffsetFromIndex = function (parent, targetIndex) {
    let currentIndex = 0;

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (currentIndex + node.length >= targetIndex) {
                return {
                    node: node,
                    offset: targetIndex - currentIndex
                };
            }
            currentIndex += node.length;
        } else if (node.nodeName === 'BR') {
            if (currentIndex === targetIndex) {
                return {
                    node: node.parentNode,
                    offset: getNodeOffset(node)
                };
            }
            currentIndex++;
        } else {
            for (let child of node.childNodes) {
                const result = traverse(child);
                if (result) return result;
            }
        }
        return null;
    }

    return traverse(parent);
}

var editor = null;
var output = null;

export const getTextSelection = function (editor) {
    const selection = window.getSelection();

    if (selection != null && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        return {
            start: getTextLength(editor, range.startContainer, range.startOffset),
            end: getTextLength(editor, range.endContainer, range.endOffset)
        };
    } else
        return null;
}

const getTextLength = function (parent, node, offset) {
    var textLength = 0;

    if (node.nodeName == '#text')
        textLength += offset;
    else for (var i = 0; i < offset; i++)
        textLength += getNodeTextLength(node.childNodes[i]);

    if (node != parent)
        textLength += getTextLength(parent, node.parentNode, getNodeOffset(node));

    return textLength;
}

const getNodeTextLength = function (node) {
    var textLength = 0;

    if (node.nodeName == 'BR')
        textLength = 1;
    else if (node.nodeName == '#text')
        textLength = node.nodeValue.length;
    else if (node.childNodes != null)
        for (var i = 0; i < node.childNodes.length; i++)
            textLength += getNodeTextLength(node.childNodes[i]);

    return textLength;
}

const getNodeOffset = function (node) {
    return node == null ? -1 : 1 + getNodeOffset(node.previousSibling);
}

// New function to set text selection
export const setTextSelection = function (editor, selection) {
    const range = document.createRange();
    const start = getNodeAndOffsetFromIndex(editor, selection.start);
    const end = getNodeAndOffsetFromIndex(editor, selection.end);

    if (start && end) {
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// Helper function to find node and offset from index


window.onload = function () {
    editor = document.querySelector('.editor');
    output = document.querySelector('#output');

    document.addEventListener('selectionchange', handleSelectionChange);
}

const handleSelectionChange = function () {
    if (isEditor(document.activeElement)) {
        const textSelection = getTextSelection(document.activeElement);

        if (textSelection != null) {
            const text = document.activeElement.innerText;
            const selection = text.slice(textSelection.start, textSelection.end);
            print(`Selection: [${selection}] (Start: ${textSelection.start}, End: ${textSelection.end})`);
        } else
            print('Selection is null!');
    } else
        print('Select some text above');
}

const isEditor = function (element) {
    return element != null && element.classList.contains('editor');
}

const print = function (message) {
    return;

    if (output != null)
        output.innerText = message;
    else
        console.log('output is null!');
}