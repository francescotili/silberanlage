// Enums
import { Process } from '../enums/shared.enums';

// Interfaces
import { WorkTime } from './shared.interfaces';

/**
 * Interface to store the initial settings of the Auftrag
 */
export interface AuftragSettings {
  /** Number of the Auftrag (Auftragsnummer) */
  number: string;
  /** Material number */
  material: string;
  /** Type of process  */
  process: Process;
  /** Silber amount (Ag-Bedarf) in grams pro 1000 parts */
  silverAmount: number;
  /** Copper amout (Cu-Bedarf) in grams pro 1000 parts */
  copperAmount?: number;
  /** Parts quantity (Stückzahl) */
  quantity: number;
  /** Overrides over standard/calculated working times */
  workTimeOverride?: WorkTime[];
}
