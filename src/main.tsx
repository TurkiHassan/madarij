import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/amiri/400.css'
import './styles/fonts.css'
import './styles.css'
import './styles/landing-cl.css'
import './styles/app-cl.css'
import './styles/skills.css'
import './styles/atlas.css'
import '@atlas/ui/styles.css'
import '@atlas/ui/notifications/styles.css'
import {
  DirectionProvider,
  MantineProvider,
  atlasCssVariablesResolver,
  atlasTheme,
  createTheme,
} from '@atlas/ui'
import { Notifications } from '@atlas/ui/notifications'
import { App } from './App'
import { StoreProvider } from './store'

/** لوحة مدارج المرجانية — من فاتح إلى غامق (Mantine يتطلب ١٠ درجات) */
const CORAL = [
  '#fdeae4',
  '#f9d5c9',
  '#f5bfae',
  '#f0a68c',
  '#ea8b6a',
  '#ef6548',
  '#d9583c',
  '#b84932',
  '#963b28',
  '#7a2d1c',
]

/** كوبالت مدارج — لأشرطة التقدم والأزرار الثانوية */
const COBALT = [
  '#e8eefb',
  '#d3e0f6',
  '#b7ccf0',
  '#96b7e9',
  '#709ee0',
  '#4f86d4',
  '#2c6fa8',
  '#205d94',
  '#174a70',
  '#123c61',
]

const madarijTheme = createTheme({
  ...atlasTheme,
  primaryColor: 'coral',
  primaryShade: 5,
  defaultRadius: 0,
  colors: {
    ...atlasTheme.colors,
    coral: CORAL as unknown as never,
    cobalt: COBALT as unknown as never,
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DirectionProvider initialDirection="rtl">
      <MantineProvider
        theme={madarijTheme}
        cssVariablesResolver={atlasCssVariablesResolver}
        defaultColorScheme="light"
        forceColorScheme="light"
      >
        <Notifications position="bottom-center" limit={3} zIndex={200} />
        <StoreProvider>
          <App />
        </StoreProvider>
      </MantineProvider>
    </DirectionProvider>
  </React.StrictMode>,
)
