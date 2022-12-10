import { BathType } from '../enums/bath.enums';
import { Priority, Process } from '../enums/shared.enums';

/**
 * Interface to store the initial settings of the Bath
 */
export interface BathSettings {
  /** The name of the Bath */
  name?: string;
  /** Is the bath enabled? */
  is_enabled: boolean;
  /** Type of the bath */
  type?: BathType;
  /** Which priority has the bath */
  priority?: Priority;
  /** Override standard drain times for this bath */
  drainTime?: number;
  /** Next baths depending on the Process */
  next?: {
    process: Process[];
    baths: number[];
  }[];
}


