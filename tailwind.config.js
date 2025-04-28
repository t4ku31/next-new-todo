/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
      './src/styles/**/*.{css,scss}',
    ],
    theme: {
      extend: {
        colors: {
          primary:      '#1E2A78',
          primaryLight: '#37459F',
          accent:       '#3B82F6',
          muted:        '#6B7280',
          bg:           '#F8FAFC',
        },
      },
    },
    plugins: [
      // require('@tailwindcss/forms'),
    ],
  };

  