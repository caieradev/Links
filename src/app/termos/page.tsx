import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso - Links',
  description: 'Termos e condições de uso da plataforma Links',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <Link href="/" className="text-2xl font-bold">
            Links
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

        <p className="text-muted-foreground mb-8">
          Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitacao dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar, navegar ou utilizar a plataforma Links (&quot;Servico&quot;, &quot;Plataforma&quot;),
              voce (&quot;Usuario&quot;, &quot;voce&quot;) concorda integralmente com estes Termos de Uso.
              Se voce nao concordar com qualquer parte destes termos, nao devera utilizar nossos servicos.
              O uso continuado da Plataforma constitui aceitacao de quaisquer alteracoes futuras destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descricao do Servico</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma Links oferece ferramentas para criacao de paginas personalizadas de links
              (&quot;link-in-bio&quot;). O Servico e fornecido &quot;como esta&quot; e &quot;conforme disponivel&quot;,
              sujeito a modificacoes, suspensoes ou descontinuacao a qualquer momento, sem aviso previo
              ou responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Elegibilidade e Cadastro</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para utilizar o Servico, voce declara e garante que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Possui pelo menos 18 anos de idade ou maioridade legal em sua jurisdicao;</li>
              <li>Possui capacidade legal para celebrar contratos vinculantes;</li>
              <li>Fornecera informacoes verdadeiras, precisas e completas durante o cadastro;</li>
              <li>Mantera a seguranca e confidencialidade de suas credenciais de acesso;</li>
              <li>Sera integralmente responsavel por todas as atividades realizadas em sua conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitavel</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Voce concorda em NAO utilizar o Servico para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Publicar, transmitir ou compartilhar conteúdo ilegal, difamatorio, obsceno, pornografico,
                ameacador, abusivo, discriminatorio ou que viole direitos de terceiros;</li>
              <li>Promover atividades ilegais, incluindo mas nao limitado a fraudes, pirataria,
                jogos de azar ilegais ou venda de substancias proibidas;</li>
              <li>Distribuir malware, virus, spam ou qualquer codigo malicioso;</li>
              <li>Coletar dados de outros usuarios sem consentimento;</li>
              <li>Interferir ou sobrecarregar nossos servidores ou infraestrutura;</li>
              <li>Violar leis locais, estaduais, nacionais ou internacionais aplicaveis;</li>
              <li>Criar multiplas contas para contornar restricoes ou limites do Servico;</li>
              <li>Revender, sublicenciar ou comercializar o acesso ao Servico sem autorizacao expressa.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Reservamo-nos o direito exclusivo de determinar o que constitui violacao desta politica
              e tomar as medidas que julgarmos apropriadas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Conteúdo do Usuario</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Voce e o unico responsavel por todo conteúdo que publica, transmite ou disponibiliza
              atraves do Servico (&quot;Conteúdo do Usuario&quot;). Ao publicar Conteúdo do Usuario, voce:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Declara possuir todos os direitos necessarios sobre tal conteúdo;</li>
              <li>Concede-nos licenca mundial, nao-exclusiva, livre de royalties, transferivel e
                sublicenciavel para usar, reproduzir, modificar, adaptar, publicar, traduzir,
                distribuir e exibir tal conteúdo em conexao com o Servico;</li>
              <li>Isenta-nos de qualquer responsabilidade relacionada ao seu Conteúdo do Usuario;</li>
              <li>Reconhece que nao temos obrigacao de monitorar, editar ou remover conteúdo,
                embora possamos faze-lo a nosso exclusivo criterio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma, incluindo seu design, codigo-fonte, logotipos, marcas, textos, graficos
              e demais elementos, e protegida por direitos autorais e outras leis de propriedade
              intelectual. Nenhum direito ou licenca e concedido ao Usuario, exceto o direito limitado
              de uso do Servico conforme estes Termos. E expressamente proibido copiar, modificar,
              distribuir, vender ou alugar qualquer parte do Servico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Planos e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Determinados recursos do Servico estao disponiveis mediante assinatura paga. Ao adquirir
              um plano pago, voce concorda que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Os pagamentos sao processados por terceiros (Stripe) e estao sujeitos aos termos
                desses provedores;</li>
              <li>As assinaturas sao renovadas automaticamente ate que sejam canceladas;</li>
              <li>Os precos podem ser alterados mediante aviso previo de 30 dias;</li>
              <li>Reembolsos sao concedidos exclusivamente a nosso criterio e conforme legislacao aplicavel;</li>
              <li>A falta de pagamento pode resultar em suspensao ou cancelamento do acesso aos recursos pagos;</li>
              <li>Voce e responsavel por todos os impostos aplicaveis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Dominios Personalizados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O recurso de dominio personalizado disponivel em determinados planos permite que voce
              conecte um dominio proprio a sua pagina de links. E importante esclarecer que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>O registro e a renovacao do dominio NAO estao inclusos em nenhum plano da Plataforma;</li>
              <li>Voce e integralmente responsavel pela aquisicao, manutencao e renovacao do dominio
                junto a um registrador de dominios de sua escolha;</li>
              <li>A Plataforma oferece apenas a funcionalidade tecnica de vincular seu dominio
                existente a sua pagina de links;</li>
              <li>Custos relacionados ao registro, transferencia ou renovacao de dominios sao de
                exclusiva responsabilidade do Usuario;</li>
              <li>A Plataforma nao se responsabiliza por problemas relacionados ao registro,
                disponibilidade ou configuracao de DNS do seu dominio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Suspensao e Encerramento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de, a nosso exclusivo criterio e sem aviso previo, suspender,
              restringir ou encerrar sua conta e acesso ao Servico, por qualquer motivo, incluindo
              mas nao limitado a: violacao destes Termos, atividades fraudulentas, solicitacao de
              autoridades competentes, periodos prolongados de inatividade, ou qualquer conduta que
              consideremos prejudicial ao Servico, outros usuarios ou terceiros. Nenhum reembolso sera
              devido em caso de encerramento por violacao destes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Isencao de Garantias</h2>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              O SERVICO E FORNECIDO &quot;COMO ESTA&quot;, &quot;CONFORME DISPONIVEL&quot; E &quot;COM TODAS AS FALHAS&quot;,
              SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLICITAS. NA MAXIMA EXTENSAO PERMITIDA
              PELA LEI APLICAVEL, ISENTAMO-NOS EXPRESSAMENTE DE TODAS AS GARANTIAS, INCLUINDO, MAS
              NAO SE LIMITANDO A, GARANTIAS IMPLICITAS DE COMERCIALIZACAO, ADEQUACAO A UM PROPOSITO
              ESPECIFICO, NAO-VIOLACAO, PRECISAO, INTEGRIDADE, DISPONIBILIDADE, SEGURANCA OU
              DESEMPENHO. NAO GARANTIMOS QUE O SERVICO SERA ININTERRUPTO, LIVRE DE ERROS, SEGURO
              OU QUE DEFEITOS SERAO CORRIGIDOS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Limitacao de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              NA MAXIMA EXTENSAO PERMITIDA PELA LEI APLICAVEL, EM NENHUMA CIRCUNSTANCIA SEREMOS
              RESPONSAVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS,
              PUNITIVOS OU EXEMPLARES, INCLUINDO, MAS NAO SE LIMITANDO A, PERDA DE LUCROS, DADOS,
              REPUTACAO, OPORTUNIDADES DE NEGOCIO OU OUTRAS PERDAS INTANGIVEIS, RESULTANTES DE:
              (A) USO OU INCAPACIDADE DE USO DO SERVICO; (B) ACESSO NAO AUTORIZADO OU ALTERACAO DE
              SUAS TRANSMISSOES OU DADOS; (C) DECLARACOES OU CONDUTA DE TERCEIROS NO SERVICO;
              (D) QUALQUER OUTRA QUESTAO RELACIONADA AO SERVICO. NOSSA RESPONSABILIDADE TOTAL
              AGREGADA NAO EXCEDERA O MAIOR VALOR ENTRE: (I) OS VALORES PAGOS POR VOCE NOS
              ULTIMOS 12 MESES; OU (II) R$ 100,00 (CEM REAIS).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Indenizacao</h2>
            <p className="text-muted-foreground leading-relaxed">
              Voce concorda em defender, indenizar e isentar a Plataforma, seus diretores,
              funcionarios, agentes, parceiros e licenciadores de e contra quaisquer reclamacoes,
              danos, obrigacoes, perdas, responsabilidades, custos ou dividas e despesas (incluindo,
              mas nao se limitando a, honorarios advocaticios) decorrentes de: (a) seu uso e acesso
              ao Servico; (b) violacao de qualquer termo destes Termos; (c) violacao de direitos de
              terceiros, incluindo direitos autorais, propriedade ou privacidade; (d) qualquer
              alegacao de que seu Conteúdo do Usuario causou danos a terceiros. Esta obrigacao de
              indenizacao sobrevivera ao encerramento destes Termos e de sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Links de Terceiros</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Servico pode conter links para sites ou servicos de terceiros que nao sao de nossa
              propriedade ou controlados por nos. Nao temos controle sobre, e nao assumimos
              responsabilidade pelo conteúdo, politicas de privacidade ou praticas de sites ou
              servicos de terceiros. Voce reconhece e concorda que nao seremos responsaveis, direta
              ou indiretamente, por qualquer dano ou perda causados ou alegadamente causados pelo
              uso ou confianca em tais conteúdos, bens ou servicos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Modificacoes dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alteracoes
              materiais serao notificadas por meio do Servico ou por e-mail. O uso continuado do
              Servico apos tais modificacoes constitui aceitacao dos novos Termos. E sua
              responsabilidade revisar periodicamente estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Disposicoes Gerais</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Lei Aplicavel:</strong> Estes Termos serao regidos e interpretados de acordo
              com as leis da Republica Federativa do Brasil, independentemente de conflitos de
              principios legais.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Foro:</strong> Fica eleito o foro da Comarca de Sao Paulo/SP para dirimir
              quaisquer controversias decorrentes destes Termos, com renuncia a qualquer outro,
              por mais privilegiado que seja.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Integralidade:</strong> Estes Termos constituem o acordo integral entre voce
              e a Plataforma e substituem todos os acordos anteriores.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Divisibilidade:</strong> Se qualquer disposicao destes Termos for considerada
              invalida ou inexequivel, as demais disposicoes permanecerao em pleno vigor e efeito.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Renuncia:</strong> A falha em exercer ou fazer cumprir qualquer direito ou
              disposicao destes Termos nao constituira renuncia a tal direito ou disposicao.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questoes sobre estes Termos de Uso, entre em contato conosco pelo e-mail:{' '}
              <a href="mailto:contato@stratus.dev.br" className="text-primary hover:underline">
                contato@stratus.dev.br
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Links. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
