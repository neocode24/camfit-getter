const CamfitCrawler = require('./src/crawler/camfit');

async function testCrawler() {
  const crawler = new CamfitCrawler();
  console.log('🔍 2025-09-13~14 날짜 테스트 시작...');

  try {
    const sites = await crawler.checkAvailability();
    console.log(`📊 크롤링 결과: ${sites.length}개 사이트 발견`);

    if (sites.length === 0) {
      console.log('✅ 정상: 예상대로 빈자리가 없습니다.');
      console.log('📝 이 날짜는 모든 사이트가 예약 완료 상태입니다.');
    } else {
      console.log('⚠️ 예상과 다름: 빈자리가 발견되었습니다.');
      sites.forEach((site, idx) => {
        console.log(`  ${idx + 1}. ${site.zone}: ${site.name}`);
      });
    }
  } catch (err) {
    console.error('❌ 크롤링 실패:', err.message);
  }

  process.exit(0);
}

testCrawler();
