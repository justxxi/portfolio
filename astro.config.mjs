import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://justxxii.localplayer.dev',
  output: 'static',
  compressHTML: false,
  experimental: { rustCompiler: true },
  security: {
    csp: {
      styleDirective: {
        resources: ["'self'", 'https://fonts.googleapis.com']
      },
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com']
      },
      directives: [
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data:",
        "connect-src 'self' https://cloudflareinsights.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'"
      ]
    }
  }
})
