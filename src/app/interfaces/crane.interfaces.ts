import { Bath } from '../classes/bath.class';
import { CraneWorkingPhase } from '../enums/crane.enums';

/**
 * Interface for the operational phases of the crane
 */
export interface CranePhase {
  origin: number;
  destination?: number;
  time: number;
  phase: CraneWorkingPhase;
  transferDrum: boolean;
  // priority: Priority
}

/**
 * Interface for an operation the crane needs to do
 */
export interface CraneOperation {
  origin: Bath;
  destination: Bath;
}
