import type { Equipment } from './data';
export function checkCompatibility(e:Equipment, power:number, pto:string, hitch:string){
 const issues:string[]=[],missing:string[]=[];
 if(e.minimumTractorHp){if(power<=0)missing.push('Enter your tractor horsepower.');else if(power<e.minimumTractorHp)issues.push(`At least ${e.minimumTractorHp} HP is required.`);}else missing.push('Minimum tractor power is not specified.');
 for(const [label,required,provided] of [['PTO',e.pto,pto],['Hitch',e.hitch,hitch]] as const) {
   if(!required)missing.push(`${label} requirement is not specified.`);
   else if(!provided?.trim())missing.push(`Enter your ${label.toLowerCase()} connection.`);
   else if(required.trim().toLowerCase()!==provided.trim().toLowerCase())issues.push(`${label} differs from the listed requirement: ${required}.`);
 }
 if(!e.hydraulics)missing.push('Hydraulic requirements need owner confirmation.');
 return {issues,missing};
}
