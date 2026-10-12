---
name: performance-report
description: Report how the user's social media is performing, from PlanVortex data. Use when the user asks how their social networks did this week or this month, wants a results report or a summary for a client or their boss, asks which posts worked best, how their followers grew, how one network compares with another, or how the posts from PlanVortex's AI planner performed.
---

# Report social media results from PlanVortex

Every figure in the report comes from a PlanVortex tool call made in this conversation. A metric that a network does not measure is reported as not measured, never as zero. Answer in the user's language.

## 0. Check the connection

Call `list_organizations` first.

- If the PlanVortex tools are not available, or the call fails with an authentication error, stop. Tell the user PlanVortex is not connected yet: in Claude, open the PlanVortex plugin, go to its **Connectors** tab and connect, signing in with their PlanVortex account. Do not produce a report, or any number, without data from the tools.
- If there is more than one organization and the user has not said which, ask. Then pass that `id_organization` on every call.

## 1. Fix the period

- Without a period, use the last 30 days.
- "Last month" is the previous calendar month, and "this month" runs from the 1st to today.
- Write the exact dates at the top of the report.
- To compare, use the previous period of the same length.

## 2. Gather the data

1. `get_dashboard_summary` for the period: posts published, totals by network, failed posts, accounts in error and unread messages. It is the backbone of the report, so do not rebuild it from other tools. For a comparison, call it once per period.
2. `get_top_publications` with the default metric, `engagement`, which every network reports. Ranking by `impressions` or `reach` silently leaves out the networks that do not measure them. Five posts are usually enough.
3. `get_account_metrics` for the main accounts, to show how followers moved. The series it returns differ by network, so read what came back instead of assuming a metric is there.
4. `get_publication_stats` only when one post matters on its own. Each point is the cumulative value on that date, not that day's increase.
5. If the user uses the AI planner, `get_ai_plan_results`. It ranks plans by interactions per measured post; when it marks a plan as still maturing, say so before comparing it with an older one.

## 3. What some networks do not measure

- Bluesky, Telegram and Slack have no impressions or reach at all, and their engagement is measured against followers. On Slack the only metric is reactions. Write "not measured" in those cells instead of leaving them empty or putting 0.
- A metric missing from a post or a network means it is not measured there. It does not mean nobody saw the post.
- Pinterest reports how many comments a pin has, but the comments themselves cannot be read.
- Recent posts are still collecting numbers. Say so before comparing a post from yesterday with one from last month.
- Do not quote industry benchmarks or "average engagement rates". Compare the user with their own earlier results.

## 4. Write the report

Adapt this order to what the user asked for:

1. The period, and a one-line headline with the change that matters most and its number.
2. A table by network: posts published, engagement, impressions or reach where they are measured, and the change in followers.
3. The best posts: what each one was, where it went out, its figure, and a possible reason taken from the post itself (format, subject, timing). Present the reason as a guess, not a finding.
4. Problems: failed posts and accounts in error, with what fixes them (reconnect the account in the PlanVortex panel; fix the post and retry it).
5. Two or three suggestions that follow from these numbers. Leave out generic advice.

Keep the figures as the tools returned them, and say which network or account each one belongs to.
