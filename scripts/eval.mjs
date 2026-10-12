/**
 * Runs the plugin's eval suite, and with --compare also runs it against the PlanVortex connector
 * alone (the same plugin with no skills), then prints both side by side.
 *
 * Why the suite does not live inside planvortex/: everything in the plugin folder ships to the
 * people who install it and goes through the directory's security scan, and the mocks here contain
 * a prompt injection on purpose (inbox-triage). So the suite stays at the repository root and this
 * script assembles a temporary copy of the plugin with evals/ inside, which is where
 * `claude plugin eval` looks for it.
 *
 * Why --compare and not the tool's own baseline: `claude plugin eval` compares against NO plugin
 * at all, and without the connector there are no PlanVortex tools, so every case would favour the
 * plugin for the wrong reason. The question that decides whether a skill stays is narrower: does
 * it do better than the connector on its own? A skill that does not, goes.
 *
 *     node scripts/eval.mjs                      # the suite, plugin only
 *     node scripts/eval.mjs --compare            # plugin vs connector alone
 *     node scripts/eval.mjs --compare -- --case inbox-triage --runs 1
 *
 * Every run is a real model call on the account Claude Code is signed in with. The MCP server is
 * never contacted: every tool answers from evals/mocks/.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = join(root, "planvortex");
const EVALS = join(root, "evals");

const argv = process.argv.slice(2);
const separator = argv.indexOf("--");
const own = separator === -1 ? argv : argv.slice(0, separator);
const passthrough = separator === -1 ? [] : argv.slice(separator + 1);
const compare = own.includes("--compare");
const unknown = own.filter((flag) => flag !== "--compare");
if (unknown.length > 0) {
    console.error(`Unknown option ${unknown.join(" ")}. Pass options for claude plugin eval after --.`);
    process.exit(1);
}

/** Claude Code on the PATH, or the one bundled with the VS Code extension. */
function findClaude() {
    if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
    const home = process.env.USERPROFILE ?? process.env.HOME ?? "";
    const extensions = join(home, ".vscode", "extensions");
    if (existsSync(extensions)) {
        const found = readdirSync(extensions)
            .filter((name) => name.startsWith("anthropic.claude-code-"))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .reverse();
        for (const name of found) {
            for (const exe of ["claude.exe", "claude"]) {
                const candidate = join(extensions, name, "resources", "native-binary", exe);
                if (existsSync(candidate)) return candidate;
            }
        }
    }
    return "claude";
}

/** A copy of the plugin with the suite inside it, optionally without its skills. */
function assemble(withSkills) {
    const dir = mkdtempSync(join(tmpdir(), withSkills ? "planvortex-eval-" : "planvortex-eval-connector-"));
    cpSync(PLUGIN, dir, {
        recursive: true,
        filter: (source) => withSkills || !source.startsWith(join(PLUGIN, "skills")),
    });
    cpSync(EVALS, join(dir, "evals"), {
        recursive: true,
        filter: (source) => !source.startsWith(join(EVALS, "results")),
    });
    return dir;
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const defaults = ["--runs", "3", "--model", "sonnet", "--judge-model", "sonnet", "-j", "3", "--max-cost-usd", "15"];
const given = new Set(passthrough.filter((arg) => arg.startsWith("-")));
const options = [];
for (let i = 0; i < defaults.length; i += 2) {
    if (!given.has(defaults[i])) options.push(defaults[i], defaults[i + 1]);
}

function run(label, withSkills) {
    const dir = assemble(withSkills);
    const output = join(EVALS, "results", `${stamp}-${label}`);
    console.log(`\n=== ${label}\n`);
    try {
        spawnSync(
            findClaude(),
            ["plugin", "eval", dir, "--ablation", "none", "--trust-plugin", "--no-publish", "--output-dir", output, ...options, ...passthrough],
            { stdio: "inherit" },
        );
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
    const file = join(output, "aggregate-result.json");
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;
}

/** Share of runs in which each grader passed, per case. */
function passRates(result) {
    const rates = new Map();
    for (const item of result?.cases ?? []) {
        const runs = item.arms?.with ?? [];
        const graders = new Map();
        for (const one of runs) {
            for (const grader of one.graders ?? []) {
                const seen = graders.get(grader.name) ?? { passed: 0, total: 0 };
                seen.total += 1;
                if (grader.passed) seen.passed += 1;
                graders.set(grader.name, seen);
            }
        }
        rates.set(item.name, graders);
    }
    return rates;
}

const plugin = run("plugin", true);
if (!compare) process.exit(plugin ? 0 : 1);
const connector = run("connector-only", false);

const a = passRates(plugin);
const b = passRates(connector);
const pct = (value) => (value ? `${Math.round((100 * value.passed) / value.total)}%`.padStart(5) : "    -");
console.log("\n=== Plugin vs connector alone (share of runs in which each grader passed)\n");
console.log(`${"case / grader".padEnd(44)} plugin  conn.`);
for (const [name, graders] of a) {
    console.log(name);
    for (const [grader, value] of graders) {
        //A skill cannot fire without skills: that row says nothing about the comparison.
        if (grader.startsWith("skill-fired")) continue;
        console.log(`  ${grader.padEnd(42)} ${pct(value)}  ${pct(b.get(name)?.get(grader))}`);
    }
}
