import * as fs from 'fs/promises';
import * as path from 'path';

interface SemanticComponent {
  name: string;
  classes: Record<string, string>;
}

interface SemanticMap {
  components: SemanticComponent[];
}

export class HTMLGenerator {
  private async readSemanticMap(): Promise<SemanticMap> {
    const mapPath = path.join(process.cwd(), 'src/semantic/semantic-map.json');
    return JSON.parse(await fs.readFile(mapPath, 'utf-8'));
  }

  private generateComponentExample(component: SemanticComponent): string {
    const { name, classes } = component;
    let html = `\n<!-- ${name.toUpperCase()} EXAMPLES -->\n`;

    // Базовый компонент
    if (name === 'button') {
      html += `
<div class="example-section">
  <h3>Basic Buttons</h3>
  <div class="example-row">
    <button class="button button-md rounded">Default Button</button>
    <button class="button button-primary button-md rounded">Primary</button>
    <button class="button button-destructive button-md rounded">Destructive</button>
    <button class="button button-outline button-md rounded">Outline</button>
    <button class="button button-ghost button-md rounded">Ghost</button>
    <button class="button button-link button-md">Link</button>
  </div>

  <h3>Button Sizes</h3>
  <div class="example-row">
    <button class="button button-sm rounded">Small</button>
    <button class="button button-md rounded">Medium</button>
    <button class="button button-lg rounded">Large</button>
  </div>
</div>`;
    }

    else if (name === 'badge') {
      html += `
<div class="example-section">
  <h3>Badges</h3>
  <div class="example-row">
    <span class="badge button-sm rounded-lg">Default</span>
    <span class="badge badge-secondary button-sm rounded-lg">Secondary</span>
    <span class="badge badge-destructive button-sm rounded-lg">Destructive</span>
    <span class="badge badge-outline button-sm rounded-lg">Outline</span>
  </div>
</div>`;
    }

    return html;
  }

  private generateCSS(): string {
    return `
/* Example Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.example-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
}

.example-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.example-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}`;
  }

  async generateExamplePage(): Promise<void> {
    const semanticMap = await this.readSemanticMap();
    
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic UI Components</title>
    <link href="/public/style-semantic.css" rel="stylesheet">
    <style>${this.generateCSS()}</style>
</head>
<body>
    <div class="container">
        <h1>Semantic UI Components</h1>`;

    // Генерируем примеры для каждого компонента
    semanticMap.components.forEach(component => {
      html += this.generateComponentExample(component);
    });

    html += `
    </div>
</body>
</html>`;

    // Сохраняем HTML
    const outputPath = path.join(process.cwd(), 'public/semantic.html');
    await fs.writeFile(outputPath, html);

    console.log('✨ Semantic HTML example page generated successfully!');
  }
} 