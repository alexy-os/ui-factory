import { StyleConverter } from './converter';
import { HTMLGenerator } from './html-generator';
import { compileCss } from './compile-css';
import * as path from 'path';

async function generateSemantic() {
  // 1. Генерируем семантическую карту и исходный CSS с @apply
  const converter = new StyleConverter();
  await converter.generateSemanticMap();
  
  // 2. Компилируем CSS в чистый CSS
  await compileCss();
  
  // 3. Генерируем HTML с примерами
  const htmlGenerator = new HTMLGenerator();
  await htmlGenerator.generateExamplePage();
  
  console.log('✨ All semantic files generated successfully!');
}

generateSemantic(); 