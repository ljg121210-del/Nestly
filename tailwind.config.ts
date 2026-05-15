import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: {
        nestly: { ink:"#07130E", muted:"#64746D", soft:"#F4F8F5", green:"#18A058", lime:"#B9F455", mint:"#E7FBEF", rose:"#F43F5E" }
      },
      boxShadow: { premium:"0 24px 80px rgba(7,19,14,.14)", glow:"0 28px 90px rgba(24,160,88,.30)", glass:"inset 0 1px 0 rgba(255,255,255,.7), 0 24px 80px rgba(7,19,14,.12)" }
    }
  },
  plugins: []
};
export default config;
