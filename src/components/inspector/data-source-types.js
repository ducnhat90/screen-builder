export const dataSources = [
  { value: 'provideData', text: 'Provide Values' },
  { value: 'dataObject', text: 'Request Data' },
  { value: 'dataConnector', text: 'Data Connector' },
  { value: 'external', text: 'External API' },
];

export const dataSourceValues = dataSources.reduce((values, source) => {
  values[source.value] = source.value;
  return values;
}, {});
