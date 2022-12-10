/**
 * Describe the type of Bath
 */
export enum BathType {
  PreTreatment,
  Silver,
  Copper,
  RinseStand,
  RinseFlow,
  Parkplatz,
  LoadingStation,
}

/**
 * Describe the status of the Bath
 */
export enum BathStatus {
  /** Bath is empty */
  Free,
  /** Bath has an empty drum and it's waiting */
  WaitingEmpty,
  /** Bath has a full drum and it's waiting */
  WaitingFull,
  /** Bath has an empty drum and has already called the crane */
  WaitingCrane,
  /** Bath has a full drum and it's working */
  Working,
}
