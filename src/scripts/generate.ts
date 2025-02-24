import { StaticBuilder } from '../generators/builder';
import { NavbarMegaMenu } from '../examples/NavbarMegaMenu';

async function generate() {
  const builder = new StaticBuilder({
    templates: [
      {
        path: 'index.html',
        component: NavbarMegaMenu
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