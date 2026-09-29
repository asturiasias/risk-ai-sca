export const STANDALONE_CSS = `
  :root {
    --color-primary: #0F172A;
    --color-surface: #1E293B;
    --color-teal: #0D9488;
    --color-teal-dark: #0F766E;
    --color-emerald: #059669;
    --color-amber: #D97706;
    --color-red: #DC2626;
    --color-bg: #F8FAFC;
    --color-card: #FFFFFF;
    --color-border: #E2E8F0;
    --color-text: #1E293B;
    --color-muted: #64748B;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body { background-color: var(--color-bg); color: var(--color-text); min-height: 100vh; display: flex; flex-direction: column; }
  
  header { background-color: #FFFFFF; border-bottom: 1px solid var(--color-border); padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; position: sticky; top: 0; z-index: 100; }
  .brand { font-size: 1.15rem; font-weight: 700; color: var(--color-primary); letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
  .brand-mark { width: 10px; height: 22px; background: var(--color-teal); border-radius: 2px; }
  .badge { font-size: 0.72rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; }
  .badge-local { background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
  .badge-warn { background-color: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
  .badge-danger { background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
  
  .main-layout { display: flex; flex: 1; min-height: calc(100vh - 58px); }
  nav.sidebar { width: 240px; background: var(--color-primary); border-right: 1px solid #1E293B; padding: 14px 8px; display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
  .nav-header { padding: 0 8px 8px 8px; font-size: 0.65rem; text-transform: uppercase; color: #64748B; font-weight: 700; letter-spacing: 0.05em; }
  .nav-btn { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 9px 10px; font-size: 0.8rem; font-weight: 500; color: #94A3B8; background: transparent; border: none; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
  .nav-btn:hover { background-color: #1E293B; color: #F8FAFC; }
  .nav-btn.active { background-color: #1E293B; color: #FFFFFF; font-weight: 600; border-left: 3px solid var(--color-teal); }
  
  .content-area { flex: 1; padding: 20px 28px; overflow-y: auto; max-height: calc(100vh - 58px); }
  .card { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; padding: 18px; margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
  
  .btn { padding: 7px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--color-teal); color: #FFFFFF; }
  .btn-primary:hover { background: var(--color-teal-dark); }
  .btn-excel { background: #ECFDF5; border-color: #A7F3D0; color: #065F46; font-weight: 600; }
  .btn-excel:hover { background: #D1FAE5; }
  .btn-outline { background: #FFFFFF; border-color: var(--color-border); color: var(--color-text); }
  .btn-outline:hover { background: #F8FAFC; }
  .btn-danger { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
  .btn-danger:hover { background: #FEE2E2; }
  
  table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  th { text-align: left; padding: 8px 10px; background: #F8FAFC; border-bottom: 1px solid var(--color-border); color: var(--color-muted); font-size: 0.72rem; font-weight: 600; }
  td { padding: 8px 10px; border-bottom: 1px solid var(--color-border); }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-variant-numeric: tabular-nums; }
  
  .alert-box { padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; margin-bottom: 14px; line-height: 1.4; }
  .alert-amber { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
  .alert-emerald { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
  .alert-red { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
  
  .cases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 8px; margin-bottom: 14px; }
  .case-card { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--color-border); background: #FFFFFF; cursor: pointer; text-align: left; transition: all 0.15s; font-size: 0.75rem; }
  .case-card:hover { border-color: var(--color-teal); background: #F0FDFA; }
  .case-card.active { border-color: var(--color-teal); background: #F0FDFA; font-weight: 600; }
  
  .doc-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--color-border); padding-bottom: 6px; margin-bottom: 10px; overflow-x: auto; }
  .doc-tab-btn { padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; background: transparent; border: 1px solid transparent; color: var(--color-muted); cursor: pointer; white-space: nowrap; }
  .doc-tab-btn.active { background: var(--color-primary); color: #FFFFFF; font-weight: 600; }
  .doc-content-box { background: #FAFAFA; border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.75rem; color: #334155; max-height: 260px; overflow-y: auto; white-space: pre-wrap; line-height: 1.5; }
  
  .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
  .form-label { font-size: 0.75rem; font-weight: 600; color: #475569; }
  .form-control { padding: 6px 10px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; outline: none; transition: border-color 0.15s; background: #FFFFFF; }
  .form-control:focus { border-color: var(--color-teal); }
  
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .modal-content { background: #FFFFFF; border-radius: 8px; width: 100%; max-width: 850px; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  
  @media print {
    header, nav.sidebar, .no-print { display: none !important; }
    .main-layout { display: block; }
    .content-area { padding: 0; overflow: visible; }
    .card { border: none; box-shadow: none; padding: 0; }
  }
`;
