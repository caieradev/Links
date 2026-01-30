import Link from 'next/link'

export const metadata = {
  title: 'Politica de Privacidade - Links',
  description: 'Politica de privacidade e protecao de dados da plataforma Links',
}

export default function PrivacidadePage() {
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
        <h1 className="text-4xl font-bold mb-8">Politica de Privacidade</h1>

        <p className="text-muted-foreground mb-8">
          Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introducao</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta Politica de Privacidade descreve como a plataforma Links (&quot;nos&quot;, &quot;nosso&quot;,
              &quot;Plataforma&quot;) coleta, usa, armazena, compartilha e protege suas informacoes pessoais
              quando voce utiliza nossos servicos. Ao utilizar a Plataforma, voce concorda com a
              coleta e uso de informacoes de acordo com esta politica. Esta politica foi elaborada
              em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei n. 13.709/2018) e
              outras legislacoes aplicaveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Dados que Coletamos</h2>

            <h3 className="text-xl font-medium mb-3 mt-6">2.1 Dados fornecidos por voce</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Dados de cadastro:</strong> e-mail, senha (criptografada), nome de usuario;</li>
              <li><strong>Dados de perfil:</strong> nome de exibicao, biografia, foto de perfil;</li>
              <li><strong>Conteúdo:</strong> links, titulos, descricoes e configuracoes de aparencia
                que voce adiciona a sua pagina;</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe - nao
                armazenamos dados de cartao de credito em nossos servidores.</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Dados coletados automaticamente</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Dados de uso:</strong> paginas visitadas, cliques em links, tempo de acesso;</li>
              <li><strong>Dados de dispositivo:</strong> tipo de navegador, sistema operacional,
                resolucao de tela;</li>
              <li><strong>Dados de conexao:</strong> endereco IP, provedor de internet, localizacao
                aproximada (pais/cidade);</li>
              <li><strong>Cookies e tecnologias similares:</strong> identificadores de sessao,
                preferencias de usuario.</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3 Dados de terceiros</h3>
            <p className="text-muted-foreground leading-relaxed">
              Podemos receber dados de provedores de servicos terceirizados que utilizamos, como
              informacoes de transacao do Stripe ou dados de autenticacao de provedores de login social.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Como Usamos seus Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos seus dados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Prestacao do servico:</strong> criar e manter sua conta, exibir sua pagina
                de links, processar pagamentos;</li>
              <li><strong>Comunicacao:</strong> enviar notificacoes sobre sua conta, atualizacoes do
                servico, comunicacoes de marketing (com seu consentimento);</li>
              <li><strong>Melhoria do servico:</strong> analisar padroes de uso para aprimorar
                funcionalidades e experiencia do usuario;</li>
              <li><strong>Seguranca:</strong> detectar e prevenir fraudes, abusos e atividades
                maliciosas;</li>
              <li><strong>Cumprimento legal:</strong> atender obrigacoes legais, responder a
                solicitacoes de autoridades competentes;</li>
              <li><strong>Analytics:</strong> fornecer estatisticas de acesso e cliques em sua pagina
                (para planos que incluem este recurso).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Base Legal para Tratamento (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tratamos seus dados pessoais com base nas seguintes hipoteses legais previstas na LGPD:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Execucao de contrato:</strong> para prestacao dos servicos contratados;</li>
              <li><strong>Consentimento:</strong> para comunicacoes de marketing e funcionalidades opcionais;</li>
              <li><strong>Legitimo interesse:</strong> para melhoria do servico, seguranca e prevencao
                de fraudes;</li>
              <li><strong>Cumprimento de obrigacao legal:</strong> para atender exigencias legais e
                regulatorias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Podemos compartilhar seus dados com:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Provedores de servicos:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Supabase (banco de dados e autenticacao)</li>
                  <li>Stripe (processamento de pagamentos)</li>
                  <li>Vercel (hospedagem)</li>
                  <li>Provedores de e-mail transacional</li>
                </ul>
              </li>
              <li><strong>Autoridades competentes:</strong> quando exigido por lei, ordem judicial
                ou processo legal;</li>
              <li><strong>Protecao de direitos:</strong> para proteger nossos direitos, propriedade
                ou seguranca, ou de terceiros;</li>
              <li><strong>Transacoes corporativas:</strong> em caso de fusao, aquisicao ou venda de
                ativos, seus dados podem ser transferidos.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4 font-semibold">
              NAO VENDEMOS SEUS DADOS PESSOAIS A TERCEIROS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Transferencia Internacional de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados podem ser transferidos e armazenados em servidores localizados fora do Brasil,
              incluindo Estados Unidos e outros paises. Nossos provedores de servicos estao sujeitos
              a padroes de protecao de dados adequados, incluindo clausulas contratuais padrao e
              certificacoes de privacidade. Ao utilizar nosso servico, voce consente com essa
              transferencia internacional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Retencao de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Manteremos seus dados pessoais pelo tempo necessario para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer os servicos contratados;</li>
              <li>Cumprir obrigacoes legais e regulatorias;</li>
              <li>Resolver disputas e fazer cumprir nossos acordos;</li>
              <li>Manter registros para fins de auditoria e compliance.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Apos o encerramento de sua conta, poderemos manter dados anonimizados para fins
              estatisticos e dados necessarios para cumprimento de obrigacoes legais por ate
              5 (cinco) anos ou conforme exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Conforme a LGPD, voce possui os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Confirmacao e acesso:</strong> confirmar a existencia de tratamento e
                acessar seus dados;</li>
              <li><strong>Correcao:</strong> solicitar a correcao de dados incompletos, inexatos
                ou desatualizados;</li>
              <li><strong>Anonimizacao, bloqueio ou eliminacao:</strong> de dados desnecessarios,
                excessivos ou tratados em desconformidade;</li>
              <li><strong>Portabilidade:</strong> obter seus dados em formato estruturado;</li>
              <li><strong>Eliminacao:</strong> solicitar a exclusao de dados tratados com base
                em consentimento;</li>
              <li><strong>Informacao:</strong> ser informado sobre compartilhamento de dados;</li>
              <li><strong>Revogacao:</strong> revogar consentimento a qualquer momento;</li>
              <li><strong>Oposicao:</strong> opor-se ao tratamento em determinadas circunstancias.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato conosco pelo e-mail indicado ao final
              desta politica. Responderemos sua solicitacao em ate 15 (quinze) dias uteis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies e Tecnologias de Rastreamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Cookies essenciais:</strong> necessarios para funcionamento basico do site
                (autenticacao, sessao);</li>
              <li><strong>Cookies de preferencias:</strong> armazenam suas configuracoes e preferencias;</li>
              <li><strong>Cookies analiticos:</strong> ajudam a entender como os usuarios interagem
                com o servico;</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Voce pode gerenciar suas preferencias de cookies atraves das configuracoes do seu
              navegador. Note que desabilitar certos cookies pode afetar a funcionalidade do servico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Seguranca</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Implementamos medidas tecnicas e organizacionais para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Criptografia de dados em transito (HTTPS/TLS) e em repouso;</li>
              <li>Armazenamento seguro de senhas com algoritmos de hash;</li>
              <li>Controles de acesso baseados em funcao;</li>
              <li>Monitoramento de seguranca e deteccao de intrusoes;</li>
              <li>Backups regulares e planos de recuperacao.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Apesar de nossos esforcos, nenhum metodo de transmissao ou armazenamento eletronico
              e 100% seguro. Nao podemos garantir seguranca absoluta de seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Dados de Menores</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nosso servico nao e destinado a menores de 18 anos. Nao coletamos intencionalmente
              dados de menores. Se tomarmos conhecimento de que coletamos dados de um menor sem
              verificacao de consentimento parental, tomaremos medidas para remover tais informacoes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Dados Publicos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Informacoes que voce inclui em sua pagina publica de links (nome de usuario, nome de
              exibicao, biografia, avatar, links) sao vissiveis publicamente na internet. Essas
              informacoes podem ser indexadas por mecanismos de busca e acessadas por qualquer pessoa.
              Voce e responsavel pelo conteúdo que torna publico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Alteracoes nesta Politica</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Politica de Privacidade periodicamente. Alteracoes significativas
              serao notificadas por e-mail ou aviso em destaque na Plataforma. Recomendamos revisar
              esta pagina periodicamente. O uso continuado do servico apos alteracoes constitui
              aceitacao da politica atualizada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contato e Encarregado (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para exercer seus direitos, esclarecer duvidas sobre esta politica ou reportar
              incidentes de privacidade, entre em contato:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:contato@stratus.dev.br" className="text-primary hover:underline">
                contato@stratus.dev.br
              </a>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Voce tambem pode registrar reclamacoes junto a Autoridade Nacional de Protecao de
              Dados (ANPD) caso entenda que seus direitos nao foram adequadamente atendidos.
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
