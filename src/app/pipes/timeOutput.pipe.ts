import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convert the time in seconds to a readable strings in hours:minutes:seconds
 */
@Pipe({ name: 'timeOutput' })
export class TimeOutputPipe implements PipeTransform {
  transform(seconds: number): string {
    const view_hours: number = Math.floor(seconds / 3600);
    const view_minutes: number = Math.floor((seconds / 3600 - view_hours) * 60);
    const view_seconds: number = Math.floor(
      ((seconds / 3600 - view_hours) * 60 - view_minutes) * 60
    );

    let output = '';

    view_hours < 10 ? (output += '0' + view_hours) : (output += view_hours);
    output += ':';
    view_minutes < 10
      ? (output += '0' + view_minutes)
      : (output += view_minutes);
    output += ':';
    view_seconds < 10
      ? (output += '0' + view_seconds)
      : (output += view_seconds);

    return output;
  }
}
