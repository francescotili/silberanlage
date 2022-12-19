import { Injectable } from '@angular/core';
import { Auftrag } from './auftrag.class';
import { Bath } from './bath.class';
import { Crane } from './crane.class';
import { Logger } from './logger.class';
import { Drum } from './drum.class';
import { defaultCraneTimes, simulationSettings } from '../settings';

// Interfaces
import { AuftragSettings } from '../interfaces/auftrag.interfaces';
import { BathSettings } from '../interfaces/baht.interfaces';
import { CraneOperation } from '../interfaces/crane.interfaces';
import { DrumSettings } from '../interfaces/drum.interfaces';

// Enum
import { BathStatus, BathType } from '../enums/bath.enums';
import { AuftragStatus } from '../enums/auftrag.enums';
import { CraneStatus, CraneWorkingPhase } from '../enums/crane.enums';
import { LogImportance, Process, Scheduler } from '../enums/shared.enums';

@Injectable({
  providedIn: 'root',
})
export class Plant {
  name: string;
  baths: Bath[];
  crane: Crane;
  auftrags: Auftrag[];
  drums: Drum[];
  completedAuftrags: Auftrag[];
  simulationTime: number;
  private bathsWaiting: number[];
  private logger: Logger;

  /**
   * This function initialize the plant
   * It loads the bath settings and create all the baths as specified
   *
   * @param name A string for the name of the plant
   * @param bathsInitData A BathSettings object that specifies how to initialize the baths
   * @param drumsInitData A DrumSettings object that specifies how to initialize the drums
   * @param auftragsData An AuftragSettings object that list the Auftrags to load
   */
  constructor(
    name: string,
    bathsInitData: BathSettings[],
    drumsInitData: DrumSettings[],
    auftragsData: AuftragSettings[]
  ) {
    this.name = name;
    this.logger = new Logger();
    this.completedAuftrags = [];
    this.simulationTime = 0;

    this.initializeBaths(bathsInitData);
    this.initializeCrane();
    this.initializeDrums(drumsInitData);
    this.loadAuftrags(auftragsData);
  }

  /**
   * This function initialize baths with the provided initDatas
   *
   * @param bathsInitData Object with all the setting for the bath initialization
   */
  private initializeBaths(bathsInitData: BathSettings[]): void {
    this.baths = [];
    for (var index in bathsInitData) {
      this.baths.push(new Bath(+index, bathsInitData[index]));
    }
    this.bathsWaiting = [];
    this.logger.log('Plant:constructor', 'Baths created', LogImportance.Normal);
  }

  /**
   * This function initialize the crane
   */
  private initializeCrane(): void {
    this.crane = new Crane();
    this.logger.log(
      'Plant:constructor',
      'Crane initialized',
      LogImportance.Normal
    );
  }

  /**
   * This function initialize the drums with the provided initDatas
   *
   * @param drumsInitData Object with all the settings for the drums initialization
   */
  private initializeDrums(drumsInitData: DrumSettings[]): void {
    this.drums = [];
    for (var index in drumsInitData) {
      this.drums.push(new Drum(drumsInitData[index].number));
    }
    for (var index in this.drums) {
      let destinationBath: number | undefined;
      destinationBath = this.searchBathForDrum();
      if (typeof destinationBath !== 'undefined') {
        this.assignDrum(this.baths[destinationBath], this.drums[index]);
      }
    }
    this.logger.log('Plant:constructor', 'Drum assigned', LogImportance.Normal);
  }

  /**
   * This function loads the Auftrags to workout
   *
   * @param auftragsData Auftrag data to load
   */
  private loadAuftrags(auftragsData: AuftragSettings[]): void {
    this.auftrags = [];
    auftragsData.forEach((auftrag) => {
      this.auftrags.push(new Auftrag(auftrag));
    });
    this.logger.log(
      'Plant:constructor',
      'Aufträge loaded',
      LogImportance.Normal
    );
  }

  /**
   * This function search a free bath for assigning a new empty drum
   * It will follow this prioritization: LoadingStation, Rinseflow, Parkplatz
   * If no bath are found, there are no places to assign new Drums
   *
   * @returns the bath acceptable for the Drum
   */
  private searchBathForDrum(): number | undefined {
    for (let i = 0; i < this.baths.length; i++) {
      if (
        this.baths[i].type === BathType.LoadingStation &&
        typeof this.baths[i].drum === 'undefined'
      ) {
        return i;
      }
    }
    for (let i = 0; i < this.baths.length; i++) {
      if (
        this.baths[i].type === BathType.RinseFlow &&
        typeof this.baths[i].drum === 'undefined'
      ) {
        return i;
      }
    }
    for (let i = 0; i < this.baths.length; i++) {
      if (
        this.baths[i].type === BathType.Parkplatz &&
        typeof this.baths[i].drum === 'undefined'
      ) {
        return i;
      }
    }
    return undefined;
  }

  /**
   * This function assign the specified Drum to the specified Bath
   *
   * @param bath The Bath object to which assign the Drum
   * @param drum The Drum object to assign
   */
  private assignDrum(bath: Bath, drum: Drum): void {
    this.logger.log(
      'Plant:assignDrum',
      `Drum ${drum.number} assigned to Bath ${bath.id}`,
      LogImportance.Normal
    );
    bath.drum = drum;
    bath.setStatus(BathStatus.WaitingEmpty);
  }

  /**
   * This is the main function that updates all the baths
   * It is called by the simulation, every `sampleTime` seconds
   *
   * @param sampleTime The sample time of the simulation
   */
  public updateBaths(sampleTime: number): void {
    // Update simulation time
    this.simulationTime += sampleTime;

    this.baths.forEach((bath) => {
      switch (bath.getStatus()) {
        case BathStatus.Working: {
          // Bath is Working with a full Drum, update time
          bath.updateTime(sampleTime);

          // If time has reached 0, set the bath to WaitingFull and call the Crane
          if (bath.getTime() <= 0) {
            bath.setStatus(BathStatus.WaitingFull);
            this.appendOperation(bath.id);
          }
          break;
        }

        case BathStatus.WaitingEmpty: {
          // Bath is Waiting with an empty Drum
          bath.updateTime(sampleTime);

          if (bath.getTime() <= 0 && typeof bath.drum !== 'undefined') {
            switch (bath.type) {
              case BathType.LoadingStation: {
                // The bath is a LoadingStation that has en empty Drum, load a new Auftrag
                if (this.auftrags.length > 0) {
                  this.auftrags[0].setStatus(AuftragStatus.Loading);
                  bath.drum.loadParts(this.auftrags[0]);
                  bath.setStatus(BathStatus.Working);
                  this.auftrags.splice(0, 1); // Remove auftrag from the waiting list
                }
                break;
              }
              default: {
                // The bath is not a LoadingStation, but has an empty drum
                // We can append operation to Crane, so maybe we can move
                // the empty drum forward toward the loadingStation
                this.appendOperation(bath.id);
                bath.setStatus(BathStatus.WaitingCrane);
                break;
              }
            }
          }
          break;
        }

        case BathStatus.WaitingToUnload: {
          // Bath is unloading with a full Drum, update time
          bath.updateTime(sampleTime);

          // Unloading completed, reset the drum and Auftrag
          if (bath.type === BathType.LoadingStation && bath.getTime() <= 0) {
            this.completeAuftrag(bath.id);
          }
          break;
        }

        case BathStatus.WaitingFull:
        case BathStatus.WaitingCrane:
        case BathStatus.Free:
        default: {
          break;
        }
      }
    });
  }

  /**
   * This functions append a new bath to the waiting list for the crane
   *
   * @param bathId The bath number to append to the waiting list
   */
  private appendOperation(bathId: number) {
    this.bathsWaiting.push(bathId);
    this.logger.log(
      'Plant:appendOperation',
      `Bath ${bathId} has called the crane`,
      LogImportance.Normal
    );
  }

  /** This function unload the parts from the bath
   *
   * @param bathId The bath number where the full drum is waiting to be unloaded
   */
  private completeAuftrag(bathId: number) {
    if (this.baths[bathId].type !== BathType.LoadingStation) {
      this.logger.log(
        'Plant:completeAuftrag',
        `You are trying to unload parts from Bath ${bathId}, but it is not a LoadingStation`,
        LogImportance.Warn
      );
      return;
    }
    if (typeof this.baths[bathId].drum === 'undefined') {
      this.logger.log(
        'Plant:completeAuftrag',
        `You are trying to unload parts from Bath ${bathId}, but it has no drums!`,
        LogImportance.Error
      );
      return;
    }
    if (typeof this.baths[bathId].drum.getAuftrag() === 'undefined') {
      this.logger.log(
        'Plant:completeAuftrag',
        `You are trying to unload parts from Bath ${bathId}, but the drum is not full!`,
        LogImportance.Error
      );
      return;
    }

    this.completedAuftrags.push(this.baths[bathId].drum.getAuftrag());
    console.log(
      '%cAUFTRAG COMPLETED',
      'background-color:green; color:white; padding:8px;border-radius:8px;',
      this.baths[bathId].drum.getAuftrag().number
    );
    this.baths[bathId].drum.unloadParts();
    this.baths[bathId].setStatus(BathStatus.WaitingEmpty);
  }

  /**
   * This function transfer the Drum between the Bath and the Crane
   */
  private transferDrum(): void {
    if (typeof this.baths[this.crane.position].drum !== 'undefined') {
      // Transfer Drum: Bath -> Crane
      this.logger.log(
        'Plant:updateCrane',
        `Drum ${this.baths[this.crane.position].drum.number} transfer: Bath ${
          this.crane.position
        } -> Crane`,
        LogImportance.Normal
      );
      this.crane.drum = this.baths[this.crane.position].drum;
      this.baths[this.crane.position].setStatus(BathStatus.Free);
      if (typeof this.crane.drum.getAuftrag() !== 'undefined') {
        // The Drum transferred is full, update the Auftrag
        this.auftrags.forEach((auftrag) => {
          if (auftrag.number === this.crane.drum.getAuftrag().number) {
            auftrag.setStatus(AuftragStatus.Moving);
          }
        });
      }
    } else if (typeof this.crane.drum !== 'undefined') {
      // Transfer Drum: Crane -> Bath
      this.logger.log(
        'Plant:updateCrane',
        `Drum ${this.crane.drum.number} transfer: Crane -> Bath`,
        LogImportance.Normal
      );
      if (typeof this.crane.drum.getAuftrag() !== 'undefined') {
        // The drum is full
        if (this.baths[this.crane.position].type === BathType.LoadingStation) {
          // We are dropping a full drum to the loading station, it needs to be unloaded
          this.baths[this.crane.position].setStatus(
            BathStatus.WaitingToUnload,
            this.crane.drum
          );
          this.auftrags.forEach((auftrag) => {
            if (
              auftrag.number ===
              this.baths[this.crane.position].drum.getAuftrag().number
            ) {
              auftrag.setStatus(AuftragStatus.Completed);
            }
          });
        } else {
          // We are dropping a full drum to a working bath
          this.baths[this.crane.position].setStatus(
            BathStatus.Working,
            this.crane.drum
          );
          this.auftrags.forEach((auftrag) => {
            if (
              auftrag.number ===
              this.baths[this.crane.position].drum.getAuftrag().number
            ) {
              auftrag.setStatus(AuftragStatus.Working);
            }
          });
        }

        this.crane.drum = undefined;
      } else {
        // The drum is empty
        this.baths[this.crane.position].setStatus(
          BathStatus.WaitingEmpty,
          this.crane.drum
        );
        this.crane.drum = undefined;
      }
    }
  }

  /**
   * This function updates the Crane
   *
   * @param sampleTime The sample time of the simulation
   */
  public updateCrane(sampleTime: number) {
    switch (this.crane.getStatus()) {
      case CraneStatus.Working: {
        this.crane.updateTime(sampleTime);

        if (this.crane.remainingTime <= 0) {
          if (this.crane.phases[0].transferDrum) {
            this.transferDrum();
          }
          if (typeof this.crane.currentPhase !== 'undefined') {
            // Crane already in an operation, move to next phase
            this.crane.nextPhase();
          } else {
            // Do nothing, at the next cycle the Cran will be in the Waiting status
          }
        }
        break;
      }
      case CraneStatus.Waiting: {
        if (this.bathsWaiting.length > 0) {
          switch (simulationSettings.scheduler) {
            case Scheduler.FCFS: {
              this.scheduleFCFS();
              break;
            }
            default: {
              this.logger.log(
                'Plant:scheduleOperation',
                'Unhandled Scheduler specified!',
                LogImportance.Error
              );
              break;
            }
          }
        }
        break;
      }
    }
  }

  /**
   * This is the FCFS Scheduler, First Come First Serve
   * The Crane will serve the oldest operation in the list, if it is possibile
   * to do it. FIFO Logic.
   *
   * Basically scans the baths waiting and decide which operation to send at the crane
   * to do
   */
  private scheduleFCFS(): void {
    let originBath: Bath;
    let destinationBath: Bath;

    // Find a free destination bath
    for (let i = 0; i < this.bathsWaiting.length; i++) {
      // Determine origin and destination bath
      originBath = this.baths[this.bathsWaiting[i]];
      destinationBath = this.findDestinationBath(originBath);

      if (typeof destinationBath !== 'undefined') {
        // Found a destination bath that is free

        let phases: CraneOperation[] = [];

        // Push time to move from current crane position to origin position
        let tempTime = this.crane.calculateMovingTime(
          this.crane.position - originBath.id
        );
        if (tempTime > 0) {
          phases.push({
            origin: this.crane.position,
            destination: originBath.id,
            phase: CraneWorkingPhase.Moving,
            time: tempTime,
            transferDrum: false,
          });
        }

        // Push time to drain
        if (typeof originBath.drainTime !== 'undefined') {
          phases.push({
            origin: originBath.id,
            phase: CraneWorkingPhase.Draining,
            time: originBath.drainTime,
            transferDrum: true,
          });
        } else {
          phases.push({
            origin: originBath.id,
            phase: CraneWorkingPhase.Draining,
            time: defaultCraneTimes.drain,
            transferDrum: true,
          });
        }

        // Push time to pickup
        phases.push({
          origin: originBath.id,
          phase: CraneWorkingPhase.Picking,
          time: defaultCraneTimes.pick,
          transferDrum: false,
        });

        // Push time to move from origin to destination position
        tempTime = this.crane.calculateMovingTime(
          originBath.id - destinationBath.id
        );
        if (tempTime > 0) {
          phases.push({
            origin: originBath.id,
            destination: destinationBath.id,
            phase: CraneWorkingPhase.Moving,
            time: tempTime,
            transferDrum: false,
          });
        }

        // Push time to drop
        phases.push({
          origin: destinationBath.id,
          phase: CraneWorkingPhase.Dropping,
          time: defaultCraneTimes.drop,
          transferDrum: true,
        });

        // Send operation to crane
        this.logger.log(
          'Plant:updateCrane',
          'The crane starts a new operation',
          LogImportance.Normal
        );
        this.crane.setStatus(CraneStatus.Working, phases);
        this.bathsWaiting.splice(i, 1);
        break;
      }
    }
  }

  /**
   * This function finds a suitable destination bath for the specified origin bath
   * based on the process type and status of the next baths
   *
   * @param originBath The origin Bath object for the search
   * @returns The destination Bath object, if found
   */
  private findDestinationBath(originBath: Bath): Bath | undefined {
    let nextBaths: number[] = [];
    let process: Process;

    // Find the process
    if (typeof originBath.drum !== 'undefined') {
      if (typeof originBath.drum.getAuftrag() !== 'undefined') {
        process = originBath.drum.getAuftrag().process;
      } else {
        // Drum is empty
        process = Process.PlantFilling;
      }
    }

    // Scan all the way we can go from this bath and select only the ones we can do
    // based on the process type
    originBath.next.forEach((way) => {
      way.process.forEach((wayProcess) => {
        if (wayProcess === process) {
          way.baths.forEach((bath) => nextBaths.push(bath));
        }
      });
    });

    // Now found the first bath that´s free and return that
    for (let i = 0; i < nextBaths.length; i++) {
      if (this.baths[nextBaths[i]].getStatus() === BathStatus.Free) {
        return this.baths[nextBaths[i]];
      }
    }
    return undefined;
  }
}
