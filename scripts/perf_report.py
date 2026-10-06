import json
import re
from collections import defaultdict
from pathlib import Path


def summarize_lh(path: str, label: str) -> None:
    r = json.loads(Path(path).read_text(encoding="utf-8"))
    print(f"=== {label} ===")
    for _k, v in r["categories"].items():
        sc = v.get("score")
        print(f"  {v['title']}: {round((sc or 0) * 100)}")
    aud = r["audits"]
    keys = [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
        "speed-index",
        "interactive",
        "bootup-time",
        "unused-javascript",
        "total-byte-weight",
        "mainthread-work-breakdown",
        "render-blocking-resources",
        "dom-size",
    ]
    print("  Key metrics:")
    for k in keys:
        a = aud.get(k)
        if not a:
            continue
        sc = a.get("score")
        score_s = "" if sc is None else f" (score {round(sc * 100)})"
        dv = a.get("displayValue") or ""
        print(f"    {a['title']}: {dv}{score_s}")
    opps = []
    for a in aud.values():
        if a.get("details", {}).get("type") == "opportunity" and a.get("numericValue"):
            opps.append((a["numericValue"], a["title"], a.get("displayValue", "")))
    opps.sort(reverse=True)
    if opps:
        print("  Top opportunities:")
        for _ms, title, dv in opps[:6]:
            print(f"    {title}: {dv}")
    print()


def summarize_bundle() -> None:
    data = json.loads(Path("dist/stats.json").read_text(encoding="utf-8"))
    parts = data["nodeParts"]
    acc: dict[str, int] = defaultdict(int)

    def walk(node: dict) -> None:
        children = node.get("children") or []
        uid = node.get("uid")
        name = str(node.get("name", "")).replace("\\", "/")
        if children:
            for c in children:
                walk(c)
            return
        m = re.search(r"node_modules/((?:@[^/]+/)?[^/]+)", name)
        if m:
            pkg = m.group(1)
        elif "/src/" in name or name.startswith("src/"):
            pkg = "(app src)"
        else:
            # rollup often uses short filenames under a package folder node
            pkg = name.rsplit("/", 1)[-1] if name else "(other)"
            if pkg.endswith((".js", ".mjs", ".ts", ".tsx")):
                # try parent package from meta path via uid
                pkg = f"(module) {pkg[:40]}"
        size = parts.get(uid, {}).get("renderedLength", 0) if uid is not None else 0
        acc[pkg] += size

    walk(data["tree"])

    # Group three.* and recharts-ish
    grouped: dict[str, int] = defaultdict(int)
    for pkg, sz in acc.items():
        low = pkg.lower()
        if "three" in low:
            grouped["three"] += sz
        elif "react-dom" in low:
            grouped["react-dom"] += sz
        elif pkg == "react" or low.startswith("(module) react"):
            grouped["react"] += sz
        elif any(
            x in low
            for x in (
                "recharts",
                "victory",
                "d3-",
                "decimal",
                "redux",
                "immer",
                "event",
                "axis",
                "cartesian",
                "line.js",
                "recharts",
            )
        ):
            grouped["recharts (+ deps)"] += sz
        elif "@react-three" in low or "fiber" in low or "drei" in low or "orbitcontrols" in low:
            grouped["@react-three/*"] += sz
        elif "zustand" in low:
            grouped["zustand"] += sz
        elif pkg == "(app src)":
            grouped["(app src)"] += sz
        else:
            grouped[pkg] += sz

    total = sum(grouped.values()) or 1
    print("=== Bundle (production) ===")
    print("  Artifact: index.js 1,582 KB raw / 436 KB gzip")
    print("  Artifact: index.css 39 KB raw / 7.6 KB gzip")
    print("  Top weight (visualizer rendered lengths, approx):")
    for pkg, sz in sorted(grouped.items(), key=lambda x: -x[1])[:15]:
        print(f"    {sz / 1024:7.1f} KB  {100 * sz / total:5.1f}%  {pkg}")
    print()


if __name__ == "__main__":
    summarize_bundle()
    summarize_lh("lighthouse-desktop.json", "Lighthouse Desktop")
    summarize_lh("lighthouse-mobile.json", "Lighthouse Mobile")
