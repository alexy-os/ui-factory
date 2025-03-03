import React, { useRef, useEffect, useState } from 'react';

// Интерфейс для записи в classObject
interface ClassEntry {
  quark: string;
  semantic: string;
  classes: string;
  components: Record<string, {
    path: string;
    name: string;
  }>;
}

// Хранилище для classObject
let classObjectCache: Record<string, ClassEntry> | null = null;

// Функция для загрузки classObject
const loadClassObject = async (): Promise<Record<string, ClassEntry>> => {
  if (classObjectCache) return classObjectCache;
  
  try {
    // В браузере используем fetch
    const response = await fetch('/components/domAnalysis.json');
    const data = await response.json();
    
    // Преобразуем массив в объект
    const classObj: Record<string, ClassEntry> = {};
    data.forEach((entry: any) => {
      classObj[entry.semantic] = {
        quark: entry.quark,
        semantic: entry.semantic,
        classes: entry.classes,
        components: entry.components
      };
    });
    
    classObjectCache = classObj;
    return classObj;
  } catch (error) {
    console.error('Error loading class data:', error);
    return {};
  }
};

// Нормализация строки классов
const normalizeClassString = (classString: string): string => {
  return classString.split(' ').sort().join(' ');
};

// HOC для обертывания Shadcn компонентов
export function withSemanticClasses<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    componentName?: string;
    useQuark?: boolean;
  }
): React.FC<P> {
  const displayName = options?.componentName || Component.displayName || Component.name;
  
  const WrappedComponent: React.FC<P> = (props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [classObject, setClassObject] = useState<Record<string, ClassEntry>>({});
    
    // Загружаем classObject при монтировании
    useEffect(() => {
      loadClassObject().then(setClassObject);
    }, []);
    
    useEffect(() => {
      if (!containerRef.current || Object.keys(classObject).length === 0) return;
      
      // После рендеринга находим все элементы с классами
      const elementsWithClasses = containerRef.current.querySelectorAll('[class]');
      
      elementsWithClasses.forEach(element => {
        const originalClasses = element.className.split(' ');
        
        // Для каждого класса ищем семантическую или кварк замену
        const newClasses = originalClasses.map(cls => {
          // Ищем в classObject
          for (const [key, entry] of Object.entries(classObject)) {
            const normalizedOriginal = originalClasses.join(' ');
            const normalizedStored = entry.classes.split(' ').sort().join(' ');
            
            if (normalizedOriginal === normalizedStored) {
              return options?.useQuark ? entry.quark : entry.semantic;
            }
          }
          
          return cls; // Если замена не найдена
        });
        
        // Применяем новые классы
        element.className = newClasses.join(' ');
      });
    }, [props, classObject]);
    
    return (
      <div ref={containerRef} data-semantic-component={displayName}>
        <Component {...props} />
      </div>
    );
  };
  
  WrappedComponent.displayName = `WithSemanticClasses(${displayName})`;
  
  return WrappedComponent;
};
