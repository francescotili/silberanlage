import { Injectable } from '@angular/core';
import { Auftrag } from './auftrag.class';
import { Bath } from './bath.class';
import { Crane } from './crane.class';
import { Drum } from './drum.class';
import { defaultCraneTimes } from '../settings';

// Interfaces
import { AuftragSettings } from '../interfaces/auftrag.interfaces';
import { BathSettings } from '../interfaces/baht.interfaces';
import { CraneOperation } from '../interfaces/crane.interfaces';
import { DrumSettings } from '../interfaces/drum.interfaces';

// Enum
import { BathStatus, BathType } from '../enums/bath.enums';
import { AuftragStatus } from '../enums/auftrag.enums';
import { CraneStatus, CraneWorkingPhase } from '../enums/crane.enums';
import { Process, Scheduler } from '../enums/shared.enums';

@Injectable({
  providedIn: 'root',
})
export class Plant {
  name: string;
  baths: Bath[];
  crane: Crane;
  auftrags: Auftrag[];
  drums: Drum[];
  private bathsWaiting: number[];

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

    // Initialize baths
    this.initializeBaths(bathsInitData);

    // Initialize Crane
    this.crane = new Crane();
    console.log('[Plant:constructor] Crane initialized');

    // Intialize Drums
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
    console.log('[Plant:constructor] Drum assigned');

    // Load Auftrags
    this.auftrags = [];
    auftragsData.forEach((auftrag) => {
      this.auftrags.push(new Auftrag(auftrag));
    });
    console.log('[Plant:constructor] Aufträge loaded');
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
    console.log('[Plant:constructor] Baths created');
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
    console.log(
      `[Plant:assignDrum] Drum ${drum.number} assigned to Bath ${bath.id}`
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
                // The bath is not a LoadingStation, then append operation to Crane
                // maybe we can move the empty drum forward toward the loadingStation
                this.appendOperation(bath.id);
                bath.setStatus(BathStatus.WaitingCrane);
                break;
              }
            }
          }
        }

        case BathStatus.WaitingCrane:
        case BathStatus.WaitingFull:
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
    console.log(`[Plant:appendOperation] Bath ${bathId} has called the crane`);
  }

  /**
   * This function transfer the Drum between the Bath and the Crane
   */
  private transferDrum(): void {
    if (typeof this.baths[this.crane.position].drum !== 'undefined') {
      // Transfer Drum: Bath -> Crane
      console.log(
        `[Plant:updateCrane] Drum ${
          this.baths[this.crane.position].drum.number
        } transfer: Bath ${this.crane.position} -> Crane`
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
      console.log(
        `[Plant:updateCrane] Drum ${this.crane.drum.number} transfer: Crane -> Bath`
      );
      if (typeof this.crane.drum.getAuftrag() !== 'undefined') {
        // The drum is full
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
          this.scheduleOperation(Scheduler.FCFS);
        }
        break;
      }
    }
  }

  /**
   * This is the main scheduler, to know which operation the crane
   * must execute. Based on the passed scheduler type, it chooses
   * which will be the operation and calculates the phases.
   *
   * @param scheduler Scheduler to use
   */
  private scheduleOperation(scheduler: Scheduler): void {
    switch (scheduler) {
      case Scheduler.FCFS: {
        // FIFS First In First Served Logic

        // Find a free destination bath
        let originBath: Bath;
        let destinationBath: Bath;
        for (let i = 0; i < this.bathsWaiting.length; i++) {
          // Determine origin and destination bath
          originBath = this.baths[this.bathsWaiting[i]];
          destinationBath = this.findDestinationBath(originBath);
          if (typeof destinationBath !== 'undefined') {
            // Found a destination bath that is free

            // Initialize operation's phases data
            let phases: CraneOperation[] = [];

            // Time to move from current crane position to origin position
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

            // Time to drain
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

            // Time to pickup
            phases.push({
              origin: originBath.id,
              phase: CraneWorkingPhase.Picking,
              time: defaultCraneTimes.pick,
              transferDrum: false,
            });

            // Time to move from origin to destination position
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

            // Time to drop
            phases.push({
              origin: destinationBath.id,
              phase: CraneWorkingPhase.Dropping,
              time: defaultCraneTimes.drop,
              transferDrum: true,
            });

            // Send operation to crane
            console.log(`[Plant:updateCrane] The crane starts a new operation`);
            this.crane.setStatus(CraneStatus.Working, phases);
            this.bathsWaiting.splice(i, 1);
            break;
          }
        }
        break;
      }
      default: {
        console.error(
          `[Plant:scheduleOperation] Unhandled Scheduler specified!`
        );
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
