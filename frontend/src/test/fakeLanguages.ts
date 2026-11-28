// Made-up languages for tests, so no test depends on real language data.
import type { Language } from '../api/client'

export const EXAMPLISH: Language = {
  code: 'xx',
  name: 'Examplish',
  native_name: 'Exemplar',
  level_system: 'TEST',
  levels: [
    { code: 'L1', rank: 1 },
    { code: 'L2', rank: 2 },
  ],
}

export const SAMPLESE: Language = {
  code: 'yy',
  name: 'Samplese',
  native_name: 'Samplo',
  level_system: 'TEST',
  levels: [{ code: 'S1', rank: 1 }],
}
