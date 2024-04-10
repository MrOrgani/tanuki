import { CsvHeader, generateCsvHeaders, toCsv } from 'utils/csv';

describe('CSV util functions', () => {
  describe('toCsv function', () => {
    it('should return a csv content with pre-defined column headers', () => {
      const headers: CsvHeader[] = [
        { label: 'Lastname', property: 'lastName' },
        { label: 'Firstname', property: 'firstName' },
        { label: 'Age', property: 'age' },
      ];
      const data = [
        { lastName: 'Doe', firstName: 'John', age: 42 },
        { lastName: 'Doe', firstName: 'Jane', age: 42 },
      ];

      expect(toCsv<{ lastName: string; firstName: string }>(data, headers)).toEqual(
        `Lastname;Firstname;Age
Doe;John;42
Doe;Jane;42`
      );
    });
    it('should return a csv content with automatic column headers', () => {
      const data = [
        { lastName: 'Doe', firstName: 'John', age: 42 },
        { lastName: 'Doe', firstName: 'Jane', age: 42 },
      ];

      expect(toCsv<{ lastName: string; firstName: string }>(data)).toEqual(
        `lastName;firstName;age
Doe;John;42
Doe;Jane;42`
      );
    });
    it('should have a consistent row count depending on data size', () => {
      const data = [
        { lastName: 'Doe', firstName: 'John', age: 42 },
        { lastName: 'Doe', firstName: 'Jane', age: 42 },
      ];

      const res = toCsv<{ lastName: string; firstName: string }>(data);
      expect(res.split('\n').length).toEqual(data.length + 1); // +1 for the header
    });
    it('should contain a json string when a row value contains an object property', () => {
      const data = [
        {
          lastName: 'Doe',
          firstName: 'John',
          age: 42,
          address: { street: '1st street', city: 'New York' },
        },
        {
          lastName: 'Doe',
          firstName: 'Jane',
          age: 42,
          address: { street: '2nd street', city: 'New York' },
        },
      ];

      expect(
        toCsv<{ lastName: string; firstName: string; address: { street: string; city: string } }>(
          data
        )
      ).toContain(JSON.stringify(data[0].address));
      expect(
        toCsv<{ lastName: string; firstName: string; address: { street: string; city: string } }>(
          data
        )
      ).toContain(JSON.stringify(data[1].address));
    });
    it('should retrieve subproperties value when specified in the custom headers', () => {
      const data = [
        {
          lastName: 'Doe',
          firstName: 'John',
          age: 42,
          address: { street: '1st street', city: 'New York' },
        },
        {
          lastName: 'Doe',
          firstName: 'Jane',
          age: 42,
          address: { street: '2nd street', city: 'New York' },
        },
      ];

      const headers: CsvHeader[] = [
        { label: 'Firstname', property: 'firstName' },
        { label: 'City', property: 'address.city' },
      ];

      expect(
        toCsv<{ lastName: string; firstName: string; address: { street: string; city: string } }>(
          data,
          headers
        )
      ).toEqual(
        `Firstname;City
John;New York
Jane;New York`
      );
    });
  });

  describe('generateCsvHeaders function', () => {
    it("should generate a list of header according to one's object properties", () => {
      const data = [
        { lastName: 'Doe', firstName: 'John', age: 42 },
        { lastName: 'Doe', firstName: 'Jane', age: 42 },
      ];

      expect(generateCsvHeaders(data)).toEqual([
        { label: 'lastName', property: 'lastName' },
        { label: 'firstName', property: 'firstName' },
        { label: 'age', property: 'age' },
      ]);
    });
    it('should generate a list of header selecting the largest object in the given list', () => {
      const data = [
        { lastName: 'Doe', firstName: 'John' },
        {
          lastName: 'Doe',
          firstName: 'Jane',
          age: 42,
          address: { street: '2nd street', city: 'New York' },
        },
        { lastName: 'Doe', firstName: 'John', age: 42 },
      ];

      expect(generateCsvHeaders(data)).toEqual([
        { label: 'lastName', property: 'lastName' },
        { label: 'firstName', property: 'firstName' },
        { label: 'age', property: 'age' },
        { label: 'address', property: 'address' },
      ]);
    });
  });
});
