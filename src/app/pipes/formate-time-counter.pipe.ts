import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'formatTimeCounter',
})
export class formatTimeCounterPipe implements PipeTransform {
    constructor(){}
    transform(value: number): string {
        var secText = 'sec'
        var minText = 'Min'
        const minutes: number = Math.floor(value / 60);
        if (value > 0) {
            if (value <= 60) {
                return (
                    value + " "+ secText
                );
            } else {
                return (
                    minutes +
                    " "+minText+" " +
                    (Math.floor(value - minutes * 60)) + " "+ secText
                );
            }
        } else {
            return '0';
        }
    }
}