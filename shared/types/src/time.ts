// prettier-ignore
type Hour =
	| '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09'
	| '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19'
	| '20' | '21' | '22' | '23';

type MinuteTens = '0' | '1' | '2' | '3' | '4' | '5';
type MinuteOnes = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Minute = `${MinuteTens}${MinuteOnes}`;

export type Time = `${Hour}:${Minute}`;
