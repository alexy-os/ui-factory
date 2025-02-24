import { StaticBuilder } from '../generators/builder';
import { NavbarMegaMenu } from '../examples/NavbarMegaMenu';
import { HeroSplit } from '../examples/HeroSplit';

async function generate() {
  const builder = new StaticBuilder({
    templates: [
      {
        path: 'index.html',
        component: NavbarMegaMenu
      },
      {
        path: 'hero-split.html',
        component: HeroSplit
      }
    ]
  });

  try {
    await builder.build();
    console.log('✨ Static files generated successfully!');
  } catch (error) {
    console.error('Error generating static files:', error);
    process.exit(1);
  }
}

generate(); 