import type { GrammarTopic } from '../../api/client'

/** The progress line under a topic, built from the API's numbers (spec 006). */
export function progressLine(topic: Pick<GrammarTopic, 'times_learned' | 'best_score'>): string {
  if (topic.times_learned === 0) return 'Not started'
  const learned = `Learned ${topic.times_learned}×`
  if (!topic.best_score) return `${learned} · no test yet`
  return `${learned} · best test ${topic.best_score.correct}/${topic.best_score.total}`
}
