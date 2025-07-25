/**
 * A copy of SimpleMarkdown's list rule, but with modifications to match Discord's list behavior.
 * Only matches `*`, `-`, `{number}.` as list markers.
 * Breaks out of lists if there are 2+ newlines, and requires indentation for continuation.
 */

import SimpleMarkdown, { type ParserRule } from '@khanacademy/simple-markdown';
import { extend } from '../utils/extend';

// Only match *, -, or numbered lists (no + like standard markdown)
const LIST_BULLET = '(?:[*-]|\\d+\\.)';

// Recognize the start of a list item with any amount of leading space
const LIST_ITEM_PREFIX = '( *)(' + LIST_BULLET + ')( +)';
const LIST_ITEM_PREFIX_R = new RegExp('^' + LIST_ITEM_PREFIX);

// Main list regex - matches entire list block
const LIST_R = new RegExp(
    '^( *)(' +
        LIST_BULLET +
        ')( +)' +
        '[^\\n]*(?:\\n' +
        '(?!\\n)' + // No double newlines (would break the list)
        '(?:(?!\\1' +
        LIST_BULLET +
        ' )(?= )[^\\n]*|' + // Continuation with indent, or
        '\\1' +
        LIST_BULLET +
        ' [^\\n]*))*', // New list item at same level
    ''
);

const LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;

export const list: ParserRule = extend(
    {
        match: (source, state) => {
            const prevCaptureStr =
                state.prevCapture == null ? '' : state.prevCapture[0];
            const isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
            if (!isStartOfLineCapture) return null;

            const modifiedSource = isStartOfLineCapture[1] + source;
            const match = LIST_R.exec(modifiedSource);

            if (!match) return null;

            // Additional check: if malformed continuation, reject
            const lines = match[0].split('\n');
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') {
                    if (
                        i + 1 < lines.length &&
                        lines[i + 1].trim() !== '' &&
                        !lines[i + 1].match(/^ /)
                    ) {
                        return null;
                    }
                }
            }

            return match;
        },

        parse: (capture, parse, state) => {
            const bullet = capture[2];
            const ordered = bullet.length > 1;
            const start = ordered ? +bullet.slice(0, -1) : 1;
            const indent = capture[1].length;

            const items = [];
            const rawItems = capture[0].split(
                new RegExp(
                    '\\n(?=( {' + indent + '})(?:' + LIST_BULLET + ') )',
                    'g'
                )
            );

            for (let i = 0; i < rawItems.length; i++) {
                let item = rawItems[i];

                const lines = item.split('\n');

                // Strip list marker on first line, and base indent
                lines[0] = lines[0]
                    .replace(LIST_ITEM_PREFIX_R, '')
                    .slice(indent);

                // Strip base indent from continuation lines only
                for (let j = 1; j < lines.length; j++) {
                    lines[j] = lines[j].startsWith(' '.repeat(indent))
                        ? lines[j].slice(indent)
                        : lines[j];
                }

                item = lines.join('\n').replace(/^\n+|\n+$/g, '');
                if (item.length === 0) continue;

                items.push(parse(item, { ...state, _list: true }));
            }

            return {
                ordered,
                start,
                items,
            };
        },
    },
    SimpleMarkdown.defaultRules.list
);
