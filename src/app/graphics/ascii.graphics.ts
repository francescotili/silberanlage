import { Injectable } from '@angular/core';
import { Bath } from '../classes/bath.class';
import { Crane } from '../classes/crane.class';

// Enums
import { CraneStatus } from '../enums/crane.enums';

@Injectable({
  providedIn: 'root',
})
export class AsciiGraphics {
  private renderedOutput: string;

  private readonly header = '<code>';
  private readonly footer = '</code>';

  private readonly graphics = {
    eol: '<br>',
    //whitespace: '&middot;',
    whitespace: '&nbsp;',
    bath: {
      label: 'Bad',
      top: '&#9487;&#9473;&#9473;&#9491;',
      middle: {
        fullFull: '&#9475;&#9608;&#9608;&#9475;',
        fullEmpty: '&#9475;[]&#9475;',
        empty: '&#9475;&nbsp;&nbsp;&#9475;',
        disabled: '&#9475;&#9587;&#9587;&#9475;',
      },
      bottom: '&#9507;&#9473&#9473;&#9515;',
    },
    id: {
      label: 'Nr.',
    },
    separator: ' | ',
    indicator: ' > ',
    crane: {
      label: 'Krane',
      top: '&nbsp;&nbsp;&#9582;',
      middle: {
        fullFull: '&#9608;&#9608;&#9566;',
        fullEmpty: '[]&#9566;',
        empty: '&nbsp;&nbsp;&#9566;',
      },
      bottom: '&nbsp;&nbsp;&#9583;',
    },
    time: {
      label: 'Zeit',
    },
    auftrag: {
      label: 'Auftrag',
    },
  };

  private readonly lengths = {
    white1: 2, // Initial whitespace
    bathName: 30, // Bath name placeholder
    sep1: 3, // Separator |
    bathID: 2, // Bath ID placeholder
    sep2: 3, // Separator >
    bathVis: 4, // Width of Bath visualization
    white2: 2, // Whitespace
    crane: 3, // Width of crane visualization
    white3: 5, // Whitespace
    time: 8, // Time visualization
    sep3: 3, // Separator
    auftrag: 8, // Auftrag visualization
    sep4: 3, // Separator
  };

  constructor() {
    this.renderedOutput = '';
  }

  updateView(baths: Bath[], crane: Crane): string {
    this.renderedOutput = '';

    this.renderedOutput += this.header;

    /* * * * * * *
     * HEADER
     * * * * * * */
    for (
      var i = 0;
      i <
      this.lengths.bathName -
        this.graphics.bath.label.length +
        this.lengths.white1;
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.bath.label;
    this.renderedOutput += this.graphics.separator;
    this.renderedOutput += this.graphics.id.label;
    for (
      var i = 0;
      i <
      this.lengths.sep2 +
        this.lengths.bathVis +
        this.lengths.white2 +
        (this.lengths.bathID - this.graphics.id.label.length);
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.crane.label;
    for (
      var i = 0;
      i <
      this.lengths.white3 +
        (this.lengths.crane - this.graphics.crane.label.length);
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.time.label;
    for (
      var i = 0;
      i < this.lengths.time - this.graphics.time.label.length;
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.auftrag.label;
    for (
      var i = 0;
      i < this.lengths.auftrag - this.graphics.auftrag.label.length;
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    for (var i = 0; i < this.lengths.sep4; i++) {
      this.renderedOutput += this.graphics.whitespace;
    }
    // End of line
    this.renderedOutput += this.graphics.eol;

    // FIRST BATH LINE
    for (
      var i = 0;
      i <
      this.lengths.white1 +
        this.lengths.bathName +
        this.lengths.sep1 +
        this.lengths.bathID +
        this.lengths.sep2;
      i++
    ) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.bath.top;
    // Whitespace
    for (var i = 0; i < this.lengths.white2; i++) {
      this.renderedOutput += this.graphics.whitespace;
    }
    // Crane
    if (crane.position === 1) {
      this.renderedOutput += this.graphics.crane.top;
      for (var i = 0; i < this.lengths.white3; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
    } else {
      for (var i = 0; i < this.lengths.crane + this.lengths.white3; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
    }
    for (var i = 0; i < this.lengths.time; i++) {
      this.renderedOutput += this.graphics.whitespace;
    }
    // Auftrag
    for (var i = 0; i < this.lengths.auftrag; i++) {
      this.renderedOutput += this.graphics.whitespace;
    }
    for (var i = 0; i < this.lengths.sep4; i++) {
      this.renderedOutput += this.graphics.whitespace;
    }
    this.renderedOutput += this.graphics.eol;

    // BATHS
    for (let bathID = 1; bathID < baths.length; bathID++) {
      /* * * * * * *
       * LINE 1/2
       * * * * * * */
      // Whitespace
      for (var i = 0; i < this.lengths.white1; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      // Name of the bath
      if (typeof baths[bathID].name !== 'undefined') {
        for (
          var i = 0;
          i < this.lengths.bathName - baths[bathID].name.length;
          i++
        ) {
          this.renderedOutput += this.graphics.whitespace;
        }
        this.renderedOutput += baths[bathID].name;
      } else {
        for (var i = 0; i < this.lengths.bathName; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      // Separator
      if (typeof baths[bathID].name !== 'undefined') {
        this.renderedOutput += this.graphics.separator;
      } else {
        for (var i = 0; i < this.lengths.sep1; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      // Bath number
      baths[bathID].id.toString().length == 1
        ? (this.renderedOutput += '0' + baths[bathID].id)
        : (this.renderedOutput += baths[bathID].id);
      // Indicator
      this.renderedOutput += this.graphics.indicator;
      // Bath status
      if (typeof baths[bathID].drum !== 'undefined') {
        if (typeof baths[bathID].drum.getAuftrag() !== 'undefined') {
          this.renderedOutput += this.graphics.bath.middle.fullFull;
        } else {
          this.renderedOutput += this.graphics.bath.middle.fullEmpty;
        }
      } else {
        if (baths[bathID].is_enabled === false) {
          this.renderedOutput += this.graphics.bath.middle.disabled;
        } else {
          this.renderedOutput += this.graphics.bath.middle.empty;
        }
      }
      // Whitespace
      for (var i = 0; i < this.lengths.white2; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      // Crane
      if (crane.position === bathID) {
        if (
          crane.getStatus() !== CraneStatus.Waiting &&
          typeof crane.drum !== 'undefined'
        ) {
          if (typeof crane.drum.getAuftrag() !== 'undefined') {
            this.renderedOutput += this.graphics.crane.middle.fullFull;
          } else {
            this.renderedOutput += this.graphics.crane.middle.fullEmpty;
          }
        } else {
          this.renderedOutput += this.graphics.crane.middle.empty;
        }
        for (var i = 0; i < this.lengths.white3; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      } else {
        for (var i = 0; i < this.lengths.crane + this.lengths.white3; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      // Time
      const timeRemaining = baths[bathID].getTime();
      if (typeof timeRemaining !== 'undefined') {
        this.renderedOutput += timeRemaining;
        for (
          var i = 0;
          i < this.lengths.time - timeRemaining.toString.length;
          i++
        ) {
          this.renderedOutput += this.graphics.whitespace;
        }
      } else {
        for (var i = 0; i < this.lengths.time; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      // Auftrag
      if (typeof baths[bathID].drum !== 'undefined') {
        if (typeof baths[bathID].drum.getAuftrag() !== 'undefined') {
          this.renderedOutput += baths[bathID].drum.getAuftrag().number;
          for (
            var i = 0;
            i <
            this.lengths.auftrag -
              baths[bathID].drum.getAuftrag().number.length;
            i++
          ) {
            this.renderedOutput += this.graphics.whitespace;
          }
        }
      } else {
        for (var i = 0; i < this.lengths.auftrag; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      for (var i = 0; i < this.lengths.sep4; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      this.renderedOutput += this.graphics.eol;
      /* * * * * * *
       * LINE 2/2
       * * * * * * */
      for (
        var i = 0;
        i <
        this.lengths.white1 +
          this.lengths.bathName +
          this.lengths.sep1 +
          this.lengths.bathID +
          this.lengths.sep2;
        i++
      ) {
        this.renderedOutput += this.graphics.whitespace;
      }
      // Bath
      this.renderedOutput += this.graphics.bath.bottom;
      // Whitespace
      for (var i = 0; i < this.lengths.white2; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      // Crane
      if (crane.position === bathID) {
        this.renderedOutput += this.graphics.crane.bottom;
        for (var i = 0; i < this.lengths.white3; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      } else if (crane.position === bathID + 1) {
        this.renderedOutput += this.graphics.crane.top;
        for (var i = 0; i < this.lengths.white3; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      } else {
        for (var i = 0; i < this.lengths.crane + this.lengths.white3; i++) {
          this.renderedOutput += this.graphics.whitespace;
        }
      }
      // Time
      for (var i = 0; i < this.lengths.time; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      // Auftrag
      for (var i = 0; i < this.lengths.auftrag; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      for (var i = 0; i < this.lengths.sep4; i++) {
        this.renderedOutput += this.graphics.whitespace;
      }
      this.renderedOutput += this.graphics.eol;
    }

    this.renderedOutput += this.footer;
    return this.renderedOutput;
  }
}
