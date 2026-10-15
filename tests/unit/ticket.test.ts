import { beforeAll, describe, expect, it } from 'vitest'

const TENANT_A = '11111111-1111-4111-8111-111111111111'
const TENANT_B = '22222222-2222-4222-8222-222222222222'
const REG = '7019108f-fa1f-4fc4-b93a-0d5cacb82ac5'

let ticketCode: typeof import('../../server/utils/registration').ticketCode
let verifyTicketCode: typeof import('../../server/utils/registration').verifyTicketCode

beforeAll(async () => {
  process.env.TICKET_SECRET = 'unit-test-secret'
  ;({ ticketCode, verifyTicketCode } = await import('../../server/utils/registration'))
})

describe('QR ticket codes', () => {
  it('round-trips for the issuing mosque', () => {
    const code = ticketCode(TENANT_A, REG)
    expect(code).toMatch(/^om1\.[0-9a-f-]{36}\.[\w-]{22}$/)
    expect(verifyTicketCode(TENANT_A, code)).toBe(REG)
    expect(verifyTicketCode(TENANT_A, `  ${code}\n`)).toBe(REG)
  })

  it('is invalid at another mosque', () => {
    expect(verifyTicketCode(TENANT_B, ticketCode(TENANT_A, REG))).toBeNull()
  })

  it('rejects tampering and garbage', () => {
    const code = ticketCode(TENANT_A, REG)
    const otherId = code.replace(REG, '00000000-0000-4000-8000-000000000000')
    expect(verifyTicketCode(TENANT_A, otherId)).toBeNull()
    expect(verifyTicketCode(TENANT_A, `${code.slice(0, -1)}x`)).toBeNull()
    for (const bad of ['', 'om1', 'om2.x.y', `om1.${REG}`, 'om1.not-a-uuid.abc'])
      expect(verifyTicketCode(TENANT_A, bad)).toBeNull()
  })
})
