export function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

export function make<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function append(parent: Node, ...children: Node[]): void {
  for (const child of children) parent.appendChild(child);
}

export function replaceContent(parent: Node, content?: Node | null): void {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  if (content) parent.appendChild(content);
}
