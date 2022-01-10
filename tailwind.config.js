module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        missing: "rgb(120, 124, 126)",
        found: "rgb(201, 180, 88)",
        known: "rgb(106, 170, 100)",
        unset: "rgb(190, 194, 196)",
      },
      screens: {
        tiny: "320px",
      },
    },
  },
  plugins: [],
};
