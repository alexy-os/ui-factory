export type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'solid';

export type VariantType = 'tv' | 'cva' | 'vue' | 'custom';

export interface VariantPattern {
  type: VariantType;
  basePattern: RegExp;
  extractors: {
    base?: RegExp;
    variants?: RegExp;
    defaultVariants?: RegExp;
  };
  validators: {
    base?: RegExp[];
    variant?: RegExp[];
  };
}

export const variantPatterns: Record<Framework, VariantPattern> = {
  react: {
    type: 'tv',
    basePattern: /(?:tv|cva)\(\s*\{([^}]+)\}\s*\)/g,
    extractors: {
      base: /base:\s*["'`]([^"'`]+)["'`]/,
      variants: /variants:\s*{([^}]+)}/,
      defaultVariants: /defaultVariants:\s*{([^}]+)}/
    },
    validators: {
      base: [
        /^\s*{/,
        /}\s*$/,
        /:\s*{/,
        /variants:/,
        /base:/
      ]
    }
  },
  vue: {
    type: 'vue',
    basePattern: /defineProps\(\s*\{([^}]+)\}\s*\)/g,
    extractors: {
      base: /class:\s*{([^}]+)}/,
      variants: /variants:\s*{([^}]+)}/
    },
    validators: {
      base: [
        /^\s*{/,
        /}\s*$/
      ]
    }
  },
  svelte: {
    type: 'custom',
    basePattern: /class:([^=]+)=["']([^"']+)["']/g,
    extractors: {
      base: /class:\s*["']([^"']+)["']/,
      variants: /class:([^=]+)=["']([^"']+)["']/g
    },
    validators: {
      base: [/^\s*{/, /}\s*$/]
    }
  },
  angular: {
    type: 'custom',
    basePattern: /\[class\]="([^"]+)"/g,
    extractors: {
      base: /class="([^"]+)"/,
      variants: /\[class\]="([^"]+)"/g
    },
    validators: {
      base: [/^\s*{/, /}\s*$/]
    }
  },
  solid: {
    type: 'custom',
    basePattern: /class=\{([^}]+)\}/g,
    extractors: {
      base: /class="([^"]+)"/,
      variants: /class=\{([^}]+)\}/g
    },
    validators: {
      base: [/^\s*{/, /}\s*$/]
    }
  }
  // Другие фреймворки...
}; 