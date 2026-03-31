/** @type {import('tailwindcss').Config} */
const baseDir = '/Users/rosmel/PC Mejiaa/Proyecto Patio Sur/frontend';

export default {
  content: [
    `${baseDir}/index.html`,
    `${baseDir}/src/**/*.{js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {
      colors: {
        // PC Mejia corporate blue (from logo "PC")
        primary: {
          50: '#eef4fb',
          100: '#d4e3f5',
          200: '#a9c8eb',
          300: '#7eade1',
          400: '#4d8fd4',
          500: '#2670be',
          600: '#1b5eab',  // Main brand color
          700: '#164d8e',
          800: '#113d71',
          900: '#0c2d54',
          950: '#081e38',
        },
        // PC Mejia corporate gray (from logo "Mejia/Ingenieria")
        steel: {
          50: '#f6f7f8',
          100: '#ecedef',
          200: '#d5d7db',
          300: '#b5b8be',
          400: '#8b8e96',  // Main gray from logo
          500: '#6e7179',
          600: '#585b62',
          700: '#474951',
          800: '#363840',
          900: '#282a30',
          950: '#1a1c21',
        },
        accent: {
          50: '#fef9ec',
          100: '#fcefc6',
          500: '#d4a017',
          600: '#b8890f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc2626',
          600: '#b91c1c',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(27, 94, 171, 0.08), 0 1px 2px -1px rgba(27, 94, 171, 0.08)',
        'card-hover': '0 4px 12px 0 rgba(27, 94, 171, 0.12), 0 2px 4px -2px rgba(27, 94, 171, 0.08)',
      },
    },
  },
  plugins: [],
};
