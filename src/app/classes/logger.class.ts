import { Injectable } from '@angular/core';
import { LogImportance, LogLevel } from '../enums/shared.enums';

/**
 * Class for log Managemen
 *
 * @method `log()` Log something in the browser Console
 */
@Injectable({
  providedIn: 'root',
})
export class Logger {
  readonly logLevel: LogLevel;

  constructor(level: LogLevel) {
    this.logLevel = level;
  }

  /**
   * This function logs the provided message based on the importance
   *
   * @param caller Name of the function that want to log
   * @param message String with message to log
   * @param importance The importance of the message
   */
  public log(caller: string, message: string, importance: LogImportance): void {
    switch (importance) {
      case LogImportance.Normal: {
        if (this.logLevel === LogLevel.Verbose) {
          console.log(`[${caller}] ${message}`);
        }
        break;
      }
      case LogImportance.Warn: {
        console.warn(`[${caller}] ${message}`);
        break;
      }
      case LogImportance.Error: {
        console.error(`[${caller}] ${message}`);
      }
    }
  }
}
