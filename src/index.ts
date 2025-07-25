import SimpleMarkdown, {
    ParserRule,
    type SingleASTNode,
} from '@khanacademy/simple-markdown';
import { autolink } from './rules/autolink';
import { blockQuote } from './rules/blockQuote';
import { br } from './rules/br';
import { codeBlock } from './rules/codeBlock';
import { channel } from './rules/discord/channel';
import { emoji } from './rules/discord/emoji';
import { everyone } from './rules/discord/everyone';
import { guildNavigation } from './rules/discord/guildNavigation';
import { here } from './rules/discord/here';
import { role } from './rules/discord/role';
import { slashCommand } from './rules/discord/slashCommand';
import { timestamp } from './rules/discord/timestamp';
import { twemoji } from './rules/discord/twemoji';
import { user } from './rules/discord/user';
import { em } from './rules/em';
import { emoticon } from './rules/emoticon';
import { heading } from './rules/heading';
import { list } from './rules/list';
import { spoiler } from './rules/spoiler';
import { strikethrough } from './rules/strikethrough';
import { subtext } from './rules/subtext';
import { text } from './rules/text';
import { url } from './rules/url';

// rules normal users can use
export const rules: Record<string, ParserRule> = {
    blockQuote,
    codeBlock,
    newLine: SimpleMarkdown.defaultRules.newline,
    escape: SimpleMarkdown.defaultRules.escape,
    autolink,
    url,
    em,
    strong: SimpleMarkdown.defaultRules.strong,
    underline: SimpleMarkdown.defaultRules.u,
    strikethrough,
    inlineCode: SimpleMarkdown.defaultRules.inlineCode,
    // list: SimpleMarkdown.defaultRules.list,
    list,
    text,
    emoticon,
    br,
    spoiler,
    heading,
    subtext,

    // discord specific,
    user,
    channel,
    emoji,
    role,
    everyone,
    here,
    twemoji,
    timestamp,
    slashCommand,
    guildNavigation,
};

export const rulesExtended: Record<string, ParserRule> = {
    ...rules,
    link: SimpleMarkdown.defaultRules.link,
};

const parser = SimpleMarkdown.parserFor(rules);
const parserExtended = SimpleMarkdown.parserFor(rulesExtended);

export function parse(input: string, type: 'normal' | 'extended' = 'normal') {
    if (type === 'normal') return parser(input, { inline: true });
    else return parserExtended(input, { inline: true });
}

export default parse;

// some types
export type RuleTypes = keyof typeof rules;
export type RuleTypesExtended = keyof typeof rulesExtended;

export { SingleASTNode };
export type ASTNode = Array<SingleASTNode>;
