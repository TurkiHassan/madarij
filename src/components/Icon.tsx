import React from 'react'

export type IconName =
  | 'home'
  | 'users'
  | 'activity'
  | 'probe'
  | 'note'
  | 'book'
  | 'arrow'
  | 'check'
  | 'x'
  | 'search'
  | 'menu'
  | 'print'
  | 'plus'
  | 'copy'
  | 'download'
  | 'trash'
  | 'reset'
  | 'skills'

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16 5.4a3.4 3.4 0 0 1 0 6.5M17.5 14.9c2 .7 3.5 2.4 3.5 5.1" />
    </>
  ),
  activity: (
    <>
      <path d="M3 12h4l2.2-6 3.6 12L15 12h6" />
    </>
  ),
  probe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  note: (
    <>
      <path d="M5 3.5h11l3 3V20.5H5z" />
      <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 4.8 7.2 4.4 4 5v14c3.2-.6 6-.2 8 1.4 2-1.6 4.8-2 8-1.4V5c-3.2-.6-6-.2-8 1.5Z" />
      <path d="M12 6.5v13.9" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15M14 6.5 19.5 12 14 17.5" />
    </>
  ),
  check: <path d="m4 12.5 5 5L20 6.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  print: (
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="3.5" y="9" width="17" height="8" rx="1" />
      <path d="M7 14h10v6.5H7z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" />
    </>
  ),
  skills: (
    <>
      <rect x="4" y="5" width="7.5" height="9" />
      <rect x="9.5" y="8.5" width="7.5" height="9" />
      <path d="M12.5 8.5V17.5M9.5 17.5h7.5" opacity="0.55" />
    </>
  ),
  reset: (
    <>
      <path d="M4 10a8 8 0 1 1 2.3 7" />
      <path d="M4 4v6h6" />
    </>
  ),
}

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
