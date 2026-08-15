import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter'

// Observer: notifica el resultado de cada test a medida que termina.
class HarnessReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(`[${result.status.toUpperCase()}] ${test.titlePath().join(' > ')}`)
  }
}

export default HarnessReporter
