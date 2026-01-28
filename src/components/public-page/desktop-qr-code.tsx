'use client'

import { QRCodeSVG } from 'qrcode.react'
import type { PageSettings } from '@/types/database'

interface DesktopQRCodeProps {
  url: string
  settings: PageSettings
}

export function DesktopQRCode({ url, settings }: DesktopQRCodeProps) {
  return (
    <div
      className="hidden lg:block fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: `${settings.link_background_color}ee`,
        color: settings.link_text_color,
      }}
    >
      <p
        className="text-sm font-medium mb-3 text-center"
        style={{ color: settings.link_text_color }}
      >
        Veja pelo celular
      </p>
      <div className="bg-white p-2 rounded-lg">
        <QRCodeSVG
          value={url}
          size={100}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  )
}
