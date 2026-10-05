import { createContext, useContext, useState, type ReactNode } from 'react';
import { Columns3, X } from 'lucide-react';
import type { Equipment } from '../data';
import { usePersistentState } from '../usePersistentState';
import { PageLink } from '../router';
import { currency } from '../utils';
import { Photo } from './PhotoGallery';
const Context = createContext<{ids:string[]; toggle:(id:string)=>void; clear:()=>void; notice:string; error:string} | null>(null);
export function ComparisonProvider({children}:{children:ReactNode}) {
  const [ids,setIds,error]=usePersistentState<string[]>('farmigo-compare',[]);
  const [notice,setNotice]=useState('');
  function toggle(id:string){
    if(ids.includes(id)){setIds(ids.filter(x=>x!==id));setNotice('');}
    else if(ids.length>=3) setNotice('Compare up to three machines. Remove one to add another.');
    else {setIds([...ids,id]);setNotice('');}
  }
  return <Context.Provider value={{ids,toggle,clear:()=>{setIds([]);setNotice('');},notice,error}}>{children}</Context.Provider>;
}
function useComparison(){const c=useContext(Context);if(!c)throw new Error('Missing comparison provider');return c;}
export function CompareToggle({equipment:e}:{equipment:Equipment}){
 const {ids,toggle}=useComparison();
 return <button className="compare-toggle" aria-pressed={ids.includes(e.id)} onClick={()=>toggle(e.id)}><Columns3 size={16}/>{ids.includes(e.id)?'Added to comparison':'Compare'}</button>;
}
export function CompareTray({equipment}:{equipment:Equipment[]}){
 const {ids,toggle,clear,notice,error}=useComparison(); const selected=equipment.filter(e=>ids.includes(e.id));
 if(!selected.length)return null;
 return <aside className="compare-tray" aria-label="Equipment comparison"><div><strong>Compare equipment · {selected.length}/3</strong><div className="compare-chips">{selected.map(e=><button key={e.id} onClick={()=>toggle(e.id)} aria-label={`Remove ${e.title} from comparison`}>{e.title}<X size={15}/></button>)}</div>{(notice||error)&&<p role="status">{notice||error}</p>}</div><div className="action-row"><PageLink className="button primary" page="/compare">Compare {selected.length} {selected.length===1?'machine':'machines'}</PageLink><button className="text-link" onClick={clear}>Clear</button></div></aside>;
}
export function ComparePage({equipment}:{equipment:Equipment[]}){
 const {ids,toggle}=useComparison(); const selected=ids.map(id=>equipment.find(e=>e.id===id)).filter((e):e is Equipment=>!!e);
 const rows:[string,(e:Equipment)=>string][]=[['Daily rental',e=>e.rent?`${currency(e.rent)} / day`:'Not offered'],['Weekly rental',e=>e.rent?`${currency(e.weeklyRent||e.rent*6)} / 7 days`:'Not offered'],['Purchase price',e=>e.price?currency(e.price):'Not offered'],['Horsepower',e=>e.horsepower?`${e.horsepower} HP`:'Not specified'],['Operating hours',e=>`${e.hours.toLocaleString()} hours`],['Model year',e=>String(e.year)],['Condition',e=>e.condition],['Included attachments',e=>e.attachments||'Confirm with owner'],['Location',e=>`${e.city}, ${e.state}`],['Delivery',e=>e.deliveryAvailable===false?'Pickup only':e.deliveryAvailable?`${currency(e.deliveryFee??75)} delivery`:'Confirm availability and fee'],['PTO connection',e=>e.pto||'Confirm with owner'],['Hitch connection',e=>e.hitch||'Confirm with owner'],['Hydraulics',e=>e.hydraulics||'Confirm with owner'],['Transport dimensions',e=>e.transportDimensions||'Confirm with owner'],['Transport weight',e=>e.transportWeight||'Confirm with owner'],['Owner',e=>e.owner]];
 return <section className="workspace-page page-width"><div className="workspace-heading"><div><span className="eyebrow">FIND THE RIGHT FIT</span><h1>Compare your next workhorse.</h1><p>Check the details side by side before making a request.</p></div><PageLink className="button outline" page="marketplace">Add equipment</PageLink></div>{selected.length?<><p className="readable-note">Rental rates exclude deposits and delivery. Weekly rates are demo estimates unless configured by the owner. On small screens, swipe the table sideways.</p><div className="comparison-scroll" role="region" aria-label="Equipment specifications comparison" tabIndex={0}><table className="comparison-table"><caption className="visually-hidden">Compare {selected.length} equipment listings</caption><thead><tr><th scope="col">Equipment</th>{selected.map(e=><th key={e.id} scope="col"><Photo src={e.image} alt={e.title}/><PageLink page={`/equipment/${e.id}`}>{e.title}</PageLink><button onClick={()=>toggle(e.id)} className="text-link">Remove</button></th>)}</tr></thead><tbody>{rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th>{selected.map(e=><td key={e.id}>{value(e)}</td>)}</tr>)}</tbody></table></div></>:<div className="empty-state"><Columns3 size={36}/><h2>Choose equipment to compare.</h2><p>Use Compare on a listing card. You can select up to three machines.</p><PageLink className="button primary" page="marketplace">Explore equipment</PageLink></div>}</section>;
}
