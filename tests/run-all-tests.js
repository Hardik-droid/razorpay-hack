import { runIngestTests } from './agents/ingest.test.js';
import { runMultiSourceIngestTests } from './agents/ingest_multisource.test.js';
import { runIntegrityTests } from './agents/integrity.test.js';
import { runVisibilityTests } from './agents/visibility.test.js';
import { runOutreachTests } from './agents/outreach.test.js';
import { runPaymasterTests } from './agents/paymaster.test.js';
import { runE2ESimulation } from './agents/e2e_simulation.test.js';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  STOREFRONT FOR MACHINES: PRODUCTION AGENT VERIFICATION SUITE║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;

  const suites = [
    { name: '1. Ingest Agent (Core)', runner: runIngestTests },
    { name: '2. Multi-Source Ingest (Web, Shopify, PDF, Google)', runner: runMultiSourceIngestTests },
    { name: '3. Integrity Agent', runner: runIntegrityTests },
    { name: '4. Visibility Agent', runner: runVisibilityTests },
    { name: '5. Outreach Agent', runner: runOutreachTests },
    { name: '6. Paymaster Agent', runner: runPaymasterTests },
    { name: '7. Real Merchant Simulation (ABC Electronics, 500 Products)', runner: runE2ESimulation },
  ];

  for (const suite of suites) {
    try {
      const { passed, failed } = await suite.runner();
      totalPassed += passed;
      totalFailed += failed;
    } catch (err) {
      console.error(`💥 CRITICAL ERROR in suite "${suite.name}":`, err);
      totalFailed++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n==============================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY:');
  console.log(`   TOTAL PASSED : ${totalPassed}`);
  console.log(`   TOTAL FAILED : ${totalFailed}`);
  console.log(`   EXECUTION TIME: ${duration}s`);
  console.log('==============================================================\n');

  if (totalFailed > 0) {
    console.error(`❌ TEST SUITE FAILED with ${totalFailed} errors.`);
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${totalPassed} PRODUCTION AGENT TESTS PASSED FLAWLESSLY!`);
    process.exit(0);
  }
}

main();
