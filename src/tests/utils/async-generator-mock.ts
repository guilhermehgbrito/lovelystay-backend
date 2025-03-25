export async function* asyncGeneratorMock<T>(data: T[]) {
  for (const item of data) {
    yield item;
  }
}
