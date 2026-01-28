import { Button } from '@/components/ui/button'
import type { PageSettings } from '@/types/database'

interface JoinCTAProps {
  profileName: string
  settings: PageSettings
}

export function JoinCTA({ profileName, settings }: JoinCTAProps) {
  return (
    <div className="w-full mt-12 pt-8 border-t border-current/10">
      <div className="text-center mb-6">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: settings.text_color }}
        >
          Junte-se a {profileName} no Links
        </h3>
        <p
          className="text-sm opacity-75"
          style={{ color: settings.text_color }}
        >
          Crie sua propria página de links. E grátis!
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Button
          asChild
          className="w-full"
          style={{
            backgroundColor: settings.text_color,
            color: settings.background_color,
          }}
        >
          <a href="/register">Cadastre-se gratuitamente</a>
        </Button>
        <Button
          variant="outline"
          asChild
          className="w-full"
          style={{
            borderColor: `${settings.text_color}40`,
            color: settings.text_color,
            backgroundColor: 'transparent',
          }}
        >
          <a href="/pricing">Saiba mais</a>
        </Button>
      </div>
    </div>
  )
}
