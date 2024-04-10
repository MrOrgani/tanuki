export interface DateInterval {
  start: Date;
  end: Date;
}

export interface PeriodOption {
  key: string;
  label: string;
  range: DateInterval;
  selected?: boolean;
}
