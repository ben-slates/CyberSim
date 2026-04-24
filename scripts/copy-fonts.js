const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targets = [
  {
    sourceDir: path.join(root, "node_modules", "@fontsource", "share-tech-mono", "files"),
    pattern: /share-tech-mono-latin-400-normal\.woff2$/,
    targetName: "ShareTechMono-Regular.woff2"
  },
  {
    sourceDir: path.join(root, "node_modules", "@fontsource", "jetbrains-mono", "files"),
    pattern: /jetbrains-mono-latin-400-normal\.woff2$/,
    targetName: "JetBrainsMono-Regular.woff2"
  },
  {
    sourceDir: path.join(root, "node_modules", "@fontsource", "jetbrains-mono", "files"),
    pattern: /jetbrains-mono-latin-700-normal\.woff2$/,
    targetName: "JetBrainsMono-Bold.woff2"
  }
];

const outDir = path.join(root, "src", "assets", "fonts");
fs.mkdirSync(outDir, { recursive: true });

targets.forEach(({ sourceDir, pattern, targetName }) => {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const match = fs.readdirSync(sourceDir).find((entry) => pattern.test(entry));
  if (!match) {
    return;
  }

  fs.copyFileSync(path.join(sourceDir, match), path.join(outDir, targetName));
});
