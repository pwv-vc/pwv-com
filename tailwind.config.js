/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"EB Garamond"', ...defaultTheme.fontFamily.serif],
        sans: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
        mono: ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
      },
      lineHeight: {
        tight: "1.1",
        snug: "1.35",
        normal: "1.5",
        relaxed: "1.75",
        loose: "2",
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      spacing: {
        "logo-small": "200px",
        "logo-medium": "240px",
        "logo-large": "300px",
        "logo-margin": "2rem",
        section: "4rem",
        "section-sm": "2rem",
      },
      maxWidth: {
        container: "68rem", // 1088px, similar to SFCD's content width
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // Include the typography plugin
    function ({ addBase, theme }) {
      // Set default typography styles
      addBase({
        "main, footer": {
          maxWidth: theme("maxWidth.container"),
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: theme("spacing.4"),
          paddingRight: theme("spacing.4"),
        },
        h1: {
          fontFamily: theme("fontFamily.serif"),
          fontSize: theme("fontSize.4xl"),
          fontWeight: theme("fontWeight.bold"),
          lineHeight: theme("lineHeight.tight"),
          letterSpacing: theme("letterSpacing.tighter"),
          marginTop: theme("spacing.8"),
          marginBottom: theme("spacing.6"),
          "@screen md": {
            fontSize: theme("fontSize.6xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.7xl"),
          },
        },
        h2: {
          fontFamily: theme("fontFamily.serif"),
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.bold"),
          lineHeight: theme("lineHeight.tight"),
          letterSpacing: theme("letterSpacing.tight"),
          marginTop: theme("spacing.8"),
          marginBottom: theme("spacing.6"),
          "@screen md": {
            fontSize: theme("fontSize.3xl"),
          },
        },
        h3: {
          fontFamily: theme("fontFamily.serif"),
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.semibold"),
          lineHeight: theme("lineHeight.snug"),
          marginTop: theme("spacing.6"),
          marginBottom: theme("spacing.6"), // Increased from spacing.3
          "@screen md": {
            fontSize: theme("fontSize.2xl"),
          },
        },
        p: {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.xl"),
          lineHeight: theme("lineHeight.relaxed"),
          marginTop: theme("spacing.4"),
          marginBottom: theme("spacing.4"),
          maxWidth: theme("maxWidth.container"),
        },
        "ul, ol": {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.xl"),
          lineHeight: theme("lineHeight.relaxed"),
          marginTop: theme("spacing.4"),
          marginBottom: theme("spacing.4"),
          maxWidth: theme("maxWidth.container"),
        },
        li: {
          marginBottom: theme("spacing.2"),
        },
        blockquote: {
          fontFamily: theme("fontFamily.serif"),
          fontSize: theme("fontSize.lg"),
          lineHeight: theme("lineHeight.normal"),
          letterSpacing: theme("letterSpacing.normal"),
          borderLeftColor: theme("colors.gray.400"),
          borderLeftWidth: theme("borderWidth.4"),
          paddingLeft: theme("spacing.6"),
          marginTop: theme("spacing.8"),
          marginBottom: theme("spacing.8"),
          color: theme("colors.gray.700"),
          maxWidth: theme("maxWidth.container"),
          marginLeft: "auto",
          marginRight: "auto",
        },
        "blockquote p": {
          marginTop: "0",
          marginBottom: "0",
        },
        "figure blockquote": {
          marginTop: "0",
        },
        code: {
          fontFamily: theme("fontFamily.mono"),
          fontSize: theme("fontSize.sm"),
          backgroundColor: theme("colors.gray.100"),
          padding: theme("spacing.1"),
          borderRadius: theme("borderRadius.md"),
        },
        pre: {
          fontFamily: theme("fontFamily.mono"),
          fontSize: theme("fontSize.sm"),
          backgroundColor: theme("colors.gray.900"),
          color: theme("colors.gray.100"),
          padding: theme("spacing.4"),
          borderRadius: theme("borderRadius.lg"),
          overflowX: "auto",
          marginTop: theme("spacing.6"),
          marginBottom: theme("spacing.6"),
        },
        hr: {
          borderColor: theme("colors.gray.300"),
          marginTop: theme("spacing.12"),
          marginBottom: theme("spacing.12"),
        },

        "footer p": {
          fontSize: theme("fontSize.base"),
        },

        footer: {
          marginTop: theme("spacing.4"),
          "@screen sm": {
            marginTop: theme("spacing.6"),
          },
          "@screen md": {
            marginTop: theme("spacing.8"),
          },
          "@screen lg": {
            marginTop: theme("spacing.10"),
          },
        },
        // Add styles for footer div and p tags
        "footer > div": {
          marginTop: theme("spacing.1"),
          marginBottom: theme("spacing.1"),
        },
        "footer p": {
          fontSize: theme("fontSize.base"),
          marginTop: theme("spacing.1"),
          marginBottom: theme("spacing.1"),
        },
      });
    },
  ],
};
