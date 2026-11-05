import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/admin/admin-menu.tsx', import.meta.url),'utf8');
const expected=['Tableau de bord','Applications','Développeurs','Messages','Discussion','Signalements','Notifications','Équipe'];
let cursor=-1;for(const label of expected){const next=source.indexOf(label,cursor+1);if(next<0)throw new Error(`Entrée absente du menu admin: ${label}`);cursor=next}if(!source.includes('admin-logout'))throw new Error('Déconnexion absente du menu admin');console.log('Admin menu guard: OK');
