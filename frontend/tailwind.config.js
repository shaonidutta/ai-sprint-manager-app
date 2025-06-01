/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Atlassian Design System Colors
      colors: {
        // Primary Colors
        primary: {
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0052CC', // Main Atlassian Blue
          600: '#0047B3',
          700: '#003C99',
          800: '#003180',
          900: '#002666',
        },
        secondary: {
          50: '#F0F8FF',
          100: '#E1F1FF',
          200: '#C3E3FF',
          300: '#A5D5FF',
          400: '#87C7FF',
          500: '#4C9AFF', // Sky Blue
          600: '#3D7BCC',
          700: '#2E5C99',
          800: '#1F3D66',
          900: '#101E33',
        },
        // Neutral Colors
        neutral: {
          50: '#FAFBFC',
          100: '#F4F5F7',
          200: '#EBECF0',
          300: '#DFE1E6',
          400: '#C1C7D0',
          500: '#6B778C',
          600: '#5E6C84',
          700: '#505F79',
          800: '#172B4D',
          900: '#091E42',
        },
        // Semantic Colors
        success: {
          50: '#E3FCEF',
          100: '#ABF5D1',
          200: '#79E2B7',
          300: '#57D9A3',
          400: '#36B37E',
          500: '#00875A',
          600: '#006644',
          700: '#004B32',
          800: '#003329',
          900: '#001B16',
        },
        warning: {
          50: '#FFFAE6',
          100: '#FFF0B3',
          200: '#FFE380',
          300: '#FFD94D',
          400: '#FFCC02',
          500: '#FFAB00',
          600: '#FF8B00',
          700: '#FF7A00',
          800: '#FF5630',
          900: '#DE350B',
        },
        error: {
          50: '#FFEBE6',
          100: '#FFBDAD',
          200: '#FF8F73',
          300: '#FF7452',
          400: '#FF5630',
          500: '#DE350B',
          600: '#BF2600',
          700: '#A01E00',
          800: '#801600',
          900: '#5D1000',
        },
        info: {
          50: '#E6FCFF',
          100: '#B3F5FF',
          200: '#79E2F2',
          300: '#00C7E6',
          400: '#00B8D9',
          500: '#0065FF',
          600: '#0052CC',
          700: '#0043A3',
          800: '#003580',
          900: '#002B5C',
        },
        discovery: {
          50: '#EAE6FF',
          100: '#C0B6F2',
          200: '#998DD9',
          300: '#8777D9',
          400: '#6554C0',
          500: '#5243AA',
          600: '#403294',
          700: '#352680',
          800: '#2A1B66',
          900: '#1F0F4D',
        },
      },
      // Atlassian Typography
      fontFamily: {
        'atlassian': [
          'Atlassian Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'sans-serif'
        ],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '40px', fontWeight: '600' }],
        'heading': ['28px', { lineHeight: '32px', fontWeight: '600' }],
        'subheading': ['20px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      // Atlassian Spacing (4px base unit)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      // Border Radius
      borderRadius: {
        'atlassian': '3px',
        'sm': '3px',
        'md': '6px',
        'lg': '8px',
      },
      // Box Shadow
      boxShadow: {
        'atlassian': '0 1px 2px rgba(9, 30, 66, 0.25)',
        'atlassian-lg': '0 4px 8px rgba(9, 30, 66, 0.25)',
        'card': '0 1px 2px rgba(9, 30, 66, 0.25)',
        'modal': '0 8px 16px rgba(9, 30, 66, 0.25)',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
