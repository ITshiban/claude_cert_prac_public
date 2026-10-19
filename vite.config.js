import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages では https://<ユーザー名>.github.io/<リポジトリ名>/ で配信される
  base: "/claude_cert_prac_public/",
});
