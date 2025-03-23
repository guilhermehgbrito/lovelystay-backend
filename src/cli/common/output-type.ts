import { Option } from 'commander';
import { z } from 'zod';
const outputTypes = ['json', 'csv', 'table'] as const;
type OutputType = (typeof outputTypes)[number];

export const outputTypeSchema = z.enum(outputTypes).default('json');

export const outputTypeOption = new Option(
  '-t, --output-type <type>',
  'The type of output to use',
)
  .choices(outputTypes)
  .default('json')
  .argParser((value) => value?.toLowerCase());

export const printOutput = <T>(
  data: T,
  options: { outputType: OutputType },
) => {
  switch (options.outputType) {
    case 'json': {
      console.log(JSON.stringify(data, null, 2));
      break;
    }
    case 'csv': {
      const isArray = Array.isArray(data);
      const headers = Object.keys(isArray ? data[0] || {} : data || {});
      console.log(headers.join(','));
      for (const item of isArray ? data : [data]) {
        console.log(headers.map((header) => item[header]).join(','));
      }
      break;
    }
    case 'table': {
      console.table(data);
      break;
    }
    default: {
      throw new Error(`Invalid output type: ${options.outputType}`);
    }
  }
};
