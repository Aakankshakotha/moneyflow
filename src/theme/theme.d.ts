import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    charts: {
      categorical: string[]
    }
  }
  interface PaletteOptions {
    charts?: {
      categorical?: string[]
    }
  }
}
