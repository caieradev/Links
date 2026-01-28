'use client'

import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download } from 'lucide-react'

interface QRCodeGeneratorProps {
  username: string
  appUrl: string
}

export function QRCodeGenerator({ username, appUrl }: QRCodeGeneratorProps) {
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')
  const svgRef = useRef<HTMLDivElement>(null)

  const pageUrl = `${appUrl}/${username}`

  const downloadQRCode = (format: 'svg' | 'png') => {
    if (!svgRef.current) return

    const svg = svgRef.current.querySelector('svg')
    if (!svg) return

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = `${username}-qrcode.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
    } else {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      img.onload = () => {
        canvas.width = size
        canvas.height = size
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)

        const pngUrl = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        downloadLink.download = `${username}-qrcode.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(svgUrl)
      }
      img.src = svgUrl
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code da sua pagina</DialogTitle>
          <DialogDescription>
            Compartilhe sua pagina atraves deste QR Code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Preview */}
          <div
            ref={svgRef}
            className="flex items-center justify-center p-4 rounded-lg border"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              value={pageUrl}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* URL Display */}
          <div className="text-center text-sm text-muted-foreground break-all">
            {pageUrl}
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Input
                type="number"
                min={128}
                max={512}
                step={32}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor de fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Cor do QR Code</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadQRCode('svg')}
            >
              <Download className="mr-2 h-4 w-4" />
              SVG
            </Button>
            <Button
              className="flex-1"
              onClick={() => downloadQRCode('png')}
            >
              <Download className="mr-2 h-4 w-4" />
              PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
