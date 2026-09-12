import '../ui/styles.css';
import '../ui/mobile-overrides.css';

const grid = document.getElementById('responsive_restaurant_grid');
const button = document.querySelector<HTMLElement>('.restaurant-map-link');
if (!grid || !button) throw new Error('Responsive smoke fixture is incomplete.');

const gridStyle = getComputedStyle(grid);
const columns = gridStyle.gridTemplateColumns
  .split(/\s+/)
  .map((value) => value.trim())
  .filter(Boolean);
const buttonStyle = getComputedStyle(button);
const buttonHeight = Number.parseFloat(buttonStyle.height);
const buttonWidth = Number.parseFloat(buttonStyle.width);
const cardWidth = Number.parseFloat(getComputedStyle(document.querySelector<HTMLElement>('.restaurant-card')!).width);

const mobileViewport = window.innerWidth <= 720;
document.body.dataset.responsiveViewport = String(window.innerWidth);
document.body.dataset.responsiveColumns = String(columns.length);
document.body.dataset.responsiveButtonHeight = String(Math.round(buttonHeight));
document.body.dataset.responsiveButtonFullWidth = String(Math.abs(buttonWidth - cardWidth) < 30);
document.body.dataset.responsive = mobileViewport && columns.length === 1 && buttonHeight >= 42
  ? 'passed'
  : 'failed';
