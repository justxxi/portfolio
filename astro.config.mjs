import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  compressHTML: true,
  experimental: { rustCompiler: true },
  security: {
    csp: {
      styleDirective: {
        resources: ["'self'", 'https://fonts.googleapis.com']
      },
      directives: [
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data:"
      ]
    }
  }
})
