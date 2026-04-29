'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import {
  Sparkles, Link2, BarChart3, Palette, Shield, Zap,
  CheckCircle2, Users, ShoppingBag, Music, Video,
  Instagram, Youtube, Facebook, Twitter, Linkedin, Twitch,
} from 'lucide-react'
import { MobileMenu } from './mobile-menu'
import { FAQItem } from './faq-item'
import { ScrollToTop } from './scroll-to-top'

export function LandingPage() {
  const [isYearly, setIsYearly] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const fadeInUp = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' } }

  const fadeInUpWithDelay = (delay: number) =>
    prefersReducedMotion
      ? {}
      : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.4, delay } }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Image src="/logo.png" alt="linksnabio" width={280} height={64} className="h-16 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition">Recursos</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition">Planos</button>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">Login</Link>
              <Link href="/register" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
                Começar Grátis
              </Link>
            </div>
            <MobileMenu onNavigate={scrollToSection} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-0 overflow-hidden flex items-center min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Right Side Full-Bleed Image (Desktop) */}
        <motion.div
          className="hidden lg:block absolute top-0 right-0 bottom-0 w-[50vw] z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 overflow-hidden shadow-2xl">
            <Image
              src="/landing/hero.png"
              alt="Smartphone 3D com cores vivas e mídias sociais"
              fill
              className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-left flex flex-col justify-center lg:w-[48%] py-12 lg:py-20 lg:pr-12 xl:pr-20"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Tudo que você é.<br className="sm:hidden" />{' '}
              <span className="text-black underline decoration-4 underline-offset-8">
                Em um só link.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Una sua audiência em todas as suas plataformas com um único link poderoso na bio.
              Compartilhe conteúdo, venda produtos e expanda sua presença online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="linksnabio.cc/seunome"
                className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-black focus:outline-none text-lg text-black"
              />
              <Link
                href="/register"
                className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition transform hover:scale-105 whitespace-nowrap text-center"
              >
                Reivindique seu link
              </Link>
            </div>
            <p className="text-sm text-gray-500">É grátis, e leva menos de um minuto!</p>
          </motion.div>

          {/* Mobile/Tablet Image Container */}
          <motion.div
            className="relative lg:hidden w-full h-[50vh] mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute inset-0 overflow-hidden shadow-2xl rounded-3xl">
              <Image
                src="/landing/hero.png"
                alt="Smartphone 3D com cores vivas e mídias sociais"
                fill
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">Feito para <span className="underline decoration-4 underline-offset-8">sua marca</span></h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para crescer sua presença digital e conectar com seu público
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Link2, title: 'Links Ilimitados', description: 'Adicione quantos links quiser. Organize por categorias e prioridades.' },
              { icon: BarChart3, title: 'Analytics Poderoso', description: 'Entenda seu público com métricas detalhadas de cliques e engajamento.' },
              { icon: Palette, title: 'Personalização Total', description: 'Customize cores, fontes e layouts para refletir sua marca única.' },
              { icon: Zap, title: 'Integração Rápida', description: 'Conecte com Instagram, TikTok, YouTube e outras plataformas.' },
              { icon: Shield, title: 'Seguro e Confiável', description: 'Seus dados protegidos com criptografia de nível empresarial.' },
              { icon: Sparkles, title: 'SEO Otimizado', description: 'Apareça nos resultados de busca e seja encontrado facilmente.' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUpWithDelay(isMobile ? 0 : index * 0.1)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition group"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-4xl font-bold text-black mb-6">
                Seu link,<br className="sm:hidden" /> <span className="underline decoration-4 underline-offset-8">sua identidade</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Crie uma página profissional que reflete exatamente quem você é.
                Personalize cores, fontes, layouts e muito mais.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Palette, text: 'Temas personalizáveis ilimitados' },
                  { icon: Sparkles, text: 'Layouts modernos e responsivos' },
                  { icon: Link2, text: 'Botões e ícones customizados' },
                  { icon: BarChart3, text: 'Insights em tempo real' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-black text-lg">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <motion.div
                className="w-full max-w-2xl mx-auto cursor-pointer"
                animate={isMobile ? undefined : { y: [0, -10, 0] }}
                transition={{
                  y: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
                }}
                whileHover={isMobile ? undefined : { scale: 1.05, rotate: -2, transition: { duration: 0.2 } }}
                whileTap={isMobile ? undefined : { scale: 0.95 }}
              >
                <Image
                  src="/landing/mockup.png"
                  alt="Mockup Linksnabio"
                  width={800}
                  height={600}
                  className="w-full drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-black mb-2">Integre com suas plataformas favoritas</h3>
            <p className="text-gray-600">Conecte todas as suas redes sociais em um só lugar</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { icon: Instagram, name: 'Instagram' },
              { icon: Youtube, name: 'YouTube' },
              { icon: Facebook, name: 'Facebook' },
              { icon: Twitter, name: 'Twitter' },
              { icon: Linkedin, name: 'LinkedIn' },
              { icon: Twitch, name: 'Twitch' },
            ].map((platform, index) => (
              <motion.div
                key={index}
                {...fadeInUpWithDelay(isMobile ? 0 : index * 0.05)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 text-black group-hover:scale-110 transition">
                  <platform.icon className="w-full h-full" />
                </div>
                <span className="text-sm text-gray-600">{platform.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Perfeito para todos os tipos de criadores</h2>
            <p className="text-xl text-gray-600">Seja qual for seu objetivo, o Linksnabio potencializa seus resultados</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: 'Influenciadores', description: 'Monetize sua audiência com links para produtos, cursos e parcerias' },
              { icon: ShoppingBag, title: 'E-commerce', description: 'Transforme seguidores em clientes com catálogo de produtos integrado' },
              { icon: Music, title: 'Artistas', description: 'Centralize suas músicas, shows e merchandise em um único lugar' },
              { icon: Video, title: 'Criadores', description: 'Direcione tráfego para YouTube, TikTok, Twitch e outras plataformas' },
            ].map((useCase, index) => (
              <motion.div
                key={index}
                {...fadeInUpWithDelay(isMobile ? 0 : index * 0.1)}
                className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition group"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">Escolha seu plano</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6">Comece grátis e faça upgrade quando quiser</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !isYearly ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                  isYearly ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                Anual
                {isYearly && (
                  <span className="absolute -top-3 -right-3 bg-white text-black border border-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    -20%
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                priceMonthly: 'Grátis',
                priceYearly: 'Grátis',
                period: '',
                yearlyTotal: null,
                description: 'Para começar',
                features: ['Links ilimitados', 'Cores personalizadas', 'Botão compartilhar página', 'QR Code da página', 'SEO básico'],
                cta: 'Começar Grátis',
                popular: false,
                href: '/register',
              },
              {
                name: 'Starter',
                priceMonthly: 'R$ 19',
                priceYearly: 'R$ 15',
                period: '/mês',
                yearlyTotal: 'Cobrado R$ 180/ano',
                description: 'Para criadores',
                features: ['Tudo do Free +', 'Temas prontos', 'Seções de links', 'Redirect links', 'Captura de subscribers', 'Ícones de redes sociais', 'Imagem de capa nos links'],
                cta: 'Fazer upgrade',
                popular: true,
                href: '/register?plan=starter',
              },
              {
                name: 'Pro',
                priceMonthly: 'R$ 31',
                priceYearly: 'R$ 25',
                period: '/mês',
                yearlyTotal: 'Cobrado R$ 300/ano',
                description: 'Para profissionais',
                features: ['Tudo do Starter +', 'Remover branding', 'Analytics detalhado', 'Gradientes e backgrounds', 'Fontes e animações', 'Vídeo do YouTube no header', 'Lead gate (captura de email)', 'Domínio customizado*'],
                cta: 'Fazer upgrade',
                popular: false,
                href: '/register?plan=pro',
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                {...fadeInUpWithDelay(isMobile ? 0 : index * 0.1)}
                className={`bg-white p-8 rounded-2xl ${
                  plan.popular ? 'ring-2 ring-black shadow-2xl scale-105' : 'shadow-lg'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-black">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    {plan.period && <span className="text-xl text-gray-600">{plan.period}</span>}
                  </div>
                  {isYearly && plan.yearlyTotal && (
                    <p className="text-sm text-gray-500 mt-2">{plan.yearlyTotal}</p>
                  )}
                </div>
                <Link
                  href={plan.href}
                  className={`block w-full py-3 rounded-full font-semibold mb-6 transition text-center ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                      <span className="text-black">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            * O domínio personalizado não está incluso no plano. O registro e renovação do domínio devem ser adquiridos separadamente pelo usuário.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tudo que você precisa saber sobre o Linksnabio</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <FAQItem
              question="O Linksnabio é realmente grátis?"
              answer="Sim! Oferecemos um plano gratuito completo com links ilimitados e personalização básica. Você pode atualizar para o plano Starter ou Pro quando precisar de recursos avançados."
            />
            <FAQItem
              question="Posso usar meu próprio domínio?"
              answer="Sim! No plano Pro, você pode conectar seu próprio domínio personalizado (ex: meunome.com) ao invés de usar linksnabio.cc/seunome. O registro do domínio deve ser feito separadamente."
            />
            <FAQItem
              question="Quanto tempo leva para configurar?"
              answer="Menos de 2 minutos! Basta criar sua conta, personalizar seu link e adicionar seus conteúdos. Você pode estar no ar em questão de minutos."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim, sem complicações. Você pode cancelar sua assinatura a qualquer momento e continuará tendo acesso até o fim do período pago. Também pode voltar ao plano gratuito se preferir."
            />
            <FAQItem
              question="Como funciona o analytics?"
              answer="Você terá acesso a métricas detalhadas como número de visualizações, cliques em cada link, origem do tráfego, dispositivos usados e muito mais. Dados atualizados em tempo real!"
            />
            <FAQItem
              question="Existe limite de links?"
              answer="Não! Mesmo no plano gratuito, você pode adicionar quantos links quiser. Organize-os por categorias, prioridades e personalize cada um deles."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-black">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Junte-se a milhões de criadores que já transformaram seu link na bio em uma máquina de crescimento
            </p>
            <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 items-center justify-center">
              <input
                type="text"
                placeholder="linksnabio.cc/seunome"
                className="w-full sm:flex-1 bg-white px-6 py-4 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-black placeholder:text-gray-500"
              />
              <Link
                href="/register"
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition transform hover:scale-105 whitespace-nowrap text-center"
              >
                Criar Conta Grátis
              </Link>
            </div>
            <p className="text-white/80 mt-8">Sem cartão de crédito necessário &bull; Configure em 2 minutos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="mb-4 block">
                <Image src="/logo.png" alt="linksnabio" width={280} height={64} className="h-14 w-auto brightness-0 invert" />
              </Link>
              <p className="text-gray-400">
                Conecte sua audiência. Expanda seu alcance. Cresça sua marca.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Recursos</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition">Planos</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="mailto:contato@linksnabio.cc" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/termos" className="hover:text-white transition">Termos de uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-white transition">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Linksnabio. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/termos" className="text-gray-400 hover:text-white transition">Termos</Link>
              <Link href="/privacidade" className="text-gray-400 hover:text-white transition">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
