import '../ui/styles.css';
import '../ui/mobile-overrides.css';

const grid = document.getElementById('responsive_restaurant_grid');
const button = document.querySelector<HTMLElement>('.restaurant-map-link');
const restaurantRequest = document.getElementById('responsive_restaurant_request');
const newCourse = document.getElementById('responsive_new_course');
const stationDetail = document.querySelector<HTMLElement>('.station-detail');
const visitTools = document.getElementById('responsive_visit_tools');
const heroVisit = document.querySelector<HTMLElement>('.hero-visit-btn');
if (!grid || !button || !restaurantRequest || !newCourse || !stationDetail || !visitTools || !heroVisit) {
  throw new Error('Responsive smoke fixture is incomplete.');
}

const gridStyle = getComputedStyle(grid);
const columns = gridStyle.gridTemplateColumns
  .split(/\s+/)
  .map((value) => value.trim())
  .filter(Boolean);
const buttonStyle = getComputedStyle(button);
const buttonHeight = Number.parseFloat(buttonStyle.height);
const buttonWidth = Number.parseFloat(buttonStyle.width);
const cardWidth = Number.parseFloat(getComputedStyle(document.querySelector<HTMLElement>('.restaurant-card')!).width);

const requestRect = restaurantRequest.getBoundingClientRect();
const newCourseRect = newCourse.getBoundingClientRect();
const stationDetailRect = stationDetail.getBoundingClientRect();
const visitToolsRect = visitTools.getBoundingClientRect();
const heroStyle = getComputedStyle(heroVisit);
const newCourseStyle = getComputedStyle(newCourse);
const near = (left: number, right: number, tolerance = 1.25): boolean => Math.abs(left - right) <= tolerance;
const mainActionsAligned =
  near(requestRect.left, newCourseRect.left)
  && near(requestRect.right, newCourseRect.right)
  && near(requestRect.width, newCourseRect.width)
  && near(requestRect.height, newCourseRect.height);
const utilitiesAligned =
  near(stationDetailRect.left, visitToolsRect.left)
  && near(stationDetailRect.right, visitToolsRect.right);
const heroUsesPrimaryLanguage =
  heroStyle.backgroundColor === newCourseStyle.backgroundColor
  && heroStyle.borderTopColor === newCourseStyle.borderTopColor
  && Number.parseFloat(heroStyle.borderTopWidth) >= 1;

const mobileViewport = window.innerWidth <= 720;
document.body.dataset.responsiveViewport = String(window.innerWidth);
document.body.dataset.responsiveColumns = String(columns.length);
document.body.dataset.responsiveButtonHeight = String(Math.round(buttonHeight));
document.body.dataset.responsiveButtonFullWidth = String(Math.abs(buttonWidth - cardWidth) < 30);
document.body.dataset.responsiveMainActionsAligned = String(mainActionsAligned);
document.body.dataset.responsiveUtilitiesAligned = String(utilitiesAligned);
document.body.dataset.responsiveHeroPrimary = String(heroUsesPrimaryLanguage);
document.body.dataset.responsive = mobileViewport
  && columns.length === 1
  && buttonHeight >= 42
  && mainActionsAligned
  && utilitiesAligned
  && heroUsesPrimaryLanguage
  ? 'passed'
  : 'failed';
