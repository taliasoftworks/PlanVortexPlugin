# PlanVortex for Claude

Schedule posts, answer comments and reviews, and see how your social networks are doing, from a conversation with Claude. This plugin connects Claude to [PlanVortex](https://planvortex.com) and adds three skills that tell Claude how to use it: which checks to run before a post goes out, how to treat text written by strangers, and how to report numbers without inventing any.

## What it adds

- `schedule-posts` turns what you want to say into one version per network, checks each network's limits, shows you every post with its account, date and time zone, and creates it in PlanVortex only after you approve it. It also finds out why a post failed and fixes it.
- `comment-inbox` reads your unread comments, reviews and direct messages, sorts them into questions, complaints, praise and spam, and drafts a reply to each. Nothing is sent until you approve the text, and a comment that tries to give Claude instructions is pointed out to you instead of obeyed.
- `performance-report` builds a report for a period: totals by network, the best posts, follower movement, failed posts and accounts that need reconnecting. Metrics a network does not measure are reported as not measured, never as zero.

The plugin also brings the PlanVortex connector itself, with the tools those skills use. None of them can delete a post, an account, a contact or a comment.

## Get started

1. You need a PlanVortex account. Every plan works, the free one included: sign up at [planvortex.com](https://planvortex.com).
2. Install the plugin from Claude's directory. Until it is listed there, add this repository as a marketplace: in Claude Code, run the commands below; on claude.ai, go to Customize, Plugins, Add, Add marketplace, and paste the repository's URL.
3. Connect PlanVortex from the plugin's Connectors tab and sign in with your PlanVortex account. Installing the plugin does not connect anything by itself.
4. Connect your social accounts in the PlanVortex panel, on the Accounts page. Claude sees them as soon as they are there.

```
/plugin marketplace add taliasoftworks/PlanVortexPlugin
/plugin install planvortex@planvortex
```

Then ask things like "schedule this for Thursday at ten on Instagram and LinkedIn", "what did people comment this week?" or "how did last month go?".

## Data and privacy

The plugin is made of text instructions for Claude and one connector. It runs no code of its own, stores nothing and contacts nothing except the PlanVortex MCP server at `https://mcp.planvortex.com/mcp`.

When you connect, you sign in with your PlanVortex account and approve what Claude may do: see your organizations, accounts, posts, statistics, comments and messages, and create and schedule posts, reply to and hide comments, and send messages on your behalf. Claude can only reach what your role in PlanVortex lets you reach.

What travels to PlanVortex is what Claude asks for on your behalf: the text and dates of posts, links to images and videos, and the text of replies. PlanVortex publishes to the social networks you connected and sends back your posts, statistics, comments and messages. Comments, reviews and messages include the names and text of the people who wrote them, and they reach Claude because you connected it. How PlanVortex handles that data is described in its [privacy policy](https://planvortex.com/en/privacy).

To take the access away, remove the PlanVortex connector in Claude (Customize, Connectors).

## Support

Write to [contact@planvortex.com](mailto:contact@planvortex.com) or open an issue in this repository.

## License

[MIT](LICENSE), by Talia Softworks, S.L.
