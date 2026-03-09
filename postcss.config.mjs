const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 2,
      features: {
        "nesting-rules": false, // Tailwind handles nesting already
        "logical-properties-and-values": false,
      },
      autoprefixer: { flexbox: "no-2009" },
    },
    autoprefixer: {},
  },
};

export default config;
