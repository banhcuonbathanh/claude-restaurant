import { describe, expect, it } from 'vitest'
import { formatVND, formatPercent } from '@/lib/utils'

describe('utils', () => {
  it('TestFormatVND', () => {
    const result = formatVND(50000)
    expect(result).toContain('50.000')
    expect(result).toContain('₫')
  })

  it('TestFormatPercent', () => {
    expect(formatPercent(12.5)).toBe('12,5%')
    expect(formatPercent(100)).toBe('100,0%')
    expect(formatPercent(0)).toBe('0,0%')
  })
})
