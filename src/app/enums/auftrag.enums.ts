/**
 * Enum for describing the state of an Auftrag
 */
export enum AuftragStatus {
  /** The Auftrag is waiting to be started */
  Queue,
  /** The Auftrag is in the loading phase */
  Loading,
  /** The Auftrag is moving with the Crane */
  Moving,
  /** The Auftrag is in a bath, working */
  Working,
  /** The Auftrag is waiting */
  Waiting,
  /** The Auftrag is unloading */
  Unloading,
  /** The Auftrag is completed */
  Completed,
}
