import type { EquipmentRequest } from './marketplaceTypes';
export const rentalStages = ['requested','accepted','pickup','in-use','returned'] as const;
export function rentalStage(r:EquipmentRequest): string {
 if(r.status !== 'accepted') return r.status === 'pending' ? 'requested' : r.status;
 return r.stage || 'accepted';
}
export function nextRentalStage(r:EquipmentRequest): EquipmentRequest['stage'] | undefined {
 if(r.kind !== 'rent' || r.status !== 'accepted') return undefined;
 switch(r.stage){case undefined:return 'pickup';case 'pickup':return 'in-use';case 'in-use':return 'returned';default:return undefined;}
}
