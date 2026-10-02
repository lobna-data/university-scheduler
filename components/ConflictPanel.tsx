'use client';
import { Conflict, } from '../lib/types';
import { CONFLICT_LABEL } from '../lib/conflicts';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ConflictPanel({ conflicts, lang }: { conflicts: Conflict[]; lang: 'EN' | 'FR' }) {
  const fr = lang === 'FR';
  if (!conflicts.length) {
    return (
      <div className="ok-box">
        <CheckCircle2 size={18} />
        <div>
          <b>{fr ? 'Aucun conflit détecté' : 'No conflicts detected'}</b>
          <p>{fr
            ? 'Le planning respecte les contraintes : enseignant, groupe, salle, capacité, type de salle, disponibilité et heures requises.'
            : 'The schedule respects all constraints: teacher, group, room, capacity, room type, availability and required hours.'}</p>
        </div>
      </div>
    );
  }

  const byKind = new Map<string, Conflict[]>();
  for (const c of conflicts) {
    const arr = byKind.get(c.kind);
    if (arr) arr.push(c); else byKind.set(c.kind, [c]);
  }

  return (
    <div className="clist">
      {[...byKind.entries()].map(([kind, items]) => (
        <section key={kind} className="cgroup">
          <h4><AlertTriangle size={14} /> {CONFLICT_LABEL[kind as keyof typeof CONFLICT_LABEL]} <span className="badge">{items.length}</span></h4>
          <ul>
            {items.map((c) => (
              <li key={c.id}>
                {c.message}
                {c.sessionIds.length > 1 && <span className="muted small"> — {c.sessionIds.length} {fr ? 'cours concernés' : 'classes involved'}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
