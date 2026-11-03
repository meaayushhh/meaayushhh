import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

// Global design system first, then component styles are imported by components.
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';

/**
 * Mounts the app into the node the WordPress shortcode emits:
 *   <div class="chessbharat-game" data-chessbharat-root></div>
 * The `.chessbharat-game` class scopes every style so the host theme is
 * never affected. If the node is missing we fail quietly rather than throwing.
 */
function mount() {
  const el = document.querySelector<HTMLElement>('[data-chessbharat-root]');
  if (!el) return;
  if (!el.classList.contains('chessbharat-game')) {
    el.classList.add('chessbharat-game');
  }
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
