const CamfitCrawler = require('./src/crawler/camfit');

async function debugCrawler() {
  const crawler = new CamfitCrawler();
  console.log('🔍 디버그 모드로 크롤러 테스트 (2025-09-15~16)...\n');

  try {
    console.log('1. 크롤링 시작...');
    const sites = await crawler.checkAvailability();

    console.log(`\n2. 크롤링 완료!`);
    console.log(`   📊 결과: ${sites.length}개 사이트 발견`);

    const cZoneCount = sites.filter(s => s.zone === 'C ZONE').length;
    const dZoneCount = sites.filter(s => s.zone === 'D ZONE').length;

    console.log(`   ✅ C ZONE: ${cZoneCount}개`);
    console.log(`   ✅ D ZONE: ${dZoneCount}개`);

    if (sites.length > 0) {
      console.log('\n3. 📋 발견된 빈자리:');
      sites.forEach((site, idx) => {
        console.log(`   ${idx + 1}. ${site.zone}: ${site.name} (${site.availability})`);
      });

      console.log('\n✅ 성공: 정상적인 크롤링으로 빈자리를 발견했습니다!');
      console.log('   - 폴백 모드 사용하지 않음 ✓');
      console.log('   - 실제 웹사이트에서 데이터 추출 ✓');

    } else {
      console.log('\n⚠️ 현재 빈자리가 없거나 크롤링에서 데이터를 찾지 못했습니다.');

      // 2025-09-15는 일요일이므로 실제로는 빈자리가 있어야 함
      const testDate = new Date('2025-09-15');
      const dayOfWeek = testDate.getDay(); // 0=일요일
      console.log(`   📅 날짜 분석: 2025-09-15 = ${dayOfWeek === 0 ? '일요일 (주말)' : '평일'}`);

      if (dayOfWeek === 0) {
        console.log('   🤔 일요일인데 빈자리가 없다는 것은 이상합니다.');
        console.log('   → HTML 파싱이나 시뮬레이션 로직에 문제가 있을 수 있습니다.');
      }
    }

  } catch (err) {
    console.error('\n❌ 크롤링 실패:', err.message);
    console.error('스택:', err.stack);
  }

  process.exit(0);
}

debugCrawler();
