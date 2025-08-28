const CamfitCrawler = require('./src/crawler/camfit');

async function testImprovedCrawler() {
  const crawler = new CamfitCrawler();
  console.log('🔍 개선된 크롤러 테스트 시작 (2025-09-15~16)...');

  try {
    const sites = await crawler.checkAvailability();
    console.log(`📊 크롤링 결과: ${sites.length}개 사이트 발견`);

    const cZoneCount = sites.filter(s => s.zone === 'C ZONE').length;
    const dZoneCount = sites.filter(s => s.zone === 'D ZONE').length;

    console.log(`  ✅ C ZONE: ${cZoneCount}개`);
    console.log(`  ✅ D ZONE: ${dZoneCount}개`);
    console.log(`  📝 총합: ${sites.length}개`);

    if (sites.length > 0) {
      console.log('\n📋 발견된 빈자리:');
      sites.forEach((site, idx) => {
        console.log(`  ${idx + 1}. ${site.zone}: ${site.name} (${site.availability})`);
      });
    }

    console.log('\n🎯 정상적인 크롤링이 작동했는지 확인:');
    console.log('- 폴백 모드를 사용하지 않고 실제 크롤링으로 처리되었나요?');

  } catch (err) {
    console.error('❌ 크롤링 실패:', err.message);
  }

  process.exit(0);
}

testImprovedCrawler();
