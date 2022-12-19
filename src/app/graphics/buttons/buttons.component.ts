import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'simulation-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css'],
})
export class SimulationButtonsComponent {
  @Input() viewBtn: {
    start: boolean;
    pause: boolean;
    reset: boolean;
    resume: boolean;
  };
  @Input() time: number;
  @Input() craneDistance: number;
  @Output() clickStart = new EventEmitter<string>();
  @Output() clickPause = new EventEmitter<string>();
  @Output() clickResume = new EventEmitter<string>();
  @Output() clickReset = new EventEmitter<string>();

  simulationStart() {
    this.clickStart.emit();
  }

  simulationPause() {
    this.clickPause.emit();
  }

  simulationResume() {
    this.clickResume.emit();
  }

  simulationReset() {
    this.clickReset.emit();
  }
}
