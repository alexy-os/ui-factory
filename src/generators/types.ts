export interface PageConfig {
  path: string;           // Путь к выходному HTML файлу
  component: React.ComponentType;  // React компонент для рендеринга
  props?: Record<string, unknown>; // Пропсы для компонента
  styles?: string[];     // Дополнительные стили для страницы
}

export interface BuilderConfig {
  outDir: string;        // Директория для выходных файлов
  templates: PageConfig[]; // Конфигурация страниц
  defaultStyles?: string[]; // Базовые стили для всех страниц
} 