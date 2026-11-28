// Addresses inside Grammar mode. Lessons and tests are built in specs 007 and 008.

export const grammarPath = '/grammar'

export function lessonPath(topicId: string): string {
  return `${grammarPath}/topics/${encodeURIComponent(topicId)}/lesson`
}

export function topicTestPath(topicId: string): string {
  return `${grammarPath}/topics/${encodeURIComponent(topicId)}/test`
}

/** A combination test over several topics. Commas stay readable in the address. */
export function comboTestPath(topicIds: string[]): string {
  return `${grammarPath}/test?topics=${topicIds.map(encodeURIComponent).join(',')}`
}
