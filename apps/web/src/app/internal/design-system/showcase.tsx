'use client';

import { useEffect, useRef, useState } from 'react';
import { Banner, Button, CheckboxField, Dialog, EmptyState, PageContent, Panel, PublicHeader, SelectField, Skeleton, SkipLink, StatusBadge, TextField } from '@agenda/ui';
import type { FeedbackTone } from '@agenda/ui';
import './showcase.css';

const colors = [
  ['Header', '#202020', '--color-surface-header'], ['Base', '#FFFFFF', '--color-surface-base'],
  ['Canvas', '#F7F8F9', '--color-surface-canvas'], ['Dividers', '#D9DDE1', '--color-border-subtle'],
  ['Secondary', '#4E5860', '--color-content-secondary'], ['Focus', '#2454A4', '--color-focus'],
] as const;

export function DesignSystemDemo() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogError, setDialogError] = useState(false);
  const [dialogBusy, setDialogBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (dialogTimer.current) clearTimeout(dialogTimer.current); }, []);
  function previewLoading() {
    if (loading) return;
    setLoading(true); setFeedback(false);
    timer.current = setTimeout(() => { setLoading(false); setFeedback(true); }, 1600);
  }
  return <div lang="en"><SkipLink /><PublicHeader><span className="ds-header-note">Design system / 2.0</span></PublicHeader>
    <PageContent className="demo-page">
      <div className="demo-intro"><div className="ds-stack"><p className="ds-eyebrow">Foundation / component study</p><h1>A quiet foundation.<br />Clear at every step.</h1><p className="ds-secondary demo-lede">One visual language for the moments that matter. Thoughtful contrast, comfortable controls, and room to breathe.</p></div>
        <div className="demo-note"><StatusBadge>Internal preview</StatusBadge><p>Local examples only. No bookings, payments, messages, or personal data.</p></div></div>
      <div className="demo-overview">
        <Panel className="ds-stack demo-direction"><p className="ds-eyebrow">01 / Visual direction</p><h2>Light by design.</h2><p className="ds-secondary">White space sets the pace. Dark actions anchor decisions. Dividers keep supporting panels light.</p><div className="demo-rule" /><div className="demo-metrics"><div><strong>44 px</strong><span>Minimum target</span></div><div><strong>1 px</strong><span>Dividers</span></div><div><strong>4 px</strong><span>Spacing unit</span></div></div></Panel>
        <Panel surface="base" lang="pt-BR" className="ds-stack demo-sample" aria-label="Approved visual sample"><p className="ds-eyebrow">Approved visual sample</p><p className="demo-sample-title ds-secondary">Seu próximo cuidado.</p><div className="demo-sample-service"><div><h2>Cortes, barba e cuidado</h2><p className="ds-secondary">Amostra visual · dados ilustrativos</p></div><p className="demo-price ds-secondary">R$ 20,00</p></div><div className="demo-rule" /><p className="ds-secondary" lang="en">This price is illustrative. Secondary styling is contextual, not a rule for financial totals.</p></Panel>
      </div>
      <Panel className="ds-stack"><div className="demo-section-heading"><div className="ds-stack"><p className="ds-eyebrow">02 / Essential palette</p><h2>Purpose before decoration.</h2></div><p className="ds-secondary">Semantic tokens. One source of truth.</p></div><div className="demo-palette">{colors.map(([label, value, token]) => <div className="demo-swatch" key={label}><div className="demo-swatch-color" style={{ background: `var(${token})` }} /><div><strong>{label}</strong><span>{value}</span></div></div>)}</div></Panel>
      <div className="demo-two-columns">
        <Panel className="ds-stack"><p className="ds-eyebrow">03 / Inter, without distractions</p><h2>Good type does the work.</h2><p className="demo-type-sample">Aa Bb Cc<br /><span>0123456789</span></p><p className="ds-secondary">Inter 400 / 500 / 600 · self-hosted variable font.<br />Body and fields stay at 16 px.</p></Panel>
        <Panel className="ds-stack"><p className="ds-eyebrow">04 / Rhythm and geometry</p><h2>Consistent, not rigid.</h2><div className="demo-geometry"><div className="demo-shape control">8 px<span>Controls</span></div><div className="demo-shape surface">12 px<span>Panels</span></div></div><p className="ds-secondary">A base-4 spacing scale keeps related information close and gives each section a clear start.</p></Panel>
      </div>
      <section className="demo-components ds-stack" aria-labelledby="components-heading"><div className="demo-section-heading"><div className="ds-stack"><p className="ds-eyebrow">05 / Interactive foundations</p><h2 id="components-heading">Ready for the details.</h2></div><p className="ds-secondary">Use Tab, Shift+Tab, Enter, Space, and Escape.</p></div>
        <div className="demo-two-columns"><Panel surface="base" className="ds-stack"><h3>Actions</h3><div className="demo-actions"><Button onClick={previewLoading} loading={loading} loadingLabel="Previewing…">Preview loading</Button><Button variant="secondary" onClick={() => setDialog(true)}>Open dialog</Button></div><div className="demo-actions"><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive" onClick={() => setDialog(true)}>Review removal</Button></div><Button disabled>Unavailable action</Button><p className="ds-field-help">Unavailable while this example is disabled.</p><div role="status" className="demo-result">{feedback ? 'Loading preview finished. No operation was performed.' : ''}</div></Panel>
          <Panel surface="base" className="ds-stack"><h3>Fields and recovery</h3><form noValidate className="ds-stack" onSubmit={(event) => { event.preventDefault(); setError(name.trim() ? '' : 'Enter an example name to continue.'); }}>
            <TextField label="Example name" name="example_name" value={name} onChange={(event) => setName(event.target.value)} help="Use fictional text. Your entry is kept when an error appears." error={error} required autoComplete="off" />
            <SelectField label="Example preference" defaultValue="any"><option value="any">Any available option</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option></SelectField>
            <CheckboxField label="I understand this is a visual example" help="Separate from any booking or marketing acceptance." />
            <Button type="submit" variant="outline">Validate example</Button>{error && <p className="ds-sr-only" role="alert">{error}</p>}
          </form></Panel></div>
        <Panel surface="base" className="ds-stack"><h3>Loading and unavailable fields</h3><div className="demo-two-columns"><TextField label="Loading example" value="Loading reference…" loading help="Read-only during loading; no network request is running." /><TextField label="Disabled example" defaultValue="Not available" disabled help="This field is unavailable in the example." /></div></Panel>
      </section>
      <section className="ds-stack" aria-labelledby="feedback-heading"><div className="demo-section-heading"><div className="ds-stack"><p className="ds-eyebrow">06 / Feedback and empty states</p><h2 id="feedback-heading">Always a next step.</h2></div><p className="ds-secondary">A label gives every color meaning.</p></div>
        <div className="demo-statuses">{(['success', 'warning', 'error', 'info', 'neutral'] as FeedbackTone[]).map((tone) => <StatusBadge key={tone} tone={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</StatusBadge>)}</div>
        <div className="demo-two-columns"><Banner tone="error" title="The example could not be loaded."><p>Your entry is preserved. Review the fields and try again.</p></Banner><Banner tone="info" title="This is a visual preview."><p>These controls do not submit bookings or initiate payments.</p></Banner></div>
        <div className="demo-two-columns"><EmptyState title="Nothing to show yet." action={<Button variant="outline" onClick={() => setDialog(true)}>Explore the dialog</Button>}>An empty state explains the next useful action.</EmptyState><div className="ds-stack"><p className="ds-secondary">Loading placeholder · no fictional financial values</p><Skeleton label="Loading visual placeholder" /></div></div>
      </section>
      <footer className="demo-footer"><span>Agenda / BR</span><p>Internal component study · DS 2.0 · BK-008</p></footer>
    </PageContent>
    <Dialog open={dialog} onClose={() => { setDialog(false); setDialogError(false); setDialogBusy(false); }} title="Review this example" description="A dialog keeps the decision and its consequences together. This preview changes no saved data." closeLabel="Close dialog" busy={dialogBusy}
      actions={<><Button variant="outline" disabled={dialogBusy} onClick={() => { setDialog(false); setDialogError(false); }}>Keep example</Button><Button loading={dialogBusy} loadingLabel="Previewing…" onClick={() => { if (dialogBusy) return; setDialogBusy(true); dialogTimer.current = setTimeout(() => { setDialogBusy(false); setDialogError(true); }, 1200); }}>Preview error</Button></>}>
      <div className="ds-stack"><TextField label="Optional example note" placeholder="No personal information" autoComplete="off" />{dialogBusy && <p role="status">Loading preview. Wait briefly before closing.</p>}{dialogError && <Banner role="alert" tone="error" title="Example action was not completed.">Your note remains available. Close the dialog or try the preview again.</Banner>}</div>
    </Dialog>
  </div>;
}
