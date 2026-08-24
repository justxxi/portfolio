import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://justxxii.localplayer.dev',
  output: 'static',
  compressHTML: false,
  markdown: {
    syntaxHighlight: false
  },
  vite: {
    plugins: [tailwindcss()]
  },
  security: {
    csp: {
      styleDirective: {
        resources: ["'self'"]
      },
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com']
      },
      directives: [
        "font-src 'self' data:",
        "img-src 'self' data:",
        "connect-src 'self' https://cloudflareinsights.com",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'"
      ]
    }
  }
})
