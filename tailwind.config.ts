import type { Config } from 'tailwindcss';

/**
 * Palette is sampled from the real Wellfound candidate portal: a near-white
 * page, white cards with hairline borders, black type, and a single red accent
 * that only appears in the wordmark and notification dots.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0d0c22',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
        surface: {
          DEFAULT: '#ffffff',
          page: '#f7f7f8',
          hover: '#f3f4f6',
        },
        line: {
          DEFAULT: '#e5e7eb',
          strong: '#d1d5db',
        },
        accent: {
          // The red in the "W:" wordmark and the unread dot.
          DEFAULT: '#ec4d3d',
          soft: '#fee2e0',
        },
        brand: {
          // Selected nav item and primary links.
          DEFAULT: '#2563eb',
          soft: '#eff6ff',
        },
        success: {
          DEFAULT: '#16a34a',
          soft: '#dcfce7',
        },
        warn: {
          DEFAULT: '#d97706',
          soft: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          soft: '#fee2e2',
        },
        plum: '#6b2737',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        pop: '0 8px 24px -6px rgb(0 0 0 / 0.12)',
      },
      maxWidth: {
        content: '1080px',
      },
    },
  },
  plugins: [],
};

export default config;
