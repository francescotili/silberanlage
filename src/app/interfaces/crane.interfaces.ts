import { CraneWorkingPhase } from '../enums/crane.enums';

/**
 * Interface for the operation phases of the crane
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
 *
 */
