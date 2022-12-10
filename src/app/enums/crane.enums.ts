/**
 * Describe the status of the crane
 */
export enum CraneStatus {
  Waiting,
  Working,
}

/**
 * Describe the working phase of the crane
 */
export enum CraneWorkingPhase {
  Moving,
  Dropping,
  Picking,
  Draining,
}
