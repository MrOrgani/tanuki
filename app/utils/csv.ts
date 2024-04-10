export interface CsvHeader {
  label: string;
  property: string;
}

/**
 * Convert an array containing objects to a CSV content string formatted
 *
 * @param {object[]} data - Array to be formatted
 * @param {CsvHeader[]} headers - Array of headers that will determine the row's label and order, default is []. \
 * the 'label' property can be linked to a nested property with the 'property' property, ex: "propertyA.childOfPropertyA.grandchildOfPropertyA" \
 * If empty, the headers will be generated from the objects properties instead
 * @param {string} delimiter - Custom delimiter, default is ";"
 * @returns {string} a CSV content
 */
export const toCsv = <T extends object>(
  data: T[],
  headers: CsvHeader[] = [],
  delimiter = ';'
): string => {
  const csvHeaders = headers.length ? headers : generateCsvHeaders<T>(data);
  const rows = data.map(row =>
    csvHeaders
      .map(header => {
        let value: object | string = row;
        // retrieve nested properties if exist in the heeaders
        for (const key of header.property.split('.') as (keyof typeof value)[]) {
          if (!value[key]) return '';
          value = value[key];
        }

        return Object(value) === value ? JSON.stringify(value) : value;
      })
      .join(delimiter)
  );

  return [csvHeaders.map(header => header.label).join(delimiter), ...rows].join('\n');
};

/**
 * Generate a list of header from an array objects. \
 * The largest object in the dataset will have its properties returned
 *
 * @param {object[]} data - Array to parse from
 * @returns {CsvHeader[]} CSV headers
 */
export const generateCsvHeaders = <T extends object>(data: T[]): CsvHeader[] => {
  return data.reduce((acc, row) => {
    const properties = Object.keys(row);
    return properties.length > acc.length
      ? properties.map(property => ({
          label: property,
          property,
        }))
      : acc;
  }, [] as CsvHeader[]);
};
