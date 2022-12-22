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

/**
 * Interface for the advanced bath waiting list
 */
export interface BathOperation {
  /** Origin of the operation */
  origin: number;
  /** Destination of the operation */
  destination: number;
  /** Time remaining until the operation can be executed */
  timeToGo: number;
  /** If the destination bath is free or not - evaluate if this is needed */
  pathBlocked: boolean;
  /** Priority of the operation */
  priority: Priority;
}
