import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';

interface ComponentClass {
  name: string;
  classes: Record<string, string>;
}

interface SemanticMap {
  components: ComponentClass[];
}

async function generateSemanticMap() {
  // Находим все файлы с компонентами
  const componentFiles = glob.sync('src/components/ui/**/*.tsx');
  const semanticMap: SemanticMap = { components: [] };
  
  for (const file of componentFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const componentName = path.basename(file, '.tsx').toLowerCase();
    
    // Ищем объявления вариантов
    const variantsMatch = content.match(/const\s+(\w+)Variants\s*=\s*cva\(([^)]+)\)/s);
    if (variantsMatch) {
      const baseClasses = extractBaseClasses(variantsMatch[2]);
      const variantClasses = extractVariantClasses(content);
      
      const componentClasses: Record<string, string> = {
        [componentName]: baseClasses
      };
      
      // Добавляем варианты
      Object.entries(variantClasses).forEach(([variant, classes]) => {
        componentClasses[`${componentName}-${variant}`] = classes;
      });
      
      semanticMap.components.push({
        name: componentName,
        classes: componentClasses
      });
    }
  }
  
  // Записываем карту в файл
  await fs.writeFile(
    'src/semantic/semantic-map.json',
    JSON.stringify(semanticMap, null, 2),
    'utf-8'
  );
  
  console.log('✨ Semantic map generated successfully!');
}

// Вспомогательные функции для извлечения классов
function extractBaseClasses(cvaString: string): string {
  // Извлекаем базовые классы из cva
  const match = cvaString.match(/["'`]([^"'`]+)["'`]/);
  return match ? match[1] : '';
}

function extractVariantClasses(content: string): Record<string, string> {
  const variants: Record<string, string> = {};
  
  // Ищем объявления вариантов
  const variantsMatch = content.match(/variants\s*:\s*{([^}]+)}/s);
  if (variantsMatch) {
    const variantsBlock = variantsMatch[1];
    
    // Извлекаем каждый вариант
    const variantMatches = variantsBlock.matchAll(/(\w+)\s*:\s*{([^}]+)}/gs);
    for (const match of variantMatches) {
      const variantType = match[1];
      const variantOptions = match[2];
      
      // Извлекаем опции для каждого типа варианта
      const optionMatches = variantOptions.matchAll(/(\w+)\s*:\s*["'`]([^"'`]+)["'`]/gs);
      for (const optionMatch of optionMatches) {
        const optionName = optionMatch[1];
        const optionClasses = optionMatch[2];
        
        variants[`${optionName}`] = optionClasses;
      }
    }
  }
  
  return variants;
}

generateSemanticMap(); 