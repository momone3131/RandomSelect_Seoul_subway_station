import { FOOD_CATEGORIES } from '../data/food-categories';
import { SUBWAY_LINES } from '../data/subway-lines';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

export type SettingsMode = 'line' | 'food';

export class SettingsModalView {
  private mode?: SettingsMode;
  private draftIds: string[] = [];
  private previousFocus: Element | null = null;
  private lockedScrollY = 0;
  private onDraftChange?: (draftIds: readonly string[]) => void;

  get isOpen(): boolean {
    return this.mode !== undefined;
  }

  get currentMode(): SettingsMode | undefined {
    return this.mode;
  }

  getDraftIds(): string[] {
    return [...this.draftIds];
  }

  open(mode: SettingsMode, selectedIds: readonly string[], onDraftChange?: (draftIds: readonly string[]) => void): void {
    this.mode = mode;
    this.draftIds = [...selectedIds];
    this.onDraftChange = onDraftChange;
    const isFood = mode === 'food';

    byId<HTMLElement>('settings_title').textContent = isFood ? '무슨 음식을 뽑을까요?' : '어떤 노선을 뽑을까요?';
    byId<HTMLElement>('settings_desc').textContent = isFood
      ? '서로 다른 식사 종류를 36종으로 나눴어요. 각 종목은 같은 확률이에요.'
      : '선택한 노선 안에서만 뽑아요. 각 노선의 확률은 같아요.';
    byId<HTMLElement>('settings_apply_note').textContent = isFood
      ? '적용하면 음식만 초기화돼요. 뽑은 노선·역과 기록은 유지됩니다.'
      : '적용하면 노선·역·음식이 초기화돼요. 기록은 유지됩니다.';
    byId<HTMLButtonElement>('apply_settings').textContent = isFood ? '선택한 음식 적용' : '선택한 노선 적용';
    byId<HTMLButtonElement>('preset_metro').hidden = isFood;

    this.renderChoices();
    this.previousFocus = document.activeElement;
    this.lockedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    byId<HTMLElement>('settings_overlay').hidden = false;
    byId<HTMLElement>('choices_scroll').scrollTop = 0;
    byId<HTMLButtonElement>('close_settings').focus();
    document.querySelector<HTMLElement>('.page')?.setAttribute('aria-hidden', 'true');
  }

  close(): void {
    if (!this.mode) return;
    byId<HTMLElement>('settings_overlay').hidden = true;
    document.querySelector<HTMLElement>('.page')?.removeAttribute('aria-hidden');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    this.mode = undefined;
    window.scrollTo(0, this.lockedScrollY);

    if (this.previousFocus instanceof HTMLElement && document.documentElement.contains(this.previousFocus)) {
      try { this.previousFocus.focus({ preventScroll: true }); }
      catch { this.previousFocus.focus(); }
      window.scrollTo(0, this.lockedScrollY);
    }
  }

  selectAll(): void {
    this.draftIds = (this.mode === 'food' ? FOOD_CATEGORIES : SUBWAY_LINES).map((item) => item.id);
    this.renderChoices();
  }

  selectNone(): void {
    this.draftIds = [];
    this.renderChoices();
  }

  selectMetroOnly(): void {
    if (this.mode !== 'line') return;
    this.draftIds = SUBWAY_LINES.slice(0, 9).map((line) => line.id);
    this.renderChoices();
  }

  private renderCount(): void {
    byId<HTMLElement>('draft_count').textContent = `${this.draftIds.length}개 선택`;
    byId<HTMLButtonElement>('apply_settings').disabled = this.draftIds.length === 0;
    this.onDraftChange?.(this.draftIds);
  }

  private renderChoices(): void {
    const isFood = this.mode === 'food';
    const items = isFood ? FOOD_CATEGORIES : SUBWAY_LINES;
    const fragment = document.createDocumentFragment();
    let lastGroup: string | null = null;

    for (const item of items) {
      const group = 'group' in item ? item.group : null;
      if (isFood && group && lastGroup !== group) {
        fragment.appendChild(make('h3', 'choice-group-heading', group));
        lastGroup = group;
      }

      const selected = this.draftIds.includes(item.id);
      const baseClass = `line-choice${isFood ? ' food-choice' : ''}`;
      const label = make('label', `${baseClass}${selected ? ' selected' : ''}`);
      const input = make('input');
      input.type = 'checkbox';
      input.value = item.id;
      input.checked = selected;
      input.setAttribute('aria-label', `${item.name} 선택`);
      input.addEventListener('change', () => {
        if (input.checked && !this.draftIds.includes(item.id)) this.draftIds.push(item.id);
        if (!input.checked) this.draftIds = this.draftIds.filter((id) => id !== item.id);
        label.className = `${baseClass}${input.checked ? ' selected' : ''}`;
        this.renderCount();
      });

      const text = make('div', 'choice-text');
      append(
        text,
        make('div', 'choice-name', item.name),
        make('div', 'choice-count', isFood && 'examples' in item ? item.examples : `${'stations' in item ? item.stations.length : 0}개 역`),
      );

      let marker: HTMLElement;
      if (isFood && 'emoji' in item) {
        marker = make('span', 'choice-emoji', item.emoji);
      } else if ('badge' in item) {
        marker = make('span', `mini-badge${item.badge.length > 1 ? ' wide' : ''}`, item.badge);
        marker.style.setProperty('--line', item.color);
        marker.style.setProperty('--line-ink', readableInk(item.color));
      } else {
        marker = make('span');
      }
      marker.setAttribute('aria-hidden', 'true');
      append(label, input, marker, text);
      fragment.appendChild(label);
    }

    replaceContent(byId<HTMLElement>('line_choices'), fragment);
    this.renderCount();
  }
}
