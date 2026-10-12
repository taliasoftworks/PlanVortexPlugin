# PlanVortex plugin for Claude

The PlanVortex plugin lets Claude schedule posts, answer comments and reviews, and report results across your social networks through [PlanVortex](https://planvortex.com). It bundles the PlanVortex connector with three skills; [planvortex/README.md](planvortex/README.md) explains what each one does, how to get started and what data it sends.

## Install

Once it is listed, install it from Claude's directory. Until then, add this repository as a marketplace. In Claude Code:

```
/plugin marketplace add taliasoftworks/PlanVortexPlugin
/plugin install planvortex@planvortex
```

On claude.ai, go to Customize, Plugins, Add, Add marketplace, and paste this repository's URL. Then connect PlanVortex from the plugin's Connectors tab and sign in with your PlanVortex account.

## What is in this repository

- `planvortex/` is the plugin, and the only folder that ships to people who install it.
- `.claude-plugin/marketplace.json` lists it, so the repository works as a one-plugin marketplace.
- `evals/` holds the cases `claude plugin eval` runs, with mocked PlanVortex tools that answer with invented data. It sits outside the plugin on purpose: one of the cases contains a prompt injection, and the plugin folder is what gets installed.
- `scripts/eval.mjs` runs that suite against a temporary copy of the plugin.

## Evaluate a change

The suite never contacts PlanVortex, but every run is a real model call on the account Claude Code is signed in with.

```
node scripts/eval.mjs              # the suite against the plugin
node scripts/eval.mjs --compare    # the plugin against the connector alone, side by side
node scripts/eval.mjs --compare -- --case inbox-triage --runs 1
```

`--compare` answers the question that decides whether a skill stays: does Claude do better with it than with the PlanVortex connector on its own? A skill that does not improve the results is removed.

## Release

Raise `version` in `planvortex/.claude-plugin/plugin.json` with every change to the plugin. A change to the PlanVortex tools needs no new version of the plugin: the tools come from the server at `https://mcp.planvortex.com/mcp`.

## License

[MIT](LICENSE), by Talia Softworks, S.L. Questions and problems: [contact@planvortex.com](mailto:contact@planvortex.com) or an issue in this repository.
