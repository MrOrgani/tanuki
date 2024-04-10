export const toUrlQuery = (params: Record<string, unknown>) => {
  if (Object.keys(params).length === 0) {
    return '';
  }

  const query = Object.keys(params)
    .map(key => {
      if (Array.isArray(params[key])) {
        return (params[key] as string[])
          .map((subArrayValue: string) => `${key}=${subArrayValue}`)
          .join('&');
      }
      return `${key}=${params[key]}`;
    })
    .filter((value: string) => value)
    .join('&');

  return query;
};
