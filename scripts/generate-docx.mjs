import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const readmePath = path.join(projectRoot, 'README.md');
const outputDir = path.join(projectRoot, 'docs');
const outputPath = path.join(outputDir, 'TravelPack-Documentation.docx');

function parseMarkdownToDocxBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const paragraphs = [];

  for (const line of lines) {
    if (!line.trim()) {
      paragraphs.push(new Paragraph(''));
      continue;
    }

    // Headings: ##, ###
    if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: line.replace(/^##\s+/, ''), heading: HeadingLevel.HEADING_1 }));
      continue;
    }
    if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: line.replace(/^###\s+/, ''), heading: HeadingLevel.HEADING_2 }));
      continue;
    }

    // Bullet lists: - or *
    if (/^[-*]\s+/.test(line)) {
      paragraphs.push(new Paragraph({ text: line.replace(/^[-*]\s+/, '• ')}));
      continue;
    }

    // Inline bold **text**
    const boldPattern = /\*\*(.*?)\*\*/g;
    if (boldPattern.test(line)) {
      const parts = line.split(boldPattern);
      const runs = [];
      for (let i = 0; i < parts.length; i++) {
        const text = parts[i];
        if (!text) continue;
        if (i % 2 === 1) runs.push(new TextRun({ text, bold: true }));
        else runs.push(new TextRun({ text }));
      }
      paragraphs.push(new Paragraph({ children: runs }));
      continue;
    }

    paragraphs.push(new Paragraph(line));
  }

  return paragraphs;
}

async function main() {
  if (!fs.existsSync(readmePath)) {
    console.error('README.md not found');
    process.exit(1);
  }
  const md = fs.readFileSync(readmePath, 'utf8');
  const children = parseMarkdownToDocxBlocks(md);

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

