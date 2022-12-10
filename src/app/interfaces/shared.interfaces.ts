import { BathType } from '../enums/bath.enums';

/**
 * Interface to store working times for Baths
 */
export interface WorkTime {
  /** Type of Bath */
  bathType: BathType;
  time: number;
}

/**
 * Interface to store the simulation settings
 */
export interface SimulationSettings {
  speed: number;
  maxTime: number;
  sampleTime: number;
}
