import { SemanticRenderer } from './semantic-renderer';
import { NavbarMegaMenu } from '../examples/NavbarMegaMenu';
import { HeroSplit } from '../examples/HeroSplit';

async function generateSemanticHtml() {
  const renderer = new SemanticRenderer();
  await renderer.initialize();
  
  // Рендерим компоненты с семантическими классами
  await renderer.renderComponent(NavbarMegaMenu, {}, 'semantic-navbar.html');
  await renderer.renderComponent(HeroSplit, {}, 'semantic-hero.html');
  
  console.log('✨ Semantic HTML pages generated successfully!');
}

generateSemanticHtml(); 