import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Link2,
  Palette,
  BarChart2,
  Globe,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react'
import { PricingSection } from '@/components/pricing/pricing-section'

const features = [
  {
    icon: Link2,
    title: 'Links ilimitados',
    description: 'Adicione quantos links quiser à sua página',
  },
  {
    icon: Palette,
    title: 'Personalização total',
    description: 'Cores, fontes, estilos e muito mais',
  },
  {
    icon: BarChart2,
    title: 'Analytics detalhado',
    description: 'Acompanhe cliques e estatísticas',
  },
  {
    icon: Globe,
    title: 'Domínio customizado',
    description: 'Use seu próprio domínio',
  },
  {
    icon: Zap,
    title: 'Super rápido',
    description: 'Carregamento instantâneo',
  },
  {
    icon: Shield,
    title: 'Seguro',
    description: 'Seus dados estão protegidos',
  },
]


export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Links
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Todos os seus links
              <br />
              <span className="text-primary">em um só lugar</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie sua página de links personalizada em segundos. Compartilhe
              tudo o que você faz com uma única URL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Criar minha página
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Ver funcionalidades</Link>
              </Button>
            </div>

            {/* Preview mockup */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
              <div className="max-w-sm mx-auto bg-gradient-to-b from-primary/10 to-primary/5 rounded-3xl p-6 shadow-2xl border">
                <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4" />
                <div className="h-6 bg-foreground/10 rounded-full w-32 mx-auto mb-2" />
                <div className="h-4 bg-foreground/5 rounded-full w-24 mx-auto mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-primary/20 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Recursos poderosos para criar a página de links perfeita
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-6">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <PricingSection isAuthenticated={false} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Crie sua página de links em menos de 1 minuto. Sem cartão de
              crédito necessário.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Criar minha página grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-2xl font-bold">
                Links
              </Link>
              <p className="text-muted-foreground mt-2">
                Sua página de links personalizada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Central de ajuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Links. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
