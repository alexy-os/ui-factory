import { exec } from 'child_process';
import * as path from 'path';
import * as util from 'util';

const execAsync = util.promisify(exec);

export async function compileCss(): Promise<void> {
  const inputPath = path.join(process.cwd(), 'src/semantic/index.css');
  const outputPath = path.join(process.cwd(), 'public/style-semantic.css');

  try {
    await execAsync(
      `npx tailwindcss -i ${inputPath} -o ${outputPath} --minify`
    );
    console.log('✨ Semantic CSS compiled successfully!');
  } catch (error) {
    console.error('Failed to compile CSS:', error);
    throw error;
  }
} 