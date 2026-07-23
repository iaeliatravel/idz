import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { SiteConfigProvider } from './Hooks/useSiteConfig';

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
    return pages[`./Pages/${name}.jsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <SiteConfigProvider>
        <App {...props} />
      </SiteConfigProvider>
    );
  },
  progress: {
    color: '#C9A84C',
  },
});
