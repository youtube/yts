import {parseXml} from './xml';

describe('parseXml', () => {
  it('should parse valid XML', async () => {
    const xml = '<root><element>value</element></root>';
    const result = await parseXml(xml);
    expect(result).toEqual({root: {element: ['value']}});
  });

  it('should reject invalid XML', async () => {
    const xml = '<root><element>value</element>';  // missing closing tag
    await expectAsync(parseXml(xml)).toBeRejected();
  });
});
