import { PageContent, PublicHeader, SkipLink } from '@agenda/ui';

export default function HomePage() {
  return <><SkipLink>Ir para o conteúdo</SkipLink><PublicHeader /><PageContent className="ds-stack">
    <h1 className="ds-secondary">Seu próximo cuidado.</h1><p>Agendamento e gestão para negócios de beleza.</p>
  </PageContent></>;
}
