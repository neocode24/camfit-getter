const axios = require('axios');
const cheerio = require('cheerio');

async function testHTMLParsing() {
  console.log('🔍 HTML 파싱 테스트 시작...\n');

  try {
    const url = 'https://camfit.co.kr/camp/66992898908bb2001e4a650e';
    console.log('1. HTTP 요청 전송:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000,
      validateStatus: status => status < 500
    });

    console.log(`2. HTTP 응답 수신: ${response.status} (${response.data?.length || 0} bytes)`);

    if (response.data && response.data.length > 0) {
      const $ = cheerio.load(response.data);
      const title = $('title').text();

      console.log('3. HTML 분석:');
      console.log(`   - 페이지 제목: "${title}"`);
      console.log(`   - React root 존재: ${response.data.includes('id="root"')}`);
      console.log(`   - "캠핏" 포함: ${title.includes('캠핏')}`);
      console.log(`   - React SPA 감지 조건: ${response.data.includes('id="root"') || title.includes('캠핏')}`);

      // HTML 내용 일부 확인
      const htmlSnippet = response.data.substring(0, 500);
      console.log('\n4. HTML 일부 내용:');
      console.log(htmlSnippet);

      if (response.data.includes('id="root"') || title.includes('캠핏')) {
        console.log('\n✅ React SPA로 감지됨 - 시뮬레이션 로직이 실행되어야 함');
      } else {
        console.log('\n❌ React SPA로 감지되지 않음 - 일반 HTML 파싱 시도');
      }
    } else {
      console.log('❌ 응답 데이터 없음');
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }

  process.exit(0);
}

testHTMLParsing();
