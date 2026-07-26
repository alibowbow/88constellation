/* 88 Constellations — pocket atlas runtime */
(function () {
    'use strict';

    const STORAGE_KEYS = {
        learned: 'learnedConstellations',
        magnitude: 'skyLimitMag',
        mistakes: 'quizMistakes'
    };

    const FILTER_LABELS = {
        all: '전체',
        봄: '봄',
        여름: '여름',
        가을: '가을',
        겨울: '겨울',
        zodiac: '황도 12궁',
        북: '북쪽 하늘',
        남: '남쪽 하늘',
        unlearned: '미등록',
        learned: '등록 완료'
    };

    const QUIZ_ROUNDS = 10;
    const LIST_PAGE_SIZE = 12;
    const VALID_SPEED_COUNTS = new Set([8, 20, 44, 88]);
    const WHOLE_SKY_WIDTH = 1000;
    const WHOLE_SKY_HEIGHT = 500;
    const WHOLE_SKY_HIT_RADIUS = 38;
    const PROGRESS_MILESTONES = [
        { count: 8, rank: '별길잡이' },
        { count: 20, rank: '성도 탐험가' },
        { count: 44, rank: '밤하늘 해설가' },
        { count: 88, rank: '88 별자리 마스터' }
    ];
    const STORY_DETAILS = {
        Lyra: [
            '거문고자리(Lyra)가 가리키는 악기는 한국의 거문고가 아니라 고대 그리스의 현악기 리라입니다. 고대 천문 신화에서는 헤르메스가 거북 등껍질로 이 악기를 만들었다고 전합니다. 리라가 오르페우스에게 전해진 과정은 판본마다 달라, 헤르메스가 바로 주었다는 이야기와 아폴론이 넘겨받아 연주를 가르친 뒤 주었다는 이야기가 함께 남아 있습니다. 오르페우스가 연주하면 사나운 짐승이 얌전해지고 나무와 바위까지 소리를 들으러 다가왔다고 하며, 아르고호 원정에서는 세이렌의 노래를 음악으로 눌러 동료들을 구했다고 합니다.',
            '아내 에우리디케가 뱀에 물려 죽자 오르페우스는 리라 하나를 들고 저승으로 내려갔습니다. 그의 노래는 저승의 망령뿐 아니라 하데스와 페르세포네의 마음까지 움직였습니다. 두 신은 두 사람이 모두 지상에 나올 때까지 뒤를 돌아보지 말라는 조건으로 에우리디케를 돌려보냈습니다. 그러나 지상의 빛에 거의 닿았을 때 오르페우스가 뒤를 돌아보았고, 아직 저승의 경계를 넘지 못한 에우리디케는 다시 어둠 속으로 사라졌습니다. 그가 돌아본 이유는 불안, 그리움, 의심 등으로 다양하게 해석됩니다.',
            '오르페우스의 최후에도 여러 판본이 있습니다. 그는 트라키아의 여인들 또는 디오니소스의 추종자들에게 죽지만, 그 까닭은 디오니소스를 소홀히 했기 때문, 비밀 의식을 보았기 때문, 여인들의 사랑을 거절했기 때문 등으로 갈립니다. 고대 천문 신화의 한 전승에서는 뮤즈 여신들이 그의 흩어진 유해를 거두고 위대한 음악가를 기억하기 위해 리라를 별들 사이에 놓으며, 아폴론과 제우스가 이를 허락합니다. 거문고자리는 오르페우스 자신이 아니라 주인이 죽은 뒤에도 그의 음악을 기억하게 하는 악기를 나타냅니다.',
            '거문고자리에서 가장 밝은 별 베가는 한국에서 직녀성으로 친숙합니다. 은하수 건너 독수리자리의 알타이르, 곧 견우성과 떨어져 지내다가 음력 7월 7일 칠석에 오작교를 건너 만난다는 이야기입니다. 견우직녀 설화는 오르페우스 신화와 이어지는 뒷이야기가 아니라, 같은 하늘을 한국과 동아시아 문화권이 다르게 읽어 낸 독립된 전승입니다. 같은 별을 두고 그리스인은 잃어버린 사랑을 노래한 리라를, 한국인은 다시 만날 날을 기다리는 직녀성을 바라본 셈입니다.'
        ],
        Cancer: [
            '게자리(Cancer)의 게는 그리스 전승에서 카르키노스(καρκίνος, ‘게’)로 불립니다. 이야기는 헤라클레스의 열두 과업 중 두 번째인 레르네의 히드라 퇴치에서 시작합니다. 히드라는 머리를 하나 없애면 둘이 돋는 괴물이었고, 헤라클레스는 늪에서 이 괴물과 싸웠습니다. 《도서관》이라 불리는 고대 신화집은 거대한 게가 히드라를 도우러 와 헤라클레스의 발을 물었다고 전합니다.',
            '카르키노스는 거대한 영웅을 이길 힘이 없었지만, 그의 발을 집게로 물어 공격을 방해했습니다. 《도서관》은 헤라클레스가 곧 게를 죽였다고 전하며, 별자리 전승에서는 그가 게를 발로 짓밟았다고도 묘사합니다. 이후 조카 이올라오스가 잘린 히드라의 목을 불로 지져 새 머리가 자라지 못하게 도우면서 싸움이 끝납니다. 카르키노스는 승패를 바꿀 만큼 강한 존재는 아니었지만, 자신보다 훨씬 큰 상대에게 덤빈 조력자로 기억됐습니다.',
            '통상 히기누스의 저작으로 전해지는 고대 천문 신화집 《아스트로노미카》에서는 헤라가 카르키노스의 행동을 기려 그를 별들 사이에 놓았다고 합니다. 헤라는 제우스의 아들 헤라클레스를 오랫동안 미워했고, 카르키노스는 헤라 편에서 싸운 셈입니다. 다만 게는 히드라 신화의 작은 등장인물이어서 모든 고대 판본에 나오지는 않습니다. 현대적으로는 게자리를 영웅의 승리보다, 패배하더라도 물러서지 않은 작은 존재를 기억한 별자리로 읽어볼 수 있습니다.',
            '게자리 중심의 프레세페 성단 M44에는 또 다른 고대 이야기가 겹쳐 있습니다. 《아스트로노미카》에는 디오니소스와 헤파이스토스 일행이 거인족과 싸울 때 타고 온 당나귀들이 낯선 울음소리로 적을 달아나게 했다는 전승이 실립니다. 하늘의 두 당나귀별 사이에 보이는 흐릿한 빛무리는 먹이통으로 상상되어 프레세페라 불렸습니다. 현대 천문학에서 M44는 게자리의 산개성단이며, 벌집 성단이라고도 널리 알려져 있습니다.'
        ],
        Cetus: [
            '고래자리(Cetus)의 라틴어 이름은 고래를 뜻하기도 하지만, 이 별자리의 주인공은 온순한 고래가 아니라 그리스어로 케토스(κῆτος)라 부른 거대한 바다괴물입니다. 에티오피아 왕비 카시오페이아가 자신 또는 딸 안드로메다가 바다의 님프 네레이데스보다 아름답다고 자랑하자, 분노한 포세이돈이 왕국에 홍수와 케토스를 보냈다는 것이 가장 널리 전해지는 이야기입니다. 여기서 에티오피아는 현대 국가의 경계와 정확히 일치하는 지명이 아니라, 그리스인이 상상한 신화 속 왕국입니다.',
            '재앙을 끝낼 방법을 묻자 신탁은 왕녀 안드로메다를 괴물에게 바치라고 답했습니다. 왕 케페우스는 백성들의 압박 속에서 딸을 해안의 바위에 묶었습니다. 마침 메두사를 쓰러뜨리고 돌아가던 페르세우스가 하늘에서 안드로메다를 발견했고, 케토스를 죽여 그녀를 구하는 대가로 혼인을 약속해 달라고 요구했습니다. 약속이 맺어진 뒤 페르세우스는 괴물이 다가오는 바다로 뛰어들었습니다.',
            '케토스가 쓰러지는 장면은 전승과 후대 작품에 따라 달라집니다. 고대 신화집 《도서관》은 페르세우스가 괴물과 싸워 죽였다고 간결하게 기록하고, 오비디우스의 《변신 이야기》는 날개 달린 신발을 신은 페르세우스가 바위와 칼을 이용해 긴 전투를 벌이는 모습을 자세히 묘사합니다. 메두사의 머리를 들어 케토스를 돌로 만들었다는 장면도 별자리 해설과 미술에서 널리 쓰이지만, 모든 고대 판본이 같은 결말을 전하는 것은 아닙니다.',
            '하늘에서는 케페우스자리·카시오페이아자리·안드로메다자리·페르세우스자리와 고래자리가 한 신화의 인물들처럼 이어집니다. 고래자리 안에는 밝기가 크게 변하는 미라가 있습니다. 한동안 맨눈으로 보이다가 다시 희미해지는 이 별 때문에 미라는 ‘놀라운 별’이라는 이름을 얻었고, 장주기 변광성의 대표가 되었습니다. 고대의 바다괴물 이야기와 실제로 밝기가 달라지는 별이 한 별자리 안에 함께 담긴 셈입니다.'
        ],
        Puppis: [
            '고물자리(Puppis)는 배 전체가 아니라 선미, 곧 배의 뒤쪽 갑판을 나타냅니다. 원래는 이아손과 아르고나우타이 영웅들이 탔던 아르고호 전체가 하나의 거대한 아르고자리(Argo Navis)였습니다. 전승에 따르면 배 만드는 장인 아르고스가 아테나의 도움을 받아 배를 만들었고, 선수에는 제우스의 신탁을 전하던 도도나의 신성한 참나무 조각이 들어가 위험을 경고했다고 합니다.',
            '이아손은 빼앗긴 왕위를 되찾기 위한 조건으로 머나먼 콜키스의 황금양털을 가져오라는 명령을 받았습니다. 헤라클레스, 카스토르와 폴리데우케스, 오르페우스 등 이름난 영웅들이 아르고호에 올랐습니다. 원정대는 서로 부딪치는 심플레가데스 바위와 수많은 난관을 지나 콜키스에 도착했고, 이아손은 메데이아의 도움으로 황금양털을 얻어 귀환했습니다. 판본마다 승선한 영웅과 귀환 경로는 조금씩 다릅니다.',
            '아르고호가 별이 된 과정에도 여러 설명이 남아 있습니다. 히기누스 전승에서는 아테나가 최초의 배를 기념해 하늘에 올렸다고 하며, 다른 이야기에서는 포세이돈이 배의 일부를 별들 사이에 놓습니다. 고대 시인 아라토스는 하늘의 아르고호가 보통 항해와 반대로 선미부터 뒤로 움직인다고 묘사했습니다. 항구에 들어갈 때 노를 거꾸로 저어 배의 뒤쪽부터 뭍에 대는 모습처럼 보았던 것입니다.',
            '아르고자리는 프톨레마이오스가 정리한 고대 48개 별자리 가운데 하나였지만, 한 별자리로 다루기에는 지나치게 컸습니다. 18세기 천문학자 라카유는 별 목록에서 배를 고물자리(Puppis), 용골자리(Carina), 돛자리(Vela)의 세 구역으로 나누어 다뤘고, 이 구분이 현대 88개 별자리 체계에 자리 잡았습니다. 그래서 세 별자리는 배 한 척의 흔적을 공유하며, 그리스 문자 별 이름도 서로 나누어 가진 독특한 구조를 보입니다.'
        ],
        Antlia: [
            '공기펌프자리(Antlia)는 고대 신화가 아니라 과학기구에서 태어난 근대 별자리입니다. 프랑스 천문학자 니콜라 루이 드 라카유는 1751년부터 1752년까지 남아프리카 희망봉에서 남쪽 하늘의 별들을 관측했습니다. 유럽에서 잘 보이지 않던 하늘을 정리하면서 그는 당시 과학과 기술을 상징하는 기구들로 여러 새 별자리를 만들었고, 그 가운데 하나를 처음에는 ‘공기압 기계’라는 뜻의 프랑스어 이름으로 불렀습니다.',
            '라카유가 별자리 그림에 넣은 기계는 17세기 프랑스 물리학자 드니 파팽이 진공 실험에 사용했던 단일 실린더형 공기펌프를 닮았습니다. 손잡이를 움직여 밀폐된 용기 안의 공기를 빼내면 압력이 낮아지고, 평소에는 보이지 않던 공기의 작용을 실험으로 확인할 수 있었습니다. 이 기구는 신화 속 보물이 아니라 자연을 측정하고 재현하려 했던 계몽시대의 태도를 상징합니다.',
            '라카유는 1756년 남천도에서 이 별자리를 공개하고, 1763년에 출판된 별 목록에서 이름을 라틴어 ‘안틀리아 프네우마티카’로 적었습니다. 뒤에 영국 천문학자 존 허셜이 이름을 한 단어로 줄일 것을 제안하면서 오늘날의 Antlia가 자리 잡았습니다. 별이 어두워 고대 그리스의 독립된 별자리로 알려지지 않았으므로, 공기펌프자리에 고대 영웅이나 신을 억지로 연결할 필요는 없습니다.',
            '공기펌프자리는 바다뱀자리·나침반자리·돛자리·센타우루스자리 사이의 남쪽 하늘에 놓여 있습니다. 가장 밝은 별도 4등급대로 두드러지지 않지만, 바로 그 희미함이 이 별자리의 역사와 잘 맞습니다. 맨눈으로 뚜렷한 형상을 발견한 것이 아니라, 관측자가 어두운 별들을 정리하고 과학기구의 모습을 부여해 만든 별자리이기 때문입니다.'
        ],
        Pavo: [
            '공작새자리(Pavo)는 고대 그리스의 48개 별자리가 아니라 대항해시대에 만들어진 남천 별자리입니다. 네덜란드 항해자 피터르 디르크스존 케이저와 프레데릭 더하우트만이 동인도 항로에서 기록한 남쪽 별들을 바탕으로 페트뤼스 플란시우스가 구성했으며, 1598년 천구의에 처음 나타났습니다. 요한 바이어가 1603년 《우라노메트리아》에 그려 넣으면서 널리 알려졌습니다.',
            '이름의 공작은 헤라와 백 개의 눈을 가진 아르고스 이야기와 자연스럽게 연결됩니다. 제우스는 연인 이오를 숨기기 위해 흰 암소로 바꾸었지만, 헤라는 이를 알아차리고 암소를 선물로 받아 아르고스에게 지키게 했습니다. 아르고스는 수많은 눈 가운데 일부만 감고도 계속 주위를 살필 수 있어 이오는 좀처럼 달아날 수 없었습니다.',
            '제우스의 부탁을 받은 헤르메스는 목동으로 변장해 음악과 이야기로 아르고스를 졸게 했고, 마침내 모든 눈을 감게 한 뒤 이오를 풀어주었습니다. 전승에서는 헤르메스가 아르고스를 죽이지만, 공작 깃털의 기원을 설명할 때 더 중요한 장면은 그 다음입니다. 헤라는 아르고스의 눈을 자신이 아끼는 공작의 꼬리깃에 옮겨 그의 감시와 충성을 기억하게 했다고 합니다.',
            '다만 이 신화가 곧 고대인이 공작새자리를 만들었다는 뜻은 아닙니다. 남천의 새 별자리에 고전 신화를 덧입힌 후대의 별자리 이야기로 구분하는 편이 정확합니다. 공작새자리의 가장 밝은 별은 피콕이며, 그 안의 NGC 6752는 맨눈에 가까울 만큼 밝은 남천의 구상성단 가운데 하나입니다. 수많은 별이 모인 성단은 공작 꼬리의 빛나는 눈을 떠올리게 합니다.'
        ],
        Sagittarius: [
            '궁수자리(Sagittarius)는 활을 겨눈 존재로 아주 오래전부터 알려졌지만, 그 정체는 한 사람으로만 고정되지 않았습니다. 흔히 현명한 켄타우로스 케이론이라고 소개되지만, 고대 천문 신화에서 케이론은 센타우루스자리와 더 자주 연결됩니다. 히기누스가 전한 궁수자리 이야기의 주인공은 헬리콘산에서 뮤즈들과 함께 자란 크로토스입니다.',
            '크로토스는 판과 뮤즈들의 유모 에우페메의 아들로 전해지며, 말의 네 다리를 가진 켄타우로스라기보다 사티로스 계열의 존재입니다. 그는 숲을 빠르게 누비는 뛰어난 사냥꾼이었고, 활을 고안해 능숙하게 쏘았다고 합니다. 그래서 하늘의 궁수가 활시위를 당긴 자세는 그의 발명과 솜씨를 기억하는 모습으로 해석됩니다.',
            '크로토스는 음악과도 이어집니다. 뮤즈들이 노래할 때 손뼉을 쳐 박자를 맞추었고, 그 소리가 훌륭한 공연에 찬사를 보내는 관습의 시작이 되었다는 전승이 있습니다. 뮤즈들은 사냥과 음악 모두에 뛰어난 친구를 기려 달라고 제우스에게 청했고, 제우스는 그를 활을 당기는 형상으로 별들 사이에 놓았습니다.',
            '실제 하늘의 궁수자리는 우리 은하 중심 방향에 있어 별과 성운이 매우 풍부합니다. 밝은 별들을 이으면 서양에서 찻주전자 모양으로 부르는 별무리가 나타나고, 그 주둥이 위로 은하수가 김처럼 피어오르는 듯 보입니다. 궁수의 신화적 모습과 은하 중심의 실제 풍경이 한곳에 겹친 별자리입니다.'
        ],
        Reticulum: [
            '그물자리(Reticulum)는 물고기를 잡는 그물이 아니라 망원경 접안부의 ‘레티클’을 뜻합니다. 니콜라 루이 드 라카유가 희망봉에서 남쪽 하늘을 관측한 뒤 1756년 발표한 남천도에 ‘마름모꼴 레티클’이라는 이름으로 처음 실었습니다. 고대 신화가 없는 근대 별자리이며, 관측 장치 자체를 하늘에 기념한 경우입니다.',
            '라카유 시대의 레티클은 현대 총기 조준경의 십자선과 같은 물건으로 단순화하기 어렵습니다. 그의 관측 장치에는 구리판에 작은 마름모꼴 구멍을 낸 부품이 들어갔고, 망원경으로 보이는 별이 그 경계선을 통과하는 순간을 기준으로 위치를 쟀습니다. 작은 기하학적 틀이 넓은 하늘을 재는 좌표의 기준이 된 셈입니다.',
            '관측자는 별이 레티클의 선을 지나는 시각을 시계로 기록하고 여러 번의 측정을 이어 붙였습니다. 라카유는 이 방식으로 짧은 희망봉 체류 동안 약 만 개에 가까운 남천 별의 위치를 기록했습니다. 그 결과 유럽에서 충분히 정리되지 않았던 남쪽 하늘이 촘촘한 별 목록과 지도로 바뀌었습니다.',
            '라카유는 별자리 이름을 라틴어 Reticulum으로 정리했고, 이 명칭이 현대 88개 별자리에도 남았습니다. 별자리의 네 밝은 별은 실제로 길쭉한 마름모에 가까운 윤곽을 만듭니다. 그물자리는 영웅의 모험이 아니라, 별빛이 작은 눈금을 통과하는 순간을 반복해서 재어 하늘을 지도화한 관측의 이야기를 담고 있습니다.'
        ],
        Apus: [
            '극락조자리(Apus)는 고대 신화가 아니라 대항해시대의 남천 관측에서 태어난 별자리입니다. 네덜란드 항해자 피터르 디르크스존 케이저와 프레데릭 더하우트만이 동인도 항로에서 기록한 남쪽 별들을 바탕으로 지도 제작자 페트뤼스 플란시우스가 구성했습니다. 1598년 플란시우스와 요도쿠스 혼디우스의 천구의에 나타났고, 요한 바이어가 1603년 《우라노메트리아》에 실으면서 널리 알려졌습니다.',
            '별자리의 새는 뉴기니와 그 주변 섬에 사는 극락조입니다. 당시 유럽에 도착한 극락조 표본은 거래와 보존 과정에서 다리와 날개가 제거된 경우가 많았습니다. 살아 있는 새를 본 적 없는 사람들은 극락조가 발 없이 평생 하늘을 떠다니며 산다고 오해했고, 그 신비로운 소문이 별자리 이름에 남았습니다.',
            'Apus는 그리스어로 ‘발이 없는’을 뜻하는 apous에서 유래합니다. 플란시우스는 처음에 네덜란드어 ‘극락조’와 라틴어 표현을 섞은 이름을 사용했고, 초기 지도에는 새를 뜻하는 avis 대신 벌을 뜻하는 apis가 적히는 혼선도 있었습니다. 이후 Apus라는 짧은 이름이 자리 잡아 현대 국제천문연맹의 공식 별자리가 되었습니다.',
            '극락조자리는 천구 남극 가까이에 있어 한국에서는 관측하기 어렵고, 밝은 별도 많지 않습니다. 그래서 이 별자리는 눈에 띄는 고대 별무늬를 발견한 결과라기보다 항해자들의 관측, 낯선 동물에 대한 자연사 기록, 유럽에 퍼진 오해가 한데 얽혀 만들어진 별자리로 보는 편이 정확합니다.'
        ],
        Camelopardalis: [
            '기린자리(Camelopardalis)는 큰곰자리와 카시오페이아자리 사이의 넓고 희미한 북쪽 하늘을 차지합니다. 밝은 별이 거의 없어 고대 그리스의 독립된 별자리로 정리되지 않았고, 17세기 초 네덜란드의 지도 제작자 페트뤼스 플란시우스가 그 빈 영역의 별들을 묶어 새 별자리로 소개했습니다.',
            'Camelopardalis라는 이름은 고대 그리스인이 기린을 부르던 말에서 왔습니다. 긴 목과 체형은 낙타를 닮고 몸의 얼룩무늬는 표범을 닮았다고 보아 ‘낙타-표범’이라는 두 동물의 이름을 합쳤습니다. 실제 별들이 기린의 윤곽을 선명하게 만드는 것은 아니며, 희미한 별들을 큰 동물의 모습으로 상상한 것입니다.',
            '플란시우스가 만든 별자리는 1612년 무렵의 천구의에 나타났고, 뒤이어 야코프 바르치와 요하네스 헤벨리우스 같은 천문가들의 지도에 실리며 자리를 잡았습니다. 일부 후대 자료는 성서 속 낙타 이야기와 연결하지만, 기린자리 자체는 고대 신화에서 전해진 별자리가 아니라 근대 천문 지도 제작의 결과입니다.',
            '기린자리는 면적이 매우 넓지만 가장 밝은 별도 4등급대라 도시 하늘에서는 형태를 찾기 어렵습니다. 대신 별들이 한 줄로 흐르는 듯 보이는 켐블의 폭포와 그 끝의 산개성단 NGC 1502가 잘 알려져 있습니다. 화려한 한두 별보다 어두운 북쪽 하늘의 넓이를 탐색하게 하는 별자리입니다.'
        ],
        Corvus: [
            '까마귀자리(Corvus)는 프톨레마이오스가 정리한 고대 48개 별자리 가운데 하나입니다. 봄철 남쪽 하늘에서 네 밝은 별이 작은 사다리꼴을 이루며, 바로 옆의 컵자리(Crater)와 거대한 바다뱀자리(Hydra)와 함께 한 장면처럼 놓여 있습니다. 이 세 별자리의 배치를 설명하는 대표적인 그리스 전승에는 아폴론의 까마귀가 등장합니다.',
            '아폴론은 까마귀에게 잔을 주며 샘에서 물을 길어 오라고 했습니다. 길을 가던 까마귀는 아직 익지 않은 무화과를 발견했고, 열매가 익을 때까지 나무 곁에서 기다린 뒤 실컷 먹었습니다. 심부름이 늦었다는 사실을 숨기려 한 까마귀는 샘 근처의 물뱀을 붙잡아 잔과 함께 아폴론에게 돌아갔습니다.',
            '까마귀는 물뱀이 길을 막아 늦었다고 거짓말했지만 아폴론은 곧 진실을 알아챘습니다. 그는 까마귀와 잔, 물뱀을 함께 하늘로 던져 별자리로 만들었습니다. 하늘에서도 까마귀는 물이 담긴 잔 바로 옆에 있으면서 그 사이를 가로막은 물뱀 때문에 닿지 못하고, 목마름을 견디는 벌을 받는다고 전합니다.',
            '아폴론의 까마귀에는 연인의 배신을 알렸다가 흰 깃털이 검게 변했다는 별도의 전승도 있습니다. 그러나 검은 깃털 이야기와 물 심부름·무화과·잔·물뱀 이야기는 서로 다른 갈래이므로 하나의 사건처럼 합치지 않는 편이 정확합니다. 까마귀자리 웹툰은 하늘의 세 별자리 배치까지 이어지는 물 심부름 전승을 따릅니다.'
        ],
        Pyxis: [
            '나침반자리(Pyxis)는 고대 신화가 없는 근대 남천 별자리입니다. 프랑스 천문학자 니콜라 루이 드 라카유가 1751년부터 1752년까지 남아프리카 희망봉에서 남쪽 하늘을 관측한 뒤 만들었습니다. 그는 1756년 발표한 남천도에서 이 별자리를 프랑스어로 ‘나침반’이라 불렀고, 뒤에 라틴어식 이름 Pyxis Nautica가 사용되었습니다.',
            '이 별자리가 나타내는 것은 제도용 컴퍼스가 아니라 배의 방향을 잡는 항해용 자기 나침반입니다. 자석 나침반은 고대 그리스의 아르고나우타이 시대에는 알려지지 않았으므로 이아손의 신화에 실제로 등장한 물건이 아닙니다. 라카유가 당시 과학과 항해 기술을 기념하기 위해 새로 하늘에 놓은 상징입니다.',
            '나침반자리는 옛 아르고자리(Argo Navis) 가까이에 있지만 그 거대한 배에서 갈라진 조각은 아닙니다. 아르고자리의 별과 그리스 문자 이름을 실제로 나누어 이어받은 현대 별자리는 고물자리(Puppis), 용골자리(Carina), 돛자리(Vela)입니다. 나침반자리는 라카유가 주변의 별들을 따로 묶어 만든 독립된 별자리입니다.',
            '가장 밝은 알파 픽시디스도 약 3.7등급이고, 알파·베타·감마별이 느슨한 선을 이루어 전체 모양이 뚜렷하지 않습니다. 한국에서는 봄철 남쪽 지평선 가까이에서 일부를 볼 수 있습니다. 화려한 신화보다 남쪽 하늘을 측량하고 항로를 찾던 시대의 도구를 기억하게 하는 별자리입니다.'
        ],
        Volans: [
            '날치자리(Volans)는 고대 신화에서 전해진 별자리가 아니라 16세기 말 유럽의 남천 관측에서 태어난 별자리입니다. 실제 날치는 길게 발달한 지느러미를 펼쳐 수면 위를 활공하는 물고기이며, 열대 바다를 오가던 항해자에게는 북유럽에서 보기 어려운 낯선 생물이었습니다.',
            '네덜란드 항해자 피터르 디르크스존 케이저와 프레데릭 더하우트만은 동인도 항로에서 남쪽 하늘의 별 위치를 기록했습니다. 천문 지도 제작자 페트뤼스 플란시우스는 이 관측 자료를 바탕으로 여러 남천 별자리를 구성했고, 그 가운데 한 무리를 날치의 모습으로 묶었습니다.',
            '이 별자리는 1598년 플란시우스의 천구의에 네덜란드어로 ‘날아다니는 물고기’를 뜻하는 Vliegendenvis라는 이름으로 나타났습니다. 요한 바이어는 1603년 《우라노메트리아》에 이를 라틴어 Piscis Volans로 수록했으며, 뒤에는 이름이 한 단어인 Volans로 짧아졌습니다.',
            '날치자리에는 특정한 고대 영웅이나 신의 전승이 없습니다. 초기 성도에서는 남쪽 하늘의 거대한 배 아르고자리 곁을 날고, 이웃한 포식성 물고기 황새치자리에게 쫓기는 모습으로 그려지기도 했습니다. 신화보다 새로운 바다와 하늘을 함께 기록한 탐험 시대의 시선이 이 별자리의 핵심입니다.'
        ],
        Crux: [
            '남십자자리(Crux)의 네 밝은 별은 고대 지중해에서도 관측할 수 있었지만 당시에는 별도의 별자리로 분리되지 않았습니다. 2세기 프톨레마이오스는 《알마게스트》에서 이 별들을 센타우루스자리의 일부로 기록했으며, 고대의 성도 역시 같은 전통을 따랐습니다.',
            '지구 자전축의 방향이 장기간에 걸쳐 달라지는 세차운동 때문에 이 별들은 유럽의 위도에서 점차 남쪽 지평선 아래로 내려갔습니다. 북반구의 관측 전통에서 모습이 희미해진 별무리는 대항해시대에 유럽 항해자들이 적도를 넘어 남반구로 진출하면서 다시 뚜렷하게 기록되었습니다.',
            '십자 모양의 긴 축을 이루는 가크룩스와 아크룩스를 이은 선을 연장하면 남천의 극 방향을 가늠할 수 있습니다. 남십자자리는 남반구에서 북극성처럼 극점에 정확히 놓인 별은 아니지만, 바다에서 남쪽 방향을 찾는 실용적인 길잡이로 오랫동안 사용되었습니다.',
            '오늘날의 독립된 십자 형태는 1598년과 1600년에 제작된 플란시우스와 혼디우스의 천구의에서 뚜렷하게 나타났고, 17세기 성도에서 별자리로 자리 잡았습니다. 현재 남십자자리는 국제천문연맹이 인정한 88개 별자리 가운데 가장 작은 별자리이며, 오스트레일리아·뉴질랜드·브라질 등 여러 남반구 국가의 국기와 상징에도 등장합니다.'
        ],
        'Piscis Austrinus': [
            '남쪽물고기자리(Piscis Austrinus)는 근대에 새로 만든 별자리가 아니라 고대부터 이어진 별자리입니다. 그 뿌리는 메소포타미아의 별목록에 등장하는 ‘물고기’ 별무리에서 찾을 수 있으며, 물과 관련된 남쪽 하늘의 별그림이 지중해 세계로 전해지면서 그리스 천문 전통에 편입되었습니다.',
            '2세기 프톨레마이오스는 남쪽물고기자리를 고대 48개 별자리 가운데 하나로 정리했습니다. 가장 밝은 별 포말하우트는 물고기의 입에 놓인 별로 그려졌으며, 이름도 아랍어에서 유래한 ‘물고기의 입’이라는 뜻을 지닙니다. 밤하늘에서 비교적 밝고 주변에 눈에 띄는 별이 적어 더욱 두드러집니다.',
            '고대와 중세의 성도에서 물병자리는 항아리의 물을 길게 쏟고, 그 물줄기는 남쪽물고기의 입까지 이어집니다. 프톨레마이오스의 별목록에서도 물줄기의 끝과 물고기의 입이 포말하우트에서 만나는 구도가 전해졌고, 후대의 성도는 물고기가 하늘의 물을 받아 마시는 장면처럼 이를 시각화했습니다.',
            '남쪽물고기자리는 황도대의 두 물고기를 나타내는 물고기자리(Pisces)와는 다른 별자리입니다. 하나의 확정된 신화만으로 설명하기보다 메소포타미아의 물고기 표상, 그리스의 물병자리와 물줄기, 아랍어 별 이름이 오랜 시간 겹쳐진 결과로 보는 편이 정확합니다.'
        ],
        Hydrus: [
            '남쪽물뱀자리는 고대 신화에서 전해진 별자리가 아닙니다. 16세기 말 유럽의 항해자들이 적도 이남으로 길게 항해하면서 북반구에서는 제대로 볼 수 없던 별들을 관측했고, 그 기록을 바탕으로 새로 정리된 대항해시대의 별자리입니다.',
            '네덜란드 항해자 피터르 디르크스존 케이저와 프레데릭 더하우트만은 동인도 항로에서 남쪽 하늘의 별 위치를 측정했습니다. 천문 지도 제작자 페트뤼스 플란시우스는 이 관측 자료에 실린 별들을 작은 물뱀의 모습으로 묶어 천구의에 나타냈으며, 이후 요한 바이어의 《우라노메트리아》를 통해 널리 알려졌습니다.',
            '라틴어 이름 Hydrus는 물뱀을 뜻합니다. 이름이 비슷한 히드라자리(Hydra)는 고대 그리스 전승과 연결된 크고 오래된 별자리지만, 남쪽물뱀자리는 그 신화의 일부도, 히드라자리의 남쪽 조각도 아닙니다.',
            '이 별자리에는 고대 영웅이나 괴물의 서사보다 관측과 지도 제작의 역사가 담겨 있습니다. 낯선 남쪽 바다를 오가던 항해자의 측량, 그 기록을 별자리로 묶은 지도 제작자의 판단, 그리고 새 하늘을 체계화하려는 근대 천문학의 흐름이 남쪽물뱀자리의 유래입니다.'
        ],
        'Triangulum Australe': [
            '남쪽삼각형자리는 남쪽 하늘의 세 밝은 별이 만드는 선명한 삼각형에서 이름을 얻었습니다. 북쪽 하늘의 삼각형자리와 닮았지만 서로 떨어진 별자리이며, 라틴어 이름 Triangulum Australe도 그대로 ‘남쪽의 삼각형’을 뜻합니다.',
            '이 별자리 역시 고대 그리스 신화에서 출발하지 않았습니다. 대항해시대에 피터르 디르크스존 케이저와 프레데릭 더하우트만이 남반구의 별을 먼저 관측하고 그 위치를 기록했습니다.',
            '천문 지도 제작자 페트뤼스 플란시우스는 케이저와 더하우트만의 선행 관측 자료를 바탕으로 남쪽삼각형자리를 천구의에 나타냈습니다. 이어 요한 바이어가 1603년 《우라노메트리아》에 수록하면서 널리 알려졌으며, 세 꼭짓점을 이루는 밝은 별은 형태를 알아보기 쉬워 남쪽 하늘의 뚜렷한 표지가 되었습니다.',
            '남쪽삼각형자리의 이야기는 신과 영웅보다 측량과 도형에 가깝습니다. 낯선 하늘에서 반복해 확인할 수 있는 세 밝은 점을 하나의 간결한 형태로 묶은 것이며, 관측 결과가 그 자체로 별자리의 이름과 모습을 결정한 대표적인 근대 별자리입니다.'
        ],
        'Corona Australis': [
            '남쪽왕관자리는 궁수자리의 발치 부근에서 별들이 낮은 반원형을 이루는 오래된 별자리입니다. 왕관보다는 둥글게 엮은 화환에 가까운 모습이며, 북쪽왕관자리와 구별하기 위해 ‘남쪽’이라는 이름이 붙었습니다.',
            '이 별무리는 고대 그리스인에게 이미 알려져 있었습니다. 2세기 천문학자 프톨레마이오스는 《알마게스트》의 별목록에 남쪽의 화환을 하나의 별자리로 기록했고, 그 전통은 후대의 성도와 현대의 88개 공식 별자리 체계까지 이어졌습니다.',
            '오랜 역사를 지닌 만큼 화환의 주인을 설명하는 전승은 하나로 고정되지 않습니다. 궁수와 연결하거나 특정 신화 속 인물의 관으로 보는 이야기가 여러 갈래로 전해지지만, 어느 하나를 이 별자리의 유일한 기원이라고 단정하기는 어렵습니다.',
            '그래서 남쪽왕관자리의 핵심은 특정 영웅의 소유물보다 하늘에 남은 오래된 화환 자체에 있습니다. 고대의 관측자가 반원 모양의 별을 화환으로 바라본 장면이 수천 년 동안 이름과 형태를 유지하며 오늘날까지 이어진 별자리입니다.'
        ],
        Lacerta: [
            '도마뱀자리(Lacerta)는 백조자리와 안드로메다자리 사이의 북쪽 하늘에 놓인 작고 희미한 별자리입니다. 밝은 별은 없지만 몇몇 별을 이어 보면 몸을 낮춘 작은 동물이나 굽은 꼬리처럼 지그재그로 꺾이는 선이 나타납니다. 이 모양은 고대 그리스의 신화에서 전해진 것이 아니라 근대의 천문 지도 제작자가 별이 드문 틈을 새롭게 정리한 결과입니다.',
            '폴란드 천문학자 요하네스 헤벨리우스는 1687년에 이 별들을 작은 도마뱀의 모습으로 묶었습니다. 그는 라틴어로 도마뱀을 뜻하는 Lacerta와 별도마뱀을 가리키는 Stellio를 함께 써서 별자리를 소개했으며, 헤벨리우스의 성도에서는 희미한 별들의 굽은 배열이 도마뱀의 긴 몸과 꼬리로 표현되었습니다.',
            '같은 하늘의 소유권을 두고 다른 도안도 잠시 등장했습니다. 프랑스의 오귀스탱 루아예는 1679년에 루이 14세를 기리며 이 부근의 별들로 ‘왕홀과 정의의 손’을 만들었지만 널리 정착하지 못했습니다. 군주를 찬양한 복잡한 이름은 사라졌고, 헤벨리우스가 제안한 간결한 도마뱀의 이름과 형상이 오래 살아남았습니다.',
            '20세기에 국제천문연맹이 별자리 이름과 경계를 표준화하면서 도마뱀자리는 현대의 88개 공식 별자리 가운데 하나가 되었습니다. 이 별자리에는 한때 변광성으로 여겨졌던 BL 도마뱀자리 천체도 있으며, 그 이름은 오늘날 강한 변동을 보이는 활동은하핵 부류인 BL Lac 천체의 기준이 되었습니다. 희미한 하늘의 빈틈에서 태어난 작은 별자리가 현대 천문학의 용어에도 흔적을 남긴 셈입니다.'
        ],
        Aquila: [
            '독수리자리(Aquila)는 천구의 적도 가까이 은하수를 따라 놓인 오래된 별자리로, 프톨레마이오스가 정리한 고대 48개 별자리에도 포함되었습니다. 그리스·로마 전승에서는 독수리가 제우스의 상징이자 신의 번개를 나르는 새로 나타납니다. 고대의 하늘에서 독수리는 단순한 새가 아니라 제우스의 권위와 하늘의 힘을 드러내는 존재였습니다.',
            '독수리는 트로이 왕가의 아름다운 소년 가니메데스를 올림포스로 데려간 전승과도 연결됩니다. 어떤 판본에서는 제우스가 독수리를 보내고, 다른 판본에서는 제우스 자신이 독수리의 모습으로 변합니다. 가니메데스는 올림포스에서 신들의 술을 따르는 시종이 되었으며, 물을 따르는 소년의 모습은 물병자리 전승과도 연결되어 독수리 이야기와 함께 언급됩니다.',
            '독수리자리에서 가장 밝은 별은 알타이르입니다. 이름은 아랍어로 ‘날아가는 독수리’를 뜻하는 표현에서 왔으며, 지구에서 약 17광년 떨어진 밝은 별입니다. 알타이르는 거문고자리의 베가, 백조자리의 데네브와 함께 여름철 대삼각형을 이루고, 전통적인 독수리 그림에서는 몸통 중심에 놓입니다.',
            '동아시아의 별 이야기에서는 알타이르가 견우성으로 알려져 있습니다. 은하수 건너편 베가의 직녀성과 떨어져 지내다가 칠석에 오작교를 건너 만난다는 견우직녀 전승입니다. 이는 제우스와 가니메데스 이야기의 번역이나 뒷이야기가 아니라 같은 별을 전혀 다른 문화가 독립적으로 읽어 낸 결과이며, 독수리자리는 여러 하늘 문화가 겹쳐 보이는 대표적인 자리입니다.'
        ],
        Delphinus: [
            '돌고래자리(Delphinus)는 천구의 적도 북쪽에 놓인 작고 오래된 별자리로, 프톨레마이오스가 기록한 고대 48개 별자리 가운데 하나입니다. 돌고래가 하늘에 오른 까닭은 하나의 이야기로만 전해지지 않습니다. 포세이돈의 혼인을 도운 돌고래 이야기와 악사 아리온을 구한 돌고래 이야기가 대표적이며, 이 웹툰은 아리온 전승을 따라갑니다.',
            '헤로도토스의 《역사》 1권 23~24절에 따르면 아리온은 레스보스섬 메팀나 출신의 이름난 악사로, 코린토스의 통치자 페리안드로스의 궁정에서 활동했습니다. 그는 이탈리아와 시칠리아 순회에서 얻은 재물을 가지고 코린토스로 돌아가던 중 선원들에게 목숨을 위협받았습니다. 마지막 노래를 부르게 해 달라고 청한 아리온은 연주를 마친 뒤 바다로 뛰어들었습니다.',
            '노래에 이끌려 온 돌고래 한 마리가 아리온을 등에 태우고 펠로폰네소스 남쪽의 타이나론곶까지 데려다주었습니다. 아리온은 먼저 코린토스에 도착해 페리안드로스에게 일을 알렸고, 뒤늦게 돌아온 선원들의 거짓말도 드러났습니다. 헤로도토스는 코린토스인과 레스보스인이 전하는 이야기로 이를 소개하지만, 그 대목에서 돌고래가 별자리가 되었다고 말하지는 않습니다.',
            '아리온을 구한 돌고래와 하늘의 돌고래를 잇는 설명은 후대의 별자리 해설에서 덧붙여졌습니다. 또한 다른 천문 신화에서는 돌고래가 포세이돈을 피해 숨은 암피트리테를 찾아 설득한 공로로 별들 사이에 놓였다고 전합니다. 따라서 돌고래자리는 하나의 고정된 기원보다, 바다에서 인간을 돕는 돌고래에 관한 여러 전승이 오랜 별무늬에 겹쳐진 별자리로 보는 편이 정확합니다.'
        ],
        Vela: [
            '돛자리(Vela)는 이아손과 아르고나우타이 영웅들이 황금양털을 찾아 타고 간 아르고호의 돛을 나타냅니다. 전승에서는 장인 아르고스가 아테나의 도움을 받아 배를 만들었고, 이아손과 오르페우스, 카스토르와 폴리데우케스 등 여러 영웅이 원정에 올랐습니다. 바람을 받은 큰 돛은 낯선 바다와 위험한 해협을 건너 콜키스로 향하는 항해의 동력이었습니다.',
            '고대의 하늘에서는 돛만 따로 떼어 보지 않고 배 전체를 거대한 아르고자리(Argo Navis)로 그렸습니다. 프톨레마이오스의 별 목록에도 하나의 별자리로 실렸지만, 남쪽 하늘을 넓게 차지해 별을 정리하고 지도를 그리기에는 매우 큰 형상이었습니다. 하늘의 아르고호는 선수보다 선미 쪽이 중심이 된 모습으로 전해졌습니다.',
            '18세기 프랑스 천문학자 니콜라 루이 드 라카유는 남아프리카 희망봉에서 남천의 별을 관측한 뒤, 목록에서 거대한 배의 별들을 용골자리·고물자리·돛자리 등 여러 부분으로 나누어 기록했습니다. 이 구분이 현대 별자리 체계에 이어졌으며, 가까이 있는 나침반자리는 아르고호에서 떨어져 나온 조각이 아니라 라카유가 별도로 만든 근대 별자리입니다.',
            '돛자리에는 신화의 배뿐 아니라 실제로 폭발한 별의 흔적도 펼쳐져 있습니다. 돛자리 초신성 잔해는 약 1만 1천 년 전 폭발한 무거운 별이 남긴 가스 구름으로, 지구에서 약 800광년 떨어져 있으며 하늘에서 매우 넓은 영역을 차지합니다. 가느다란 빛의 필라멘트와 중심의 돛자리 펄서는 오래된 별의 죽음이 지금도 팽창하며 남긴 실제 우주 풍경입니다.'
        ]
    };

    const STORY_WEBTOONS = {
        Lyra: {
            src: './assets/webtoons/01-lyra-webtoon.webp',
            width: 864,
            height: 1821,
            title: '오르페우스와 하늘의 리라',
            episode: 'WEBTOON 01 / 88',
            alt: '오르페우스가 리라를 연주해 모든 생명을 매혹시키고, 리라가 별빛을 따라 하늘로 올라 베가와 함께 거문고자리가 되는 4컷 웹툰'
        },
        Cancer: {
            src: './assets/webtoons/02-cancer-webtoon.webp',
            width: 864,
            height: 1821,
            title: '카르키노스, 별이 된 게',
            episode: 'WEBTOON 02 / 88',
            alt: '헤라클레스와 히드라의 전투에 뛰어든 카르키노스가 패배한 뒤 헤라에 의해 게자리가 되는 4컷 웹툰'
        },
        Cetus: {
            src: './assets/webtoons/03-cetus-webtoon.webp',
            width: 911,
            height: 1727,
            title: '케토스, 폭풍 속의 바다괴물',
            episode: 'WEBTOON 03 / 88',
            alt: '카시오페이아의 자만으로 포세이돈이 케토스를 보내고, 바위에 묶인 안드로메다를 페르세우스가 구해 케토스가 고래자리로 남는 세로 웹툰'
        },
        Puppis: {
            src: './assets/webtoons/04-puppis-webtoon.webp',
            width: 864,
            height: 1821,
            title: '아르고호의 마지막 항해',
            episode: 'WEBTOON 04 / 88',
            alt: '이아손과 아르고나우타이가 아르고호로 황금양털 원정을 마치고, 하늘의 배가 고물·용골·돛자리로 나뉘는 세로 웹툰'
        },
        Antlia: {
            src: './assets/webtoons/05-antlia-webtoon.webp',
            width: 864,
            height: 1821,
            title: '보이지 않는 공기를 붙잡다',
            episode: 'WEBTOON 05 / 88',
            alt: '공기펌프를 이용한 진공 실험과 라카유의 희망봉 남천 관측을 거쳐 공기펌프자리가 탄생하는 세로 웹툰'
        },
        Pavo: {
            src: './assets/webtoons/06-pavo-webtoon.webp',
            width: 864,
            height: 1821,
            title: '공작 꼬리에 피어난 눈',
            episode: 'WEBTOON 06 / 88',
            alt: '흰 암소가 된 이오를 백 개의 눈으로 지키던 아르고스가 잠든 뒤 헤라가 그의 눈을 공작 꼬리에 옮기는 세로 웹툰'
        },
        Sagittarius: {
            src: './assets/webtoons/07-sagittarius-webtoon.webp',
            width: 861,
            height: 1827,
            title: '크로토스, 영원한 궁수',
            episode: 'WEBTOON 07 / 88',
            alt: '헬리콘산의 사티로스 크로토스가 활을 만들고 음악의 박자를 세운 공로로 뮤즈들의 청을 받아 궁수자리가 되는 세로 웹툰'
        },
        Reticulum: {
            src: './assets/webtoons/08-reticulum-webtoon.webp',
            width: 864,
            height: 1821,
            title: '별을 재는 작은 마름모',
            episode: 'WEBTOON 08 / 88',
            alt: '라카유가 망원경 접안부의 마름모형 레티클과 시계를 이용해 남쪽 별의 위치를 측정하고 그물자리를 만드는 세로 웹툰'
        },
        Apus: {
            src: './assets/webtoons/09-apus-webtoon.webp',
            width: 864,
            height: 1821,
            title: '발 없는 새의 별',
            episode: 'WEBTOON 09 / 88',
            alt: '남쪽 바다에서 발견된 극락조와 발 없는 새라는 오해, 항해자들의 남천 관측을 거쳐 극락조자리가 만들어지는 5단 웹툰'
        },
        Camelopardalis: {
            src: './assets/webtoons/10-camelopardalis-webtoon.webp',
            width: 864,
            height: 1821,
            title: '희미한 별 사이의 기린',
            episode: 'WEBTOON 10 / 88',
            alt: '17세기 지도 제작자가 북쪽 하늘의 희미한 별들을 기린의 모습으로 이어 기린자리를 만드는 5단 웹툰'
        },
        Corvus: {
            src: './assets/webtoons/11-corvus-webtoon.webp',
            width: 864,
            height: 1821,
            title: '까마귀의 늦은 심부름',
            episode: 'WEBTOON 11 / 88',
            alt: '아폴론의 물 심부름을 미룬 까마귀가 물뱀 탓으로 거짓말해 까마귀·잔·물뱀이 하늘의 별자리가 되는 6단 웹툰'
        },
        Pyxis: {
            src: './assets/webtoons/12-pyxis-webtoon.webp',
            width: 864,
            height: 1821,
            title: '아르고호 곁의 나침반',
            episode: 'WEBTOON 12 / 88',
            alt: '라카유가 남쪽 하늘의 별들을 항해용 나침반으로 잇고 아르고호 곁에 놓되 배에서 갈라진 별자리는 아님을 설명하는 5단 웹툰'
        },
        Volans: {
            src: './assets/webtoons/13-volans-webtoon.webp',
            width: 864,
            height: 1821,
            title: '남쪽 바다를 날아오른 별',
            episode: 'WEBTOON 13 / 88',
            alt: '남쪽 바다의 날치와 네덜란드 항해자들의 관측 기록이 플란시우스의 천구의와 바이어의 성도를 거쳐 날치자리가 되는 과정을 자연사 필드 저널풍으로 그린 5단 웹툰'
        },
        Crux: {
            src: './assets/webtoons/14-crux-webtoon.webp',
            width: 864,
            height: 1821,
            title: '남쪽 길을 밝힌 십자가',
            episode: 'WEBTOON 14 / 88',
            alt: '고대에는 센타우루스의 일부였던 별들이 세차운동과 남반구 항해를 거쳐 독립된 남십자자리와 남쪽 길잡이로 자리 잡는 역사를 스테인드글라스 성도풍으로 그린 5단 웹툰'
        },
        'Piscis Austrinus': {
            src: './assets/webtoons/15-piscis-austrinus-webtoon.webp',
            width: 864,
            height: 1821,
            title: '포말하우트가 빛나는 물고기',
            episode: 'WEBTOON 15 / 88',
            alt: '물병자리의 물줄기가 밝은 포말하우트가 놓인 물고기의 입으로 이어지고, 이 물과 물고기의 별그림이 메소포타미아에서 그리스로 전해지는 과정을 고대 벽화와 수채화로 그린 5단 웹툰'
        },
        Hydrus: {
            src: './assets/webtoons/16-hydrus-webtoon.webp',
            width: 864,
            height: 1821,
            title: '남쪽 하늘의 작은 물뱀',
            episode: 'WEBTOON 16 / 88',
            alt: '16세기 항해자들의 남쪽 하늘 관측부터 플란시우스의 천구의와 근대 별자리 정착까지를 항해일지풍 수채화로 그린 5컷 웹툰'
        },
        'Triangulum Australe': {
            src: './assets/webtoons/17-triangulum-australe-webtoon.webp',
            width: 864,
            height: 1821,
            title: '세 별이 만든 남쪽 삼각형',
            episode: 'WEBTOON 17 / 88',
            alt: '남쪽 하늘의 세 밝은 별을 항해자들이 관측하고 플란시우스가 천구의에 나타낸 과정을 종이 오리기와 청사진풍으로 그린 5컷 웹툰'
        },
        'Corona Australis': {
            src: './assets/webtoons/18-corona-australis-webtoon.webp',
            width: 864,
            height: 1821,
            title: '오래된 하늘의 화환',
            episode: 'WEBTOON 18 / 88',
            alt: '궁수자리 발치의 반원형 별무리를 고대 그리스인이 화환으로 보고 프톨레마이오스가 기록한 역사를 모자이크와 금박풍으로 그린 5컷 웹툰'
        },
        Lacerta: {
            src: './assets/webtoons/19-lacerta-webtoon.webp',
            width: 864,
            height: 1820,
            title: '희미한 틈의 작은 도마뱀',
            episode: 'WEBTOON 19 / 88',
            alt: '백조자리와 안드로메다자리 사이의 희미한 별들을 헤벨리우스가 도마뱀으로 묶고, 옛 왕홀 별자리를 지나 현대 88개 별자리로 정착한 역사를 바로크 동판화풍으로 그린 5컷 웹툰'
        },
        Aquila: {
            src: './assets/webtoons/20-aquila-webtoon.webp',
            width: 864,
            height: 1821,
            title: '번개를 나르는 하늘의 독수리',
            episode: 'WEBTOON 20 / 88',
            alt: '제우스의 번개를 나르는 독수리와 가니메데스 전승, 알타이르와 동아시아의 견우성 이야기가 하나의 밤하늘에서 만나는 과정을 먹선과 금박풍으로 그린 5컷 웹툰'
        },
        Delphinus: {
            src: './assets/webtoons/21-delphinus-webtoon.webp',
            width: 864,
            height: 1821,
            title: '마지막 노래를 들은 돌고래',
            episode: 'WEBTOON 21 / 88',
            alt: '코린토스로 돌아가던 악사 아리온이 선원들의 위협을 피해 바다로 뛰어들고, 노래를 들은 돌고래에게 구조된 이야기가 후대의 별자리 전승으로 이어지는 과정을 야광 과슈풍으로 그린 5컷 웹툰'
        },
        Vela: {
            src: './assets/webtoons/22-vela-webtoon.webp',
            width: 864,
            height: 1821,
            title: '아르고호의 돛과 별의 잔해',
            episode: 'WEBTOON 22 / 88',
            alt: '이아손과 아르고나우타이의 배를 나타낸 거대한 아르고자리가 라카유의 기록에서 여러 부분으로 나뉘고, 돛자리의 초신성 잔해까지 이어지는 역사를 청사진 실크스크린풍으로 그린 5컷 웹툰'
        }
    };
    const miniSvgCache = new Map();
    let wholeSkyStaticCache = '';

    const byId = (id) => document.getElementById(id);
    const elements = {
        app: byId('app'),
        brandHome: byId('brand-home-button'),
        fullscreen: byId('fullscreen-button'),
        surprise: byId('surprise-button'),
        headerProgress: byId('header-progress-button'),
        headerProgressRing: byId('header-progress-ring'),
        headerProgressCount: byId('header-progress-count'),
        exploreView: byId('explore-view'),
        exploreList: byId('explore-list-screen'),
        detailScreen: byId('detail-screen'),
        challengeView: byId('challenge-view'),
        collectionView: byId('collection-view'),
        modeSelection: byId('mode-selection'),
        continueExplore: byId('continue-explore-button'),
        continueLabel: byId('continue-label'),
        randomExplore: byId('random-explore-button'),
        welcomeMessage: byId('welcome-message'),
        featured: byId('featured-constellation'),
        featuredMap: byId('featured-mini-map'),
        featuredName: byId('featured-name'),
        featuredEnglish: byId('featured-english'),
        search: byId('search-input'),
        clearSearch: byId('clear-search-button'),
        filterToggle: byId('filter-toggle'),
        filterLabel: byId('filter-label'),
        filterDialog: byId('filter-dialog'),
        activeFilterSummary: byId('active-filter-summary'),
        resetFilter: byId('reset-filter-button'),
        atlasSection: byId('atlas-section'),
        atlasPagination: byId('atlas-pagination'),
        atlasPreviousPage: byId('atlas-previous-page'),
        atlasNextPage: byId('atlas-next-page'),
        atlasPageRange: byId('atlas-page-range'),
        atlasPageIndicator: byId('atlas-page-indicator'),
        atlasGrid: byId('constellation-list-grid'),
        atlasCount: byId('atlas-result-count'),
        atlasEmpty: byId('atlas-empty-state'),
        backToList: byId('back-to-list-button'),
        detailPosition: byId('detail-position'),
        constellationName: byId('constellation-name'),
        description: byId('description'),
        imageContainer: byId('image-container'),
        complete: byId('complete-button'),
        prev: byId('prev-button'),
        next: byId('next-button'),
        prevName: byId('prev-name'),
        nextName: byId('next-name'),
        challengeHub: byId('challenge-hub'),
        quizMode: byId('quiz-mode-button'),
        speedMode: byId('time-attack-mode-button'),
        quizPanel: byId('quiz-panel'),
        quizBack: byId('quiz-back-button'),
        quizRound: byId('quiz-round'),
        quizScore: byId('quiz-score'),
        quizProgress: byId('quiz-progress-fill'),
        quizQuestion: byId('quiz-question'),
        quizOptions: byId('options'),
        quizFeedback: byId('feedback'),
        nextQuiz: byId('next-quiz-button'),
        quizResults: byId('quiz-results'),
        speedPanel: byId('time-attack-panel'),
        speedBack: byId('time-attack-back-button'),
        speedTitle: byId('time-attack-title'),
        speedSettings: byId('time-attack-options'),
        startSpeed: byId('start-time-attack-game-button'),
        speedGame: byId('time-attack-game-area'),
        speedTimer: byId('time-attack-timer'),
        speedErrors: byId('time-attack-errors'),
        speedRemaining: byId('time-attack-remaining'),
        speedQuestion: byId('time-attack-question'),
        speedOptions: byId('time-attack-grid'),
        speedResults: byId('time-attack-results'),
        collectionLearned: byId('collection-learned-count'),
        collectionProgress: byId('collection-progress-fill'),
        collectionReview: byId('collection-review-count'),
        collectionTabs: byId('collection-tabs'),
        collectionPagination: byId('collection-pagination'),
        collectionPreviousPage: byId('collection-previous-page'),
        collectionNextPage: byId('collection-next-page'),
        collectionPageRange: byId('collection-page-range'),
        collectionPageIndicator: byId('collection-page-indicator'),
        collectionGrid: byId('collection-grid'),
        collectionEmpty: byId('collection-empty-state'),
        collectionEmptyTitle: byId('collection-empty-title'),
        collectionEmptyCopy: byId('collection-empty-copy'),
        collectionExplore: byId('collection-explore-button'),
        collectionMap: byId('collection-map'),
        collectionMapViewport: byId('collection-map-viewport'),
        collectionMapStatus: byId('collection-map-status'),
        collectionMapNext: byId('collection-map-next-button'),
        collectionMapProgressLabel: byId('collection-map-progress-label'),
        collectionNextMilestone: byId('collection-next-milestone'),
        collectionRank: byId('collection-rank'),
        toast: byId('toast')
    };

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function parseName(constellation) {
        const match = String(constellation.name || '').match(/^(.*?)\s*\((.*?)\)\s*$/);
        return {
            korean: match ? match[1] : String(constellation.name || ''),
            english: match ? match[2] : String(constellation.name || '')
        };
    }

    function keyFor(constellation) {
        return parseName(constellation).english;
    }

    function readSet(storageKey, validKeys) {
        try {
            const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!Array.isArray(parsed)) return new Set();
            return new Set(parsed.filter((item) => typeof item === 'string' && validKeys.has(item)));
        } catch (error) {
            return new Set();
        }
    }

    function writeSet(storageKey, set) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
        } catch (error) {
            // The atlas remains usable when storage is unavailable.
        }
    }

    function readMagnitude() {
        try {
            const value = Number.parseFloat(localStorage.getItem(STORAGE_KEYS.magnitude));
            if (value >= 3.5 && value <= 5.5) return value;
        } catch (error) {
            // Use the default below.
        }
        return 5.2;
    }

    function setHidden(element, hidden) {
        if (!element) return;
        element.classList.toggle('hidden', hidden);
        element.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }

    function shuffled(items) {
        const result = Array.from(items);
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function formatTime(milliseconds) {
        const seconds = Math.max(0, Math.floor(milliseconds / 1000));
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    }

    function todayIndex(length) {
        const now = new Date();
        const token = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        let hash = 0;
        for (const character of token) hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
        return hash % length;
    }

    let atlas;
    try {
        if (typeof constellations === 'undefined' || typeof SKY_LINES === 'undefined' || typeof SKY_STARS === 'undefined') {
            throw new Error('별자리 데이터가 준비되지 않았습니다.');
        }
        atlas = Array.from(constellations).sort((left, right) => (
            parseName(left).korean.localeCompare(parseName(right).korean, 'ko')
        ));
    } catch (error) {
        if (elements.app) {
            elements.app.innerHTML = `<section class="empty-state"><h1>별지도를 열지 못했어요</h1><p>${escapeHTML(error.message)}</p></section>`;
        }
        return;
    }

    const byAbbr = new Map(atlas.map((item) => [String(item.abbr).toLowerCase(), item]));
    const byEnglish = new Map(atlas.map((item) => [keyFor(item).toLowerCase(), item]));
    const validStorageKeys = new Set(atlas.map(keyFor));

    const state = {
        filter: 'all',
        query: '',
        atlasPage: 0,
        collection: 'learned',
        collectionPages: {
            learned: 0,
            review: 0
        },
        current: null,
        featured: atlas[todayIndex(atlas.length)],
        learned: readSet(STORAGE_KEYS.learned, validStorageKeys),
        mistakes: readSet(STORAGE_KEYS.mistakes, validStorageKeys),
        magnitude: readMagnitude(),
        detailOpenedInternally: false,
        detailReturnHash: '#explore',
        currentRoute: '',
        routeRenderToken: 0,
        quiz: null,
        speed: null,
        sky: null,
        toastTimer: 0,
        resizeTimer: 0,
        mapPointer: null,
        mapSuppressClickUntil: 0,
        mapScrollLeft: null,
        mapScrollRatio: 0.5,
        scroll: Object.create(null)
    };

    function miniSkySVG(constellation) {
        const abbreviation = constellation.abbr;
        if (miniSvgCache.has(abbreviation)) return miniSvgCache.get(abbreviation);

        const geometry = skyGeometry(constellation, 160, 104);
        if (!geometry) {
            const fallback = '<svg class="mini-sky" viewBox="0 0 160 104" aria-hidden="true" focusable="false"><circle cx="80" cy="52" r="2.5"/></svg>';
            miniSvgCache.set(abbreviation, fallback);
            return fallback;
        }

        const polylines = geometry.lines.map((line) => {
            const coords = line.map((point) => geometry.project(point[0], point[1]))
                .filter(Boolean)
                .map((point) => geometry.toScreen(point).map((value) => value.toFixed(2)).join(','))
                .join(' ');
            return `<polyline points="${coords}"/>`;
        }).join('');
        const uniquePoints = new Map();
        geometry.lines.flat().forEach((point) => {
            const projected = geometry.project(point[0], point[1]);
            if (!projected) return;
            const screen = geometry.toScreen(projected);
            const token = `${screen[0].toFixed(1)}:${screen[1].toFixed(1)}`;
            uniquePoints.set(token, screen);
        });
        const dots = Array.from(uniquePoints.values()).map((point, index) => (
            `<circle cx="${point[0].toFixed(2)}" cy="${point[1].toFixed(2)}" r="${index === 0 ? '2.4' : '1.8'}"/>`
        )).join('');
        const svg = `<svg class="mini-sky" viewBox="0 0 160 104" aria-hidden="true" focusable="false"><g class="mini-lines">${polylines}</g><g class="mini-stars">${dots}</g></svg>`;
        miniSvgCache.set(abbreviation, svg);
        return svg;
    }

    function tagMarkup(text, className) {
        if (!text) return '';
        return `<span class="tag ${escapeHTML(className || '')}">${escapeHTML(text)}</span>`;
    }

    function statusText(constellation) {
        const key = keyFor(constellation);
        const statuses = [];
        if (state.learned.has(key)) statuses.push('나의 별자리에 등록');
        if (state.mistakes.has(key)) statuses.push('복습 필요');
        return statuses.join(', ');
    }

    function cardMarkup(constellation) {
        const index = atlas.indexOf(constellation);
        const names = parseName(constellation);
        const key = keyFor(constellation);
        const learned = state.learned.has(key);
        const review = state.mistakes.has(key);
        const stateClasses = [
            learned ? 'is-learned' : '',
            review ? 'needs-review' : ''
        ].filter(Boolean).join(' ');
        const status = statusText(constellation);
        const firstSeason = Array.isArray(constellation.seas) && constellation.seas.length
            ? constellation.seas[0]
            : '';
        const tags = [
            firstSeason ? tagMarkup(firstSeason, `season-${firstSeason}`) : '',
            tagMarkup(constellation.hemi === '북' ? '북쪽 하늘' : '남쪽 하늘', `hemi-${constellation.hemi}`),
            constellation.zod ? tagMarkup('황도 12궁', 'zodiac') : ''
        ].filter(Boolean).slice(0, 2).join('');
        const accessibleStatus = status ? `, ${status}` : ', 미발견';

        return `
            <button class="constellation-list-item ${stateClasses}" type="button" data-abbr="${escapeHTML(constellation.abbr)}"
                aria-label="${escapeHTML(names.korean)}, ${escapeHTML(names.english)}${escapeHTML(accessibleStatus)}">
                <span class="card-map">
                    ${miniSkySVG(constellation)}
                    <span class="card-top">
                        <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
                        <span class="card-status" aria-hidden="true">${learned ? '✓' : ''}${review ? ' ↻' : ''}</span>
                    </span>
                </span>
                <span class="card-name">${escapeHTML(names.korean)}</span>
                <span class="card-english">${escapeHTML(names.english)} · ${escapeHTML(constellation.abbr)}</span>
                <span class="card-tags">${tags}</span>
            </button>
        `;
    }

    function matchesFilter(constellation) {
        const key = keyFor(constellation);
        switch (state.filter) {
            case '봄':
            case '여름':
            case '가을':
            case '겨울':
                return Array.isArray(constellation.seas) && constellation.seas.includes(state.filter);
            case 'zodiac':
                return Boolean(constellation.zod);
            case '북':
            case '남':
                return constellation.hemi === state.filter;
            case 'unlearned':
                return !state.learned.has(key);
            case 'learned':
                return state.learned.has(key);
            default:
                return true;
        }
    }

    function matchesSearch(constellation) {
        const term = state.query.trim().normalize('NFKC').toLocaleLowerCase('ko');
        if (!term) return true;
        const names = parseName(constellation);
        return [
            names.korean,
            names.english,
            constellation.abbr,
            constellation.mean,
            constellation.star,
            constellation.deep
        ].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ko').includes(term);
    }

    function paginate(items, requestedPage) {
        const pageCount = Math.ceil(items.length / LIST_PAGE_SIZE);
        const page = pageCount
            ? Math.max(0, Math.min(Number(requestedPage) || 0, pageCount - 1))
            : 0;
        const start = page * LIST_PAGE_SIZE;
        return {
            page,
            pageCount,
            start,
            end: Math.min(start + LIST_PAGE_SIZE, items.length),
            total: items.length,
            items: items.slice(start, start + LIST_PAGE_SIZE)
        };
    }

    function updateListPagination(controls, page) {
        const hasMultiplePages = page.pageCount > 1;
        setHidden(controls.container, !hasMultiplePages);
        controls.previous.disabled = page.page === 0;
        controls.next.disabled = page.pageCount === 0 || page.page >= page.pageCount - 1;
        controls.range.textContent = page.total
            ? `${page.start + 1}–${page.end} / ${page.total}`
            : '0 / 0';
        controls.indicator.textContent = page.pageCount
            ? `${page.page + 1} / ${page.pageCount} 페이지`
            : '페이지 없음';
    }

    function renderAtlas() {
        const results = atlas.filter((item) => matchesFilter(item) && matchesSearch(item));
        const page = paginate(results, state.atlasPage);
        state.atlasPage = page.page;
        elements.atlasGrid.innerHTML = page.items.map(cardMarkup).join('');
        elements.atlasCount.textContent = `${results.length}개`;
        updateListPagination({
            container: elements.atlasPagination,
            previous: elements.atlasPreviousPage,
            next: elements.atlasNextPage,
            range: elements.atlasPageRange,
            indicator: elements.atlasPageIndicator
        }, page);
        setHidden(elements.atlasEmpty, results.length !== 0);
        setHidden(elements.clearSearch, !state.query);
        elements.filterLabel.textContent = FILTER_LABELS[state.filter] || '전체';
        elements.filterToggle.setAttribute('aria-label', `필터: ${FILTER_LABELS[state.filter] || '전체'}`);

        const summary = elements.activeFilterSummary.querySelector('span');
        const filterText = state.filter === 'all' ? '전체 별자리' : `${FILTER_LABELS[state.filter]} 별자리`;
        summary.textContent = state.query ? `${filterText} · “${state.query}” 검색 결과` : filterText;
        setHidden(elements.resetFilter, state.filter === 'all' && !state.query);

        elements.filterDialog.querySelectorAll('[data-filter]').forEach((button) => {
            const active = button.dataset.filter === state.filter;
            button.classList.toggle('selected', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function nextUnlearned() {
        return atlas.find((item) => !state.learned.has(keyFor(item))) || state.featured;
    }

    function renderFeatured() {
        const names = parseName(state.featured);
        elements.featuredMap.innerHTML = miniSkySVG(state.featured);
        elements.featuredName.textContent = names.korean;
        elements.featuredEnglish.textContent = `${names.english.toUpperCase()} · ${state.featured.abbr}`;
        elements.featured.setAttribute('aria-label', `오늘의 별자리 ${names.korean} 열기`);
    }

    function updateProgress() {
        const total = atlas.length;
        const learnedCount = state.learned.size;
        const percentage = total ? (learnedCount / total) * 100 : 0;
        elements.headerProgressCount.textContent = String(learnedCount);
        elements.headerProgress.setAttribute('aria-label', `나의 별자리 보기, ${total}개 중 ${learnedCount}개 등록`);
        elements.headerProgressRing.style.setProperty('--progress', `${percentage}%`);
        elements.headerProgressRing.style.setProperty('--progress-angle', `${percentage * 3.6}deg`);
        elements.collectionLearned.textContent = String(learnedCount);
        elements.collectionProgress.style.width = `${percentage}%`;
        elements.collectionReview.textContent = String(state.mistakes.size);

        const target = nextUnlearned();
        const targetName = parseName(target).korean;
        elements.continueLabel.textContent = learnedCount
            ? (learnedCount === total ? '완성한 별지도 보기' : `다음 학습 · ${targetName}`)
            : '첫 별자리 학습하기';
        elements.welcomeMessage.textContent = learnedCount
            ? `${total}개 중 ${learnedCount}개의 별자리가 빛나고 있어요. 다음 별을 이어 보세요.`
            : '별의 모양과 이야기를 따라 나만의 별지도를 채워 보세요.';
    }

    function showToast(message) {
        window.clearTimeout(state.toastTimer);
        elements.toast.textContent = message;
        elements.toast.classList.add('show');
        state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('show'), 2400);
    }

    function fullscreenElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function updateFullscreenButton() {
        const active = Boolean(fullscreenElement());
        elements.fullscreen.classList.toggle('is-active', active);
        elements.fullscreen.setAttribute('aria-pressed', active ? 'true' : 'false');
        elements.fullscreen.setAttribute('aria-label', active ? '전체화면 종료' : '전체화면 시작');
        elements.fullscreen.title = active ? '전체화면 종료' : '전체화면';
        document.body.classList.toggle('fullscreen-active', active);
    }

    async function toggleFullscreen() {
        try {
            if (fullscreenElement()) {
                const exit = document.exitFullscreen || document.webkitExitFullscreen;
                if (exit) await exit.call(document);
                return;
            }

            const target = document.documentElement;
            const request = target.requestFullscreen || target.webkitRequestFullscreen;
            if (!request) {
                showToast('이 브라우저는 전체화면 전환을 지원하지 않아요');
                return;
            }
            if (target.requestFullscreen) {
                await request.call(target, { navigationUI: 'hide' });
            } else {
                await request.call(target);
            }
        } catch (error) {
            showToast('전체화면을 시작하지 못했어요. 브라우저 설정을 확인해 주세요.');
        } finally {
            updateFullscreenButton();
        }
    }

    function openFilterDialog() {
        elements.filterToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('dialog-open');
        if (typeof elements.filterDialog.showModal === 'function') {
            if (!elements.filterDialog.open) elements.filterDialog.showModal();
        } else {
            elements.filterDialog.setAttribute('open', '');
        }
        const active = Array.from(elements.filterDialog.querySelectorAll('[data-filter]'))
            .find((button) => button.dataset.filter === state.filter);
        if (active) window.setTimeout(() => active.focus(), 0);
    }

    function closeFilterDialog() {
        elements.filterToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('dialog-open');
        if (typeof elements.filterDialog.close === 'function' && elements.filterDialog.open) {
            elements.filterDialog.close();
        } else {
            elements.filterDialog.removeAttribute('open');
        }
    }

    function routeHash(hash) {
        const normalized = hash.startsWith('#') ? hash : `#${hash}`;
        if (window.location.hash === normalized) {
            renderRoute();
            return;
        }
        window.location.hash = normalized;
    }

    function routeOrScrollTop(hash) {
        const normalized = hash.startsWith('#') ? hash : `#${hash}`;
        if (window.location.hash === normalized) {
            scrollAppTo(0, 'smooth');
            return;
        }
        routeHash(normalized);
    }

    function scrollAppTo(top, behavior = 'auto') {
        elements.app.scrollTo({ top: Math.max(0, Number(top) || 0), left: 0, behavior });
    }

    function scrollAppToElement(element, behavior = 'auto') {
        if (!element) return;
        const appBounds = elements.app.getBoundingClientRect();
        const targetBounds = element.getBoundingClientRect();
        scrollAppTo(elements.app.scrollTop + targetBounds.top - appBounds.top, behavior);
    }

    function replaceRoute(hash) {
        const normalized = hash.startsWith('#') ? hash : `#${hash}`;
        history.replaceState(null, '', normalized);
        renderRoute();
    }

    function openConstellation(constellation) {
        if (!constellation) return;
        if (!state.currentRoute.startsWith('constellation/')) {
            state.detailReturnHash = window.location.hash || '#explore';
            state.detailOpenedInternally = true;
        }
        routeHash(`#constellation/${constellation.abbr}`);
    }

    function findRouteConstellation(token) {
        let decoded;
        try {
            decoded = decodeURIComponent(token || '');
        } catch (error) {
            decoded = token || '';
        }
        return byAbbr.get(decoded.toLowerCase()) || byEnglish.get(decoded.replace(/-/g, ' ').toLowerCase()) || null;
    }

    function parseRoute() {
        const raw = window.location.hash.replace(/^#\/?/, '') || 'explore';
        const parts = raw.split('/').filter(Boolean);
        if (parts[0] === 'constellation') {
            return { kind: 'detail', key: `constellation/${parts[1] || ''}`, item: findRouteConstellation(parts[1]) };
        }
        if (parts[0] === 'challenge') {
            const panel = parts[1] === 'speed' ? 'speed' : 'quiz';
            return { kind: 'challenge', key: `challenge/${panel}`, panel };
        }
        if (parts[0] === 'collection') {
            const collection = parts[1] === 'review' ? 'review' : 'learned';
            return { kind: 'collection', key: `collection/${collection}`, collection };
        }
        return { kind: 'explore', key: 'explore' };
    }

    function saveScrollForCurrentRoute() {
        if (state.currentRoute && !state.currentRoute.startsWith('constellation/')) {
            state.scroll[state.currentRoute] = elements.app.scrollTop;
        }
    }

    function updatePrimaryNavigation(activeView) {
        elements.modeSelection.querySelectorAll('[data-view]').forEach((button) => {
            const selected = button.dataset.view === activeView;
            button.classList.toggle('selected', selected);
            if (selected) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
    }

    function showPrimaryView(view, navigationView = view) {
        setHidden(elements.exploreView, view !== 'explore');
        setHidden(elements.challengeView, view !== 'challenge');
        setHidden(elements.collectionView, view !== 'collection');
        updatePrimaryNavigation(navigationView);
    }

    function focusElement(element) {
        if (!element) return;
        element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
    }

    function focusRouteHeading(route) {
        let heading = null;
        if (route.kind === 'detail') heading = byId('detail-title');
        else if (route.kind === 'challenge' && route.panel === 'quiz') heading = elements.quizQuestion.querySelector('h2');
        else if (route.kind === 'challenge' && route.panel === 'speed' && state.speed?.active) {
            heading = elements.speedOptions.querySelector('button:not([disabled])') || elements.speedQuestion.querySelector('h2');
        } else if (route.kind === 'challenge' && route.panel === 'speed') heading = elements.speedTitle;
        else if (route.kind === 'challenge') heading = byId('challenge-heading');
        else if (route.kind === 'collection') heading = byId('collection-heading');
        else heading = byId('explore-heading');
        focusElement(heading);
    }

    function cleanupSky() {
        if (!state.sky) return;
        if (state.sky.raf) cancelAnimationFrame(state.sky.raf);
        if (state.sky.observer) state.sky.observer.disconnect();
        state.sky = null;
    }

    function cleanupQuiz() {
        state.quiz = null;
    }

    function cleanupSpeed() {
        if (!state.speed) return;
        window.clearInterval(state.speed.interval);
        window.clearTimeout(state.speed.advanceTimer);
        state.speed.active = false;
        state.speed = null;
    }

    function cleanupForRouteChange(previousRoute, nextRoute) {
        if (previousRoute.startsWith('constellation/') && !nextRoute.startsWith('constellation/')) cleanupSky();
        if (previousRoute === 'challenge/quiz' && nextRoute !== 'challenge/quiz') cleanupQuiz();
        if (previousRoute === 'challenge/speed' && nextRoute !== 'challenge/speed') cleanupSpeed();
    }

    function renderExplore() {
        showPrimaryView('explore');
        setHidden(elements.exploreList, false);
        setHidden(elements.detailScreen, true);
        document.body.classList.remove('detail-open', 'game-open');
        document.body.dataset.route = 'explore';
        renderFeatured();
        renderAtlas();
        updateProgress();
    }

    function detailTags(constellation) {
        const tags = [];
        (constellation.seas || []).forEach((season) => tags.push(tagMarkup(`${season} 관측`, `season-${season}`)));
        tags.push(tagMarkup(constellation.hemi === '북' ? '북쪽 하늘' : '남쪽 하늘', `hemi-${constellation.hemi}`));
        if (constellation.zod) tags.push(tagMarkup('황도 12궁', 'zodiac'));
        return tags.join('');
    }

    function infoRow(label, value) {
        if (!value) return '';
        return `<div class="info-row"><span class="info-key">${escapeHTML(label)}</span><span class="info-val">${escapeHTML(value)}</span></div>`;
    }

    function infoBlock(label, value) {
        if (!value) return '';
        return `<section class="info-block"><span class="info-key">${escapeHTML(label)}</span><p class="info-text">${escapeHTML(value)}</p></section>`;
    }

    function storyBlock(constellation) {
        const key = keyFor(constellation);
        const detailedStory = STORY_DETAILS[key];
        const paragraphs = Array.isArray(detailedStory) && detailedStory.length
            ? detailedStory
            : (constellation.story ? [constellation.story] : []);
        if (!paragraphs.length) return '';

        const headingId = `story-heading-${String(constellation.abbr || key).toLowerCase()}`;
        const storyCopy = paragraphs
            .filter(Boolean)
            .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
            .join('');
        const webtoon = STORY_WEBTOONS[key];
        const webtoonMarkup = webtoon ? `
            <div class="story-webtoon">
                <header class="story-webtoon-heading">
                    <strong>${escapeHTML(webtoon.title || '별자리 웹툰')}</strong>
                    <span>${escapeHTML(webtoon.episode || 'WEBTOON')}</span>
                </header>
                <figure>
                    <img src="${escapeHTML(webtoon.src)}" width="${webtoon.width}" height="${webtoon.height}"
                        loading="lazy" decoding="async" alt="${escapeHTML(webtoon.alt)}">
                </figure>
            </div>
        ` : '';

        return `
            <details class="story-block" aria-labelledby="${headingId}" open>
                <summary class="story-block-heading">
                    <span id="${headingId}" class="info-key">별에 얽힌 이야기</span>
                    <span class="story-block-heading-meta">
                        <span>MYTH &amp; LORE</span>
                        <svg class="story-block-chevron" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m8 10 4 4 4-4"/>
                        </svg>
                    </span>
                </summary>
                <div class="story-block-body">
                    ${webtoonMarkup}
                    <div class="story-copy">${storyCopy}</div>
                </div>
            </details>
        `;
    }

    function renderDetailCopy(constellation) {
        const names = parseName(constellation);
        elements.constellationName.innerHTML = `
            <p class="detail-eyebrow">${escapeHTML(names.english.toUpperCase())} <span>· ${escapeHTML(constellation.abbr)}</span></p>
            <h1 id="detail-title"><span class="title-core">${escapeHTML(names.korean)}</span></h1>
            <p class="detail-english">${escapeHTML(names.english)} · ${escapeHTML(constellation.mean || '')}</p>
            <div class="detail-tags">${detailTags(constellation)}</div>
        `;
        elements.description.innerHTML = `
            <p class="info-lead">${escapeHTML(constellation.description || '')}</p>
            <div class="info-grid">
                ${infoRow('IAU 약어', constellation.abbr)}
                ${infoRow('이름의 뜻', constellation.mean)}
                ${infoRow('대표 별', constellation.star)}
                ${infoRow('주요 천체', constellation.deep)}
                ${infoRow('관측 계절', constellation.season)}
                ${infoRow('하늘 위치', constellation.location)}
            </div>
            ${storyBlock(constellation)}
            ${infoBlock('모양과 특징', constellation.characteristics)}
            ${infoBlock('알아두면 좋은 사실', constellation.fact)}
        `;
    }

    function updateDetailActions(constellation) {
        const key = keyFor(constellation);
        const learned = state.learned.has(key);
        elements.complete.classList.toggle('is-complete', learned);
        elements.complete.setAttribute('aria-pressed', learned ? 'true' : 'false');
        elements.complete.disabled = false;
        elements.complete.querySelector('span').textContent = learned ? '등록됨' : '나의 별자리';
        const actionLabel = learned
            ? `${parseName(constellation).korean}를 나의 별자리에서 해제`
            : `${parseName(constellation).korean}를 나의 별자리에 등록`;
        elements.complete.setAttribute('aria-label', actionLabel);
        elements.complete.title = actionLabel;
    }

    function renderDetail(constellation) {
        if (!constellation) {
            replaceRoute('#explore');
            return;
        }
        showPrimaryView('explore');
        setHidden(elements.exploreList, true);
        setHidden(elements.detailScreen, false);
        document.body.classList.add('detail-open');
        document.body.classList.remove('game-open');
        document.body.dataset.route = 'detail';
        state.current = constellation;

        const index = atlas.indexOf(constellation);
        const previous = atlas[(index - 1 + atlas.length) % atlas.length];
        const next = atlas[(index + 1) % atlas.length];
        elements.detailPosition.textContent = `${String(index + 1).padStart(2, '0')} / ${atlas.length}`;
        elements.prevName.textContent = parseName(previous).korean;
        elements.nextName.textContent = parseName(next).korean;
        renderDetailCopy(constellation);
        updateDetailActions(constellation);
        renderSky(constellation);
        updateProgress();
    }

    function vectorFor(raDegrees, decDegrees) {
        const ra = raDegrees * Math.PI / 180;
        const dec = decDegrees * Math.PI / 180;
        const cosDec = Math.cos(dec);
        return [cosDec * Math.cos(ra), cosDec * Math.sin(ra), Math.sin(dec)];
    }

    function coordinatesFor(vector) {
        return [
            Math.atan2(vector[1], vector[0]) * 180 / Math.PI,
            Math.asin(Math.max(-1, Math.min(1, vector[2]))) * 180 / Math.PI
        ];
    }

    function projectionAround(raDegrees, decDegrees) {
        const ra0 = raDegrees * Math.PI / 180;
        const dec0 = decDegrees * Math.PI / 180;
        const sinDec0 = Math.sin(dec0);
        const cosDec0 = Math.cos(dec0);
        return function project(raValue, decValue) {
            const ra = raValue * Math.PI / 180;
            const dec = decValue * Math.PI / 180;
            const cosDistance = sinDec0 * Math.sin(dec) + cosDec0 * Math.cos(dec) * Math.cos(ra - ra0);
            if (cosDistance <= -0.98) return null;
            const factor = 2 / (1 + cosDistance);
            return [
                factor * Math.cos(dec) * Math.sin(ra - ra0),
                factor * (cosDec0 * Math.sin(dec) - sinDec0 * Math.cos(dec) * Math.cos(ra - ra0))
            ];
        };
    }

    function colorForBV(value) {
        if (value < 0) return 'rgb(178, 207, 255)';
        if (value < 0.35) return 'rgb(220, 232, 255)';
        if (value < 0.75) return 'rgb(255, 249, 226)';
        if (value < 1.2) return 'rgb(255, 223, 177)';
        return 'rgb(255, 183, 131)';
    }

    function skyGeometry(constellation, width, height) {
        const lines = SKY_LINES[constellation.abbr] || [];
        const vertices = lines.flat();
        if (!vertices.length) return null;

        let center = [0, 0, 0];
        vertices.forEach((point) => {
            const vector = vectorFor(point[0], point[1]);
            center = center.map((value, index) => value + vector[index]);
        });
        const magnitude = Math.hypot(...center) || 1;
        center = center.map((value) => value / magnitude);
        const centerCoordinates = coordinatesFor(center);
        const project = projectionAround(centerCoordinates[0], centerCoordinates[1]);
        const projectedVertices = vertices.map((point) => project(point[0], point[1])).filter(Boolean);
        const minX = Math.min(...projectedVertices.map((point) => point[0]));
        const maxX = Math.max(...projectedVertices.map((point) => point[0]));
        const minY = Math.min(...projectedVertices.map((point) => point[1]));
        const maxY = Math.max(...projectedVertices.map((point) => point[1]));
        const spanX = Math.max(maxX - minX, 0.001);
        const spanY = Math.max(maxY - minY, 0.001);
        const scale = Math.min((width * 0.76) / spanX, (height * 0.72) / spanY);
        const middleX = (minX + maxX) / 2;
        const middleY = (minY + maxY) / 2;
        const toScreen = (point) => [
            width / 2 - (point[0] - middleX) * scale,
            height / 2 - (point[1] - middleY) * scale
        ];
        return { lines, project, toScreen, scale };
    }

    function drawSky(canvas, constellation) {
        const cssWidth = Math.max(280, Math.round(canvas.clientWidth || canvas.parentElement.clientWidth || 320));
        const cssHeight = Math.max(260, Math.round(canvas.clientHeight || 340));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        const context = canvas.getContext('2d');
        if (!context) return;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, cssWidth, cssHeight);

        const background = context.createRadialGradient(cssWidth * 0.48, cssHeight * 0.42, 8, cssWidth * 0.5, cssHeight * 0.5, Math.max(cssWidth, cssHeight) * 0.75);
        background.addColorStop(0, 'rgba(45, 67, 108, 0.36)');
        background.addColorStop(0.55, 'rgba(12, 24, 48, 0.42)');
        background.addColorStop(1, 'rgba(3, 8, 20, 0.92)');
        context.fillStyle = background;
        context.fillRect(0, 0, cssWidth, cssHeight);

        const geometry = skyGeometry(constellation, cssWidth, cssHeight);
        if (!geometry) return;
        const visibleStars = [];
        SKY_STARS.forEach((star) => {
            if (star[2] > state.magnitude) return;
            const projected = geometry.project(star[0], star[1]);
            if (!projected) return;
            const screen = geometry.toScreen(projected);
            if (screen[0] < -12 || screen[0] > cssWidth + 12 || screen[1] < -12 || screen[1] > cssHeight + 12) return;
            visibleStars.push({ x: screen[0], y: screen[1], magnitude: star[2], bv: star[3] });
        });

        visibleStars.forEach((star) => {
            const radius = Math.max(0.65, 0.6 + (state.magnitude - star.magnitude) * 0.46);
            if (radius > 1.55) {
                const halo = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius * 4);
                halo.addColorStop(0, 'rgba(216, 232, 255, 0.55)');
                halo.addColorStop(1, 'rgba(216, 232, 255, 0)');
                context.fillStyle = halo;
                context.beginPath();
                context.arc(star.x, star.y, radius * 4, 0, Math.PI * 2);
                context.fill();
            }
            context.fillStyle = colorForBV(star.bv);
            context.globalAlpha = Math.max(0.54, Math.min(1, 1.08 - (star.magnitude * 0.07)));
            context.beginPath();
            context.arc(star.x, star.y, radius, 0, Math.PI * 2);
            context.fill();
        });
        context.globalAlpha = 1;

        context.strokeStyle = 'rgba(117, 211, 239, 0.82)';
        context.lineWidth = 1.35;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.shadowColor = 'rgba(72, 188, 226, 0.5)';
        context.shadowBlur = 8;
        geometry.lines.forEach((line) => {
            context.beginPath();
            let started = false;
            line.forEach((point) => {
                const projected = geometry.project(point[0], point[1]);
                if (!projected) {
                    started = false;
                    return;
                }
                const screen = geometry.toScreen(projected);
                if (!started) {
                    context.moveTo(screen[0], screen[1]);
                    started = true;
                } else {
                    context.lineTo(screen[0], screen[1]);
                }
            });
            context.stroke();
        });
        context.shadowBlur = 0;

        const constellationPoints = geometry.lines.flat();
        constellationPoints.forEach((point) => {
            const projected = geometry.project(point[0], point[1]);
            if (!projected) return;
            const screen = geometry.toScreen(projected);
            context.fillStyle = '#f8fbff';
            context.shadowColor = 'rgba(159, 221, 255, 0.9)';
            context.shadowBlur = 9;
            context.beginPath();
            context.arc(screen[0], screen[1], 2.25, 0, Math.PI * 2);
            context.fill();
        });
        context.shadowBlur = 0;
    }

    function magnitudeLabel() {
        if (state.magnitude < 4.3) return '도시 하늘';
        if (state.magnitude < 5.0) return '교외 하늘';
        return '청정 하늘';
    }

    function renderSky(constellation) {
        cleanupSky();
        elements.imageContainer.innerHTML = `
            <section class="sky-block" aria-label="${escapeHTML(parseName(constellation).korean)} 실제 성도">
                <div class="sky-chart-wrap">
                    <canvas class="sky-chart" role="img" aria-label="${escapeHTML(parseName(constellation).korean)}의 실제 별 배치"></canvas>
                </div>
                <div class="sky-controls">
                    <label class="sky-mag-label" for="sky-magnitude">보이는 별 <b>${escapeHTML(magnitudeLabel())}</b></label>
                    <input id="sky-magnitude" class="sky-slider" type="range" min="3.5" max="5.5" step="0.1" value="${state.magnitude}" aria-label="성도에 표시할 별의 밝기 한계" aria-valuetext="${escapeHTML(magnitudeLabel())}">
                </div>
                <p class="sky-legend">실측 항성 위치와 IAU 별자리 이음선을 바탕으로 그린 성도입니다. 슬라이더로 관측 환경을 바꿔보세요.</p>
            </section>
        `;
        const canvas = elements.imageContainer.querySelector('.sky-chart');
        const slider = elements.imageContainer.querySelector('.sky-slider');
        const label = elements.imageContainer.querySelector('.sky-mag-label b');
        const draw = () => drawSky(canvas, constellation);
        state.sky = { canvas, constellation, observer: null, raf: requestAnimationFrame(draw) };

        if (typeof ResizeObserver === 'function') {
            let previousWidth = 0;
            state.sky.observer = new ResizeObserver((entries) => {
                const width = Math.round(entries[0].contentRect.width);
                if (width === previousWidth) return;
                previousWidth = width;
                requestAnimationFrame(draw);
            });
            state.sky.observer.observe(canvas.parentElement);
        }

        slider.addEventListener('input', () => {
            state.magnitude = Number.parseFloat(slider.value);
            label.textContent = magnitudeLabel();
            slider.setAttribute('aria-valuetext', magnitudeLabel());
            try {
                localStorage.setItem(STORAGE_KEYS.magnitude, String(state.magnitude));
            } catch (error) {
                // Keep the in-memory setting.
            }
            draw();
        });
    }

    function toggleCurrentConstellation() {
        if (!state.current) return;
        const key = keyFor(state.current);
        const wasLearned = state.learned.has(key);
        if (wasLearned) state.learned.delete(key);
        else state.learned.add(key);
        writeSet(STORAGE_KEYS.learned, state.learned);
        updateDetailActions(state.current);
        updateProgress();
        showToast(wasLearned
            ? `${parseName(state.current).korean}를 나의 별자리에서 해제했어요`
            : `${parseName(state.current).korean}를 나의 별자리에 등록했어요`);
    }

    function renderChallenge(panel, enteringPanel) {
        showPrimaryView('challenge', panel === 'hub' ? '' : (panel === 'speed' ? 'speed' : 'quiz'));
        document.body.classList.remove('detail-open');
        document.body.classList.toggle('game-open', panel !== 'hub');
        document.body.dataset.route = panel === 'hub' ? 'challenge' : `challenge-${panel}`;
        setHidden(elements.challengeHub, panel !== 'hub');
        setHidden(elements.quizPanel, panel !== 'quiz');
        setHidden(elements.speedPanel, panel !== 'speed');

        if (panel === 'quiz' && (enteringPanel || !state.quiz)) startQuiz();
        if (panel === 'speed' && (enteringPanel || !state.speed)) showSpeedSettings();
    }

    function createChoiceSet(target) {
        const others = shuffled(atlas.filter((item) => item !== target)).slice(0, 3);
        return shuffled([target, ...others]);
    }

    function quizPrompt(target, type) {
        const names = parseName(target);
        switch (type) {
            case 'star':
                return {
                    kicker: '대표 별',
                    prompt: '이 별이 빛나는 별자리는?',
                    clue: target.star
                };
            case 'abbr':
                return {
                    kicker: 'IAU 약어',
                    prompt: '이 국제 약어를 사용하는 별자리는?',
                    clue: target.abbr
                };
            case 'meaning':
                return {
                    kicker: '이름의 뜻',
                    prompt: '이 뜻을 가진 별자리는?',
                    clue: target.mean
                };
            case 'deep':
                return {
                    kicker: '주요 천체',
                    prompt: '이 천체들을 품은 별자리는?',
                    clue: target.deep
                };
            case 'reverseStar':
                return {
                    kicker: names.english.toUpperCase(),
                    prompt: `${names.korean}의 대표 별은?`,
                    clue: '별 이름을 골라보세요.'
                };
            default:
                return {
                    kicker: names.english.toUpperCase(),
                    prompt: '설명에 해당하는 별자리는?',
                    clue: target.description
                };
        }
    }

    function clueField(type) {
        if (type === 'description') return 'description';
        if (type === 'star' || type === 'reverseStar') return 'star';
        if (type === 'abbr') return 'abbr';
        if (type === 'meaning') return 'mean';
        if (type === 'deep') return 'deep';
        return '';
    }

    function hasUniqueClue(target, type) {
        const field = clueField(type);
        const clue = field ? String(target[field] || '').trim() : '';
        if (!clue) return false;
        return atlas.filter((item) => String(item[field] || '').trim() === clue).length === 1;
    }

    function createQuizQuestions(count) {
        const types = ['description', 'description', 'star', 'abbr', 'meaning', 'reverseStar'];
        return shuffled(atlas).slice(0, count).map((target) => {
            const eligibleTypes = types.filter((type) => hasUniqueClue(target, type));
            const type = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)] || 'abbr';
            return { target, type, choices: createChoiceSet(target) };
        });
    }

    function startQuiz() {
        state.quiz = {
            questions: createQuizQuestions(QUIZ_ROUNDS),
            index: 0,
            score: 0,
            answered: false,
            finished: false
        };
        setHidden(elements.quizResults, true);
        setHidden(elements.quizQuestion, false);
        setHidden(elements.quizOptions, false);
        renderQuizQuestion();
    }

    function optionMarkup(constellation, type) {
        const names = parseName(constellation);
        if (type === 'reverseStar') {
            return `
                <button class="option-button" type="button" data-abbr="${escapeHTML(constellation.abbr)}">
                    <strong>${escapeHTML(constellation.star)}</strong>
                    <small>대표 별 이름</small>
                </button>
            `;
        }
        return `
            <button class="option-button" type="button" data-abbr="${escapeHTML(constellation.abbr)}">
                <strong>${escapeHTML(names.korean)}</strong>
                <small>${escapeHTML(names.english)}</small>
            </button>
        `;
    }

    function renderQuizQuestion() {
        const quiz = state.quiz;
        if (!quiz || quiz.finished) return;
        const question = quiz.questions[quiz.index];
        const prompt = quizPrompt(question.target, question.type);
        quiz.answered = false;
        elements.quizRound.textContent = String(quiz.index + 1);
        elements.quizScore.textContent = `${quiz.score}점`;
        elements.quizProgress.style.width = `${(quiz.index / quiz.questions.length) * 100}%`;
        elements.quizQuestion.innerHTML = `
            <p class="question-kicker">${escapeHTML(prompt.kicker)}</p>
            <h2>${escapeHTML(prompt.prompt)}</h2>
            <p class="question-clue">${escapeHTML(prompt.clue)}</p>
        `;
        elements.quizOptions.innerHTML = question.choices.map((choice) => optionMarkup(choice, question.type)).join('');
        elements.quizFeedback.textContent = '';
        elements.quizFeedback.className = 'feedback hidden';
        setHidden(elements.nextQuiz, true);
        requestAnimationFrame(() => focusElement(elements.quizQuestion.querySelector('h2')));
    }

    function answerQuiz(selectedAbbr) {
        const quiz = state.quiz;
        if (!quiz || quiz.answered || quiz.finished) return;
        const question = quiz.questions[quiz.index];
        quiz.answered = true;
        const correct = selectedAbbr === question.target.abbr;
        const targetKey = keyFor(question.target);
        if (correct) {
            quiz.score += 1;
            state.mistakes.delete(targetKey);
        } else {
            state.mistakes.add(targetKey);
        }
        writeSet(STORAGE_KEYS.mistakes, state.mistakes);
        updateProgress();

        elements.quizOptions.querySelectorAll('.option-button').forEach((button) => {
            button.disabled = true;
            const isAnswer = button.dataset.abbr === question.target.abbr;
            const isSelected = button.dataset.abbr === selectedAbbr;
            if (isAnswer) button.classList.add('correct');
            if (isSelected && !correct) button.classList.add('incorrect');
        });
        elements.quizScore.textContent = `${quiz.score}점`;
        elements.quizFeedback.textContent = correct
            ? '정답이에요. 별 하나를 정확히 기억해냈습니다.'
            : `아쉬워요. 정답은 ${parseName(question.target).korean}입니다. 복습 목록에 담았어요.`;
        elements.quizFeedback.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
        elements.nextQuiz.textContent = quiz.index === quiz.questions.length - 1 ? '결과 보기' : '다음 문제';
        setHidden(elements.nextQuiz, false);
    }

    function advanceQuiz() {
        const quiz = state.quiz;
        if (!quiz || !quiz.answered) return;
        if (quiz.index >= quiz.questions.length - 1) {
            finishQuiz();
            return;
        }
        quiz.index += 1;
        renderQuizQuestion();
    }

    function finishQuiz() {
        const quiz = state.quiz;
        if (!quiz) return;
        quiz.finished = true;
        elements.quizProgress.style.width = '100%';
        setHidden(elements.quizQuestion, true);
        setHidden(elements.quizOptions, true);
        setHidden(elements.quizFeedback, true);
        setHidden(elements.nextQuiz, true);
        const percentage = Math.round((quiz.score / quiz.questions.length) * 100);
        const message = quiz.score >= 9
            ? '밤하늘이 아주 선명하게 기억나네요.'
            : quiz.score >= 6
                ? '좋아요. 헷갈린 별만 다시 보면 완성입니다.'
                : '복습 목록에서 별 모양을 한 번 더 만나보세요.';
        elements.quizResults.innerHTML = `
            <p class="result-kicker">10 ROUND COMPLETE</p>
            <h2 class="result-title">${escapeHTML(message)}</h2>
            <p class="result-score"><strong>${quiz.score}</strong><span>/ ${quiz.questions.length}</span></p>
            <div class="result-stats">
                <span><small>정답률</small><strong>${percentage}%</strong></span>
                <span><small>복습 필요</small><strong>${state.mistakes.size}</strong></span>
            </div>
            <div class="result-actions">
                <button class="primary-button" type="button" data-action="quiz-restart">다시 도전</button>
                <button class="secondary-button" type="button" data-action="open-review">복습 목록</button>
            </div>
        `;
        setHidden(elements.quizResults, false);
        requestAnimationFrame(() => focusElement(elements.quizResults.querySelector('.result-title')));
    }

    function showSpeedSettings() {
        cleanupSpeed();
        state.speed = {
            active: false,
            interval: 0,
            advanceTimer: 0
        };
        elements.speedTitle.textContent = '도전 설정';
        elements.speedOptions.classList.remove('is-board', 'is-transitioning');
        elements.speedOptions.innerHTML = '';
        setHidden(elements.speedSettings, false);
        setHidden(elements.speedGame, true);
        setHidden(elements.speedResults, true);
    }

    function speedPrompt(target, index) {
        const types = ['description', 'star', 'abbr', 'meaning'];
        const offset = index % types.length;
        const type = Array.from({ length: types.length }, (_, step) => types[(offset + step) % types.length])
            .find((candidate) => hasUniqueClue(target, candidate)) || 'abbr';
        return quizPrompt(target, type);
    }

    function speedChoiceMarkup(constellation, language) {
        const names = parseName(constellation);
        const label = language === 'en' ? names.english : names.korean;
        return `<button class="time-attack-button" type="button" data-abbr="${escapeHTML(constellation.abbr)}" aria-label="${escapeHTML(label)}">${escapeHTML(label)}</button>`;
    }

    function orderedSpeedBoard(constellationsForGame, language) {
        const nameKey = language === 'en' ? 'english' : 'korean';
        const locale = language === 'en' ? 'en' : 'ko';
        return Array.from(constellationsForGame).sort((left, right) => (
            parseName(left)[nameKey].localeCompare(parseName(right)[nameKey], locale)
        ));
    }

    function startSpeed() {
        const countInput = document.querySelector('input[name="difficulty"]:checked');
        const languageInput = document.querySelector('input[name="language"]:checked');
        const requestedCount = Number.parseInt(countInput ? countInput.value : '8', 10);
        const count = VALID_SPEED_COUNTS.has(requestedCount) ? requestedCount : 8;
        const language = languageInput && languageInput.value === 'en' ? 'en' : 'ko';
        const questions = shuffled(atlas).slice(0, count);
        cleanupSpeed();
        state.speed = {
            active: true,
            questions,
            board: orderedSpeedBoard(questions, language),
            index: 0,
            errors: 0,
            language,
            count,
            startedAt: Date.now(),
            pausedMilliseconds: 0,
            pauseStartedAt: 0,
            interval: 0,
            advanceTimer: 0,
            roundHadError: false,
            transitioning: false
        };
        setHidden(elements.speedSettings, true);
        setHidden(elements.speedResults, true);
        setHidden(elements.speedGame, false);
        elements.speedErrors.textContent = '0';
        elements.speedTimer.textContent = '00:00';
        elements.speedOptions.classList.remove('is-transitioning');
        elements.speedOptions.classList.add('is-board');
        elements.speedOptions.innerHTML = state.speed.board
            .map((constellation) => speedChoiceMarkup(constellation, language))
            .join('');
        state.speed.interval = window.setInterval(updateSpeedTimer, 250);
        renderSpeedQuestion();
    }

    function updateSpeedTimer() {
        if (!state.speed || !state.speed.active) return;
        elements.speedTimer.textContent = formatTime(speedElapsed(state.speed));
    }

    function speedElapsed(speed, now = Date.now()) {
        const activePause = speed.pauseStartedAt ? now - speed.pauseStartedAt : 0;
        return Math.max(0, now - speed.startedAt - speed.pausedMilliseconds - activePause);
    }

    function renderSpeedQuestion() {
        const speed = state.speed;
        if (!speed || !speed.active) return;
        if (speed.index >= speed.questions.length) {
            finishSpeed();
            return;
        }
        const target = speed.questions[speed.index];
        const prompt = speedPrompt(target, speed.index);
        speed.roundHadError = false;
        elements.speedTitle.textContent = `${speed.index + 1} / ${speed.questions.length}`;
        elements.speedRemaining.textContent = String(speed.questions.length - speed.index);
        elements.speedQuestion.innerHTML = `
            <p class="question-kicker">${escapeHTML(prompt.kicker)}</p>
            <h2>${escapeHTML(prompt.prompt)}</h2>
            <p class="question-clue">${escapeHTML(prompt.clue)}</p>
            <p id="speed-live" class="sr-only" aria-live="polite"></p>
        `;
        requestAnimationFrame(() => focusElement(elements.speedQuestion.querySelector('h2')));
    }

    function answerSpeed(selectedAbbr) {
        const speed = state.speed;
        if (!speed || !speed.active || speed.transitioning) return;
        const target = speed.questions[speed.index];
        const selectedButton = Array.from(elements.speedOptions.querySelectorAll('[data-abbr]'))
            .find((button) => button.dataset.abbr === selectedAbbr);
        if (!selectedButton || selectedButton.disabled || selectedButton.classList.contains('incorrect')) return;
        const live = byId('speed-live');
        const targetKey = keyFor(target);

        if (selectedAbbr !== target.abbr) {
            speed.errors += 1;
            speed.roundHadError = true;
            state.mistakes.add(targetKey);
            writeSet(STORAGE_KEYS.mistakes, state.mistakes);
            elements.speedErrors.textContent = String(speed.errors);
            selectedButton.classList.add('incorrect');
            window.setTimeout(() => selectedButton.classList.remove('incorrect'), 360);
            if (live) live.textContent = '오답입니다. 다른 답을 골라보세요.';
            updateProgress();
            return;
        }

        if (!speed.roundHadError) {
            state.mistakes.delete(targetKey);
            writeSet(STORAGE_KEYS.mistakes, state.mistakes);
        }
        selectedButton.disabled = true;
        selectedButton.classList.add('solved', 'correct');
        speed.transitioning = true;
        elements.speedOptions.classList.add('is-transitioning');
        if (live) live.textContent = '정답입니다.';
        updateProgress();
        speed.pauseStartedAt = Date.now();
        speed.advanceTimer = window.setTimeout(() => {
            if (!state.speed || !state.speed.active) return;
            state.speed.pausedMilliseconds += Date.now() - state.speed.pauseStartedAt;
            state.speed.pauseStartedAt = 0;
            state.speed.index += 1;
            state.speed.transitioning = false;
            elements.speedOptions.classList.remove('is-transitioning');
            renderSpeedQuestion();
        }, 320);
    }

    function finishSpeed() {
        const speed = state.speed;
        if (!speed) return;
        speed.active = false;
        window.clearInterval(speed.interval);
        const elapsed = speedElapsed(speed);
        const accuracy = Math.round((speed.count / (speed.count + speed.errors)) * 100);
        elements.speedTimer.textContent = formatTime(elapsed);
        elements.speedRemaining.textContent = '0';
        elements.speedTitle.textContent = '도전 완료';
        setHidden(elements.speedGame, true);
        elements.speedResults.innerHTML = `
            <p class="result-kicker">SPEED RUN COMPLETE</p>
            <h2 class="result-title">${speed.count}개의 별을 모두 찾았어요</h2>
            <p class="result-score"><strong>${formatTime(elapsed)}</strong></p>
            <div class="result-stats">
                <span><small>오답</small><strong>${speed.errors}</strong></span>
                <span><small>정확도</small><strong>${accuracy}%</strong></span>
            </div>
            <div class="result-actions">
                <button class="primary-button" type="button" data-action="speed-restart">같은 설정 재도전</button>
                <button class="secondary-button" type="button" data-action="speed-settings">설정 바꾸기</button>
            </div>
        `;
        setHidden(elements.speedResults, false);
        requestAnimationFrame(() => focusElement(elements.speedResults.querySelector('.result-title')));
    }

    function normalizeRightAscension(value) {
        const numeric = Number(value) || 0;
        const normalized = (((numeric + 180) % 360) + 360) % 360 - 180;
        return normalized === -180 && numeric > 0 ? 180 : normalized;
    }

    function hammerProject(raDegrees, decDegrees) {
        const lambda = -normalizeRightAscension(raDegrees) * Math.PI / 180;
        const phi = Math.max(-90, Math.min(90, Number(decDegrees) || 0)) * Math.PI / 180;
        const denominator = Math.sqrt(Math.max(0.000001, 1 + Math.cos(phi) * Math.cos(lambda / 2)));
        const x = (2 * Math.SQRT2 * Math.cos(phi) * Math.sin(lambda / 2)) / denominator;
        const y = (Math.SQRT2 * Math.sin(phi)) / denominator;
        const padding = 18;
        return [
            WHOLE_SKY_WIDTH / 2 + (x / (2 * Math.SQRT2)) * (WHOLE_SKY_WIDTH / 2 - padding),
            WHOLE_SKY_HEIGHT / 2 - (y / Math.SQRT2) * (WHOLE_SKY_HEIGHT / 2 - padding)
        ];
    }

    function splitSkySegmentAtSeam(first, second) {
        const ra1 = normalizeRightAscension(first[0]);
        const ra2 = normalizeRightAscension(second[0]);
        const dec1 = Number(first[1]) || 0;
        const dec2 = Number(second[1]) || 0;
        const rawDelta = ra2 - ra1;
        if (Math.abs(rawDelta) <= 180) return [[ [ra1, dec1], [ra2, dec2] ]];

        const unwrappedRa2 = rawDelta > 180 ? ra2 - 360 : ra2 + 360;
        const boundary = unwrappedRa2 > 180 ? 180 : -180;
        const ratio = (boundary - ra1) / (unwrappedRa2 - ra1);
        const boundaryDec = dec1 + (dec2 - dec1) * ratio;
        return [
            [[ra1, dec1], [boundary, boundaryDec]],
            [[-boundary, boundaryDec], [ra2, dec2]]
        ];
    }

    function sphericalCenterFor(lines) {
        const points = lines.flat();
        if (!points.length) return [0, 0];
        const sum = points.reduce((total, point) => {
            const vector = vectorFor(point[0], point[1]);
            total[0] += vector[0];
            total[1] += vector[1];
            total[2] += vector[2];
            return total;
        }, [0, 0, 0]);
        const length = Math.hypot(sum[0], sum[1], sum[2]) || 1;
        return coordinatesFor(sum.map((value) => value / length));
    }

    function projectedPointString(point) {
        const projected = hammerProject(point[0], point[1]);
        return `${projected[0].toFixed(2)},${projected[1].toFixed(2)}`;
    }

    function wholeSkyStaticMarkup() {
        if (wholeSkyStaticCache) return wholeSkyStaticCache;
        const grid = [];
        [-60, -30, 0, 30, 60].forEach((declination) => {
            const points = [];
            for (let ra = -180; ra <= 180; ra += 5) points.push(projectedPointString([ra, declination]));
            grid.push(`<polyline points="${points.join(' ')}"/>`);
        });
        [-120, -60, 0, 60, 120].forEach((rightAscension) => {
            const points = [];
            for (let dec = -90; dec <= 90; dec += 3) points.push(projectedPointString([rightAscension, dec]));
            grid.push(`<polyline points="${points.join(' ')}"/>`);
        });

        const stars = SKY_STARS
            .filter((star) => star[2] <= 4.35)
            .map((star) => {
                const point = hammerProject(star[0], star[1]);
                const radius = Math.max(0.45, 1.65 - star[2] * 0.22);
                return `<circle cx="${point[0].toFixed(2)}" cy="${point[1].toFixed(2)}" r="${radius.toFixed(2)}"/>`;
            })
            .join('');
        wholeSkyStaticCache = `
            <ellipse class="whole-map-outline" cx="${WHOLE_SKY_WIDTH / 2}" cy="${WHOLE_SKY_HEIGHT / 2}"
                rx="${WHOLE_SKY_WIDTH / 2 - 18}" ry="${WHOLE_SKY_HEIGHT / 2 - 18}"/>
            <g class="whole-map-grid">${grid.join('')}</g>
            <g class="whole-map-background-stars">${stars}</g>
        `;
        return wholeSkyStaticCache;
    }

    function wholeSkyConstellationMarkup(constellation) {
        const lines = SKY_LINES[constellation.abbr] || [];
        const registered = state.learned.has(keyFor(constellation));
        const segments = [];
        const starPoints = new Map();
        lines.forEach((line) => {
            line.forEach((point) => {
                const projected = hammerProject(point[0], point[1]);
                starPoints.set(`${projected[0].toFixed(1)}:${projected[1].toFixed(1)}`, projected);
            });
            for (let index = 1; index < line.length; index += 1) {
                splitSkySegmentAtSeam(line[index - 1], line[index]).forEach((segment) => {
                    const first = hammerProject(segment[0][0], segment[0][1]);
                    const second = hammerProject(segment[1][0], segment[1][1]);
                    segments.push(`<line x1="${first[0].toFixed(2)}" y1="${first[1].toFixed(2)}"
                        x2="${second[0].toFixed(2)}" y2="${second[1].toFixed(2)}"/>`);
                });
            }
        });
        const center = hammerProject(...sphericalCenterFor(lines));
        const stars = registered
            ? Array.from(starPoints.values()).map((point) => (
                `<circle class="whole-map-vertex" cx="${point[0].toFixed(2)}" cy="${point[1].toFixed(2)}" r="2.3"/>`
            )).join('')
            : '';
        const names = parseName(constellation);
        const interactive = registered
            ? `data-map-abbr="${escapeHTML(constellation.abbr)}" data-map-x="${center[0].toFixed(2)}"
                data-map-y="${center[1].toFixed(2)}" role="button" tabindex="0"
                aria-label="${escapeHTML(names.korean)} 상세 보기"`
            : 'aria-hidden="true"';
        return `
            <g class="whole-map-constellation ${registered ? 'is-registered' : 'is-locked'}" ${interactive}>
                <title>${escapeHTML(names.korean)} · ${registered ? '등록' : '미등록'}</title>
                <g class="whole-map-lines">${segments.join('')}</g>
                ${stars}
                ${registered ? `
                    <circle class="whole-map-hit" cx="${center[0].toFixed(2)}" cy="${center[1].toFixed(2)}" r="${WHOLE_SKY_HIT_RADIUS}"/>
                    <circle class="whole-map-anchor" cx="${center[0].toFixed(2)}" cy="${center[1].toFixed(2)}" r="4"/>
                    <text x="${center[0].toFixed(2)}" y="${(center[1] - 9).toFixed(2)}">${escapeHTML(constellation.abbr)}</text>
                ` : ''}
            </g>
        `;
    }

    function progressMilestone(registeredCount) {
        let rank = '관측 준비';
        PROGRESS_MILESTONES.forEach((milestone) => {
            if (registeredCount >= milestone.count) rank = milestone.rank;
        });
        return {
            rank,
            next: PROGRESS_MILESTONES.find((milestone) => registeredCount < milestone.count) || null
        };
    }

    function restoreWholeSkyMapScroll() {
        const viewport = elements.collectionMapViewport;
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        if (!maxScroll) {
            viewport.scrollLeft = 0;
            state.mapScrollLeft = 0;
            return;
        }
        const ratio = Number.isFinite(state.mapScrollRatio)
            ? Math.max(0, Math.min(1, state.mapScrollRatio))
            : 0.5;
        viewport.scrollLeft = maxScroll * ratio;
        state.mapScrollLeft = viewport.scrollLeft;
    }

    function renderWholeSkyMap() {
        const registeredCount = state.learned.size;
        const percentage = Math.round((registeredCount / atlas.length) * 100);
        const milestone = progressMilestone(registeredCount);
        elements.collectionMap.innerHTML = `
            <svg class="whole-sky-map ${registeredCount === atlas.length ? 'is-complete' : ''}"
                viewBox="0 0 ${WHOLE_SKY_WIDTH} ${WHOLE_SKY_HEIGHT}" role="group"
                aria-label="88개 중 ${registeredCount}개가 등록된 전체 별자리 지도">
                <defs>
                    <filter id="whole-map-glow" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="3.2" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                ${wholeSkyStaticMarkup()}
                <g class="whole-map-atlas">${atlas.map(wholeSkyConstellationMarkup).join('')}</g>
            </svg>
        `;
        elements.collectionMapStatus.textContent = registeredCount === atlas.length
            ? '88개의 공식 별자리가 모두 빛납니다. 전체 별자리 도감을 완성했습니다.'
            : `${registeredCount}개의 별자리가 빛나고 있습니다. 등록한 성도를 눌러 상세로 돌아갈 수 있어요.`;
        elements.collectionRank.textContent = milestone.rank;
        elements.collectionMapProgressLabel.textContent = `${percentage}% 완성`;
        elements.collectionNextMilestone.textContent = milestone.next
            ? `${milestone.next.count}개 등록까지 ${milestone.next.count - registeredCount}개 남음`
            : '88개 공식 별자리 도감 완성';
        elements.collectionMapNext.disabled = registeredCount === atlas.length;
        elements.collectionMapNext.textContent = registeredCount === atlas.length
            ? '별지도 완성'
            : '다음 미등록 별자리';

        requestAnimationFrame(restoreWholeSkyMapScroll);
    }

    function collectionItems(collection) {
        if (collection === 'review') return atlas.filter((item) => state.mistakes.has(keyFor(item)));
        return atlas.filter((item) => state.learned.has(keyFor(item)));
    }

    function renderCollection(collection) {
        state.collection = collection;
        showPrimaryView('collection');
        document.body.classList.remove('detail-open', 'game-open');
        document.body.dataset.route = 'collection';
        updateProgress();
        renderWholeSkyMap();

        elements.collectionTabs.querySelectorAll('[data-collection]').forEach((button) => {
            const selected = button.dataset.collection === collection;
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
            button.tabIndex = selected ? 0 : -1;
            button.classList.toggle('selected', selected);
        });

        const items = collectionItems(collection);
        const page = paginate(items, state.collectionPages[collection]);
        state.collectionPages[collection] = page.page;
        elements.collectionGrid.innerHTML = page.items.map(cardMarkup).join('');
        updateListPagination({
            container: elements.collectionPagination,
            previous: elements.collectionPreviousPage,
            next: elements.collectionNextPage,
            range: elements.collectionPageRange,
            indicator: elements.collectionPageIndicator
        }, page);
        setHidden(elements.collectionEmpty, items.length !== 0);
        const emptyCopy = {
            learned: ['아직 등록한 별자리가 없어요', '학습에서 별자리를 살펴보고 나의 별자리에 등록해 보세요.'],
            review: ['복습할 별자리가 없어요', '도전에서 헷갈린 별자리가 여기에 자동으로 모입니다.']
        }[collection];
        elements.collectionEmptyTitle.textContent = emptyCopy[0];
        elements.collectionEmptyCopy.textContent = emptyCopy[1];
    }

    function renderRoute() {
        const route = parseRoute();
        const renderToken = ++state.routeRenderToken;
        const previousRoute = state.currentRoute;
        saveScrollForCurrentRoute();
        cleanupForRouteChange(previousRoute, route.key);
        const enteringRoute = previousRoute !== route.key;
        state.currentRoute = route.key;

        if (route.kind === 'detail') {
            renderDetail(route.item);
        } else if (route.kind === 'challenge') {
            renderChallenge(route.panel, enteringRoute);
        } else if (route.kind === 'collection') {
            renderCollection(route.collection);
        } else {
            renderExplore();
        }

        if (enteringRoute) {
            const scrollTarget = route.kind === 'detail' || route.kind === 'challenge'
                ? 0
                : (state.scroll[route.key] || 0);
            requestAnimationFrame(() => {
                if (state.routeRenderToken !== renderToken) return;
                scrollAppTo(scrollTarget);
                focusRouteHeading(route);
            });
        }
    }

    function handleCardClick(event) {
        const card = event.target.closest('[data-abbr]');
        if (!card) return;
        const constellation = byAbbr.get(String(card.dataset.abbr).toLowerCase());
        if (constellation) openConstellation(constellation);
    }

    function openMapConstellation(target) {
        const mapItem = target.closest('[data-map-abbr]');
        if (!mapItem) return;
        const constellation = byAbbr.get(String(mapItem.dataset.mapAbbr).toLowerCase());
        if (constellation && state.learned.has(keyFor(constellation))) openConstellation(constellation);
    }

    function nearestMapConstellation(event) {
        if (!event.detail || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return null;
        const mapSvg = elements.collectionMap.querySelector('.whole-sky-map');
        const bounds = mapSvg?.getBoundingClientRect();
        if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;
        const mapX = ((event.clientX - bounds.left) / bounds.width) * WHOLE_SKY_WIDTH;
        const mapY = ((event.clientY - bounds.top) / bounds.height) * WHOLE_SKY_HEIGHT;
        let nearest = null;
        let nearestDistance = Number.POSITIVE_INFINITY;
        elements.collectionMap.querySelectorAll('[data-map-x][data-map-y]').forEach((mapItem) => {
            const distance = Math.hypot(
                mapX - Number(mapItem.dataset.mapX),
                mapY - Number(mapItem.dataset.mapY)
            );
            if (distance < nearestDistance) {
                nearest = mapItem;
                nearestDistance = distance;
            }
        });
        return nearestDistance <= WHOLE_SKY_HIT_RADIUS ? nearest : null;
    }

    function handleResultAction(event) {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (!action) return;
        if (action === 'quiz-restart') startQuiz();
        if (action === 'open-review') routeHash('#collection/review');
        if (action === 'speed-restart') startSpeed();
        if (action === 'speed-settings') showSpeedSettings();
    }

    function bindEvents() {
        elements.brandHome.addEventListener('click', () => routeOrScrollTop('#explore'));
        elements.fullscreen.addEventListener('click', toggleFullscreen);
        elements.surprise.addEventListener('click', () => openConstellation(atlas[Math.floor(Math.random() * atlas.length)]));
        elements.headerProgress.addEventListener('click', () => routeHash('#collection/learned'));
        elements.continueExplore.addEventListener('click', () => openConstellation(nextUnlearned()));
        elements.randomExplore.addEventListener('click', () => openConstellation(atlas[Math.floor(Math.random() * atlas.length)]));
        elements.featured.addEventListener('click', () => openConstellation(state.featured));
        elements.atlasGrid.addEventListener('click', handleCardClick);
        elements.collectionGrid.addEventListener('click', handleCardClick);

        elements.search.addEventListener('input', () => {
            state.query = elements.search.value;
            state.atlasPage = 0;
            renderAtlas();
        });
        elements.clearSearch.addEventListener('click', () => {
            state.query = '';
            state.atlasPage = 0;
            elements.search.value = '';
            renderAtlas();
            elements.search.focus();
        });
        elements.filterToggle.addEventListener('click', openFilterDialog);
        elements.filterDialog.addEventListener('close', () => {
            elements.filterToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('dialog-open');
        });
        elements.filterDialog.addEventListener('click', (event) => {
            const button = event.target.closest('[data-filter]');
            if (!button) return;
            state.filter = button.dataset.filter;
            state.atlasPage = 0;
            renderAtlas();
            closeFilterDialog();
        });
        elements.resetFilter.addEventListener('click', () => {
            state.filter = 'all';
            state.query = '';
            state.atlasPage = 0;
            elements.search.value = '';
            renderAtlas();
        });
        elements.atlasPreviousPage.addEventListener('click', () => {
            state.atlasPage = Math.max(0, state.atlasPage - 1);
            renderAtlas();
            scrollAppToElement(elements.atlasSection);
        });
        elements.atlasNextPage.addEventListener('click', () => {
            state.atlasPage += 1;
            renderAtlas();
            scrollAppToElement(elements.atlasSection);
        });

        elements.backToList.addEventListener('click', () => {
            if (state.detailOpenedInternally && history.length > 1) {
                state.detailOpenedInternally = false;
                history.back();
            } else {
                replaceRoute(state.detailReturnHash || '#explore');
            }
        });
        elements.complete.addEventListener('click', toggleCurrentConstellation);
        elements.prev.addEventListener('click', () => {
            if (!state.current) return;
            const index = atlas.indexOf(state.current);
            replaceRoute(`#constellation/${atlas[(index - 1 + atlas.length) % atlas.length].abbr}`);
        });
        elements.next.addEventListener('click', () => {
            if (!state.current) return;
            const index = atlas.indexOf(state.current);
            replaceRoute(`#constellation/${atlas[(index + 1) % atlas.length].abbr}`);
        });

        elements.modeSelection.addEventListener('click', (event) => {
            const button = event.target.closest('[data-view]');
            if (!button) return;
            if (button.dataset.view === 'quiz') routeOrScrollTop('#challenge/quiz');
            else if (button.dataset.view === 'speed') routeOrScrollTop('#challenge/speed');
            else if (button.dataset.view === 'collection') routeOrScrollTop(`#collection/${state.collection}`);
            else routeOrScrollTop('#explore');
        });
        elements.quizMode.addEventListener('click', () => routeHash('#challenge/quiz'));
        elements.speedMode.addEventListener('click', () => routeHash('#challenge/speed'));
        elements.quizBack.addEventListener('click', () => routeHash('#explore'));
        elements.speedBack.addEventListener('click', () => routeHash('#explore'));
        elements.quizOptions.addEventListener('click', (event) => {
            const button = event.target.closest('[data-abbr]');
            if (button) answerQuiz(button.dataset.abbr);
        });
        elements.nextQuiz.addEventListener('click', advanceQuiz);
        elements.quizResults.addEventListener('click', handleResultAction);
        elements.startSpeed.addEventListener('click', startSpeed);
        elements.speedOptions.addEventListener('click', (event) => {
            const button = event.target.closest('[data-abbr]');
            if (button) answerSpeed(button.dataset.abbr);
        });
        elements.speedResults.addEventListener('click', handleResultAction);

        elements.collectionTabs.addEventListener('click', (event) => {
            const tab = event.target.closest('[data-collection]');
            if (tab) routeHash(`#collection/${tab.dataset.collection}`);
        });
        elements.collectionTabs.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const tabs = Array.from(elements.collectionTabs.querySelectorAll('[data-collection]'));
            const currentIndex = tabs.indexOf(document.activeElement);
            let nextIndex = currentIndex;
            if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
            if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabs.length - 1;
            event.preventDefault();
            tabs[nextIndex].focus();
            routeHash(`#collection/${tabs[nextIndex].dataset.collection}`);
        });
        elements.collectionPreviousPage.addEventListener('click', () => {
            state.collectionPages[state.collection] = Math.max(0, state.collectionPages[state.collection] - 1);
            renderCollection(state.collection);
            scrollAppToElement(elements.collectionTabs);
        });
        elements.collectionNextPage.addEventListener('click', () => {
            state.collectionPages[state.collection] += 1;
            renderCollection(state.collection);
            scrollAppToElement(elements.collectionTabs);
        });
        elements.collectionExplore.addEventListener('click', () => routeHash('#explore'));
        elements.collectionMapNext.addEventListener('click', () => {
            if (state.learned.size < atlas.length) openConstellation(nextUnlearned());
        });
        elements.collectionMap.addEventListener('click', (event) => {
            if (Date.now() < state.mapSuppressClickUntil) return;
            openMapConstellation(nearestMapConstellation(event) || event.target);
        });
        elements.collectionMap.addEventListener('keydown', (event) => {
            if (!['Enter', ' '].includes(event.key)) return;
            const mapItem = event.target.closest('[data-map-abbr]');
            if (!mapItem) return;
            event.preventDefault();
            openMapConstellation(mapItem);
        });
        elements.collectionMapViewport.addEventListener('scroll', () => {
            const viewport = elements.collectionMapViewport;
            const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
            state.mapScrollLeft = viewport.scrollLeft;
            if (maxScroll) state.mapScrollRatio = viewport.scrollLeft / maxScroll;
        }, { passive: true });
        elements.collectionMapViewport.addEventListener('pointerdown', (event) => {
            state.mapPointer = { x: event.clientX, y: event.clientY, moved: false };
        }, { passive: true });
        elements.collectionMapViewport.addEventListener('pointermove', (event) => {
            if (!state.mapPointer) return;
            const distance = Math.hypot(event.clientX - state.mapPointer.x, event.clientY - state.mapPointer.y);
            if (distance > 8) state.mapPointer.moved = true;
        }, { passive: true });
        const finishMapPointer = () => {
            if (state.mapPointer?.moved) state.mapSuppressClickUntil = Date.now() + 320;
            state.mapPointer = null;
        };
        elements.collectionMapViewport.addEventListener('pointerup', finishMapPointer, { passive: true });
        elements.collectionMapViewport.addEventListener('pointercancel', finishMapPointer, { passive: true });

        window.addEventListener('hashchange', renderRoute);
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        window.addEventListener('resize', () => {
            window.clearTimeout(state.resizeTimer);
            state.resizeTimer = window.setTimeout(() => {
                if (state.sky) drawSky(state.sky.canvas, state.sky.constellation);
                if (state.currentRoute.startsWith('collection/')) restoreWholeSkyMapScroll();
            }, 120);
        });
        window.addEventListener('storage', (event) => {
            if (event.key === STORAGE_KEYS.magnitude) {
                state.magnitude = readMagnitude();
                if (state.sky) {
                    const slider = elements.imageContainer.querySelector('.sky-slider');
                    const label = elements.imageContainer.querySelector('.sky-mag-label b');
                    if (slider) {
                        slider.value = String(state.magnitude);
                        slider.setAttribute('aria-valuetext', magnitudeLabel());
                    }
                    if (label) label.textContent = magnitudeLabel();
                    drawSky(state.sky.canvas, state.sky.constellation);
                }
                return;
            }
            if (![STORAGE_KEYS.learned, STORAGE_KEYS.mistakes].includes(event.key)) return;
            state.learned = readSet(STORAGE_KEYS.learned, validStorageKeys);
            state.mistakes = readSet(STORAGE_KEYS.mistakes, validStorageKeys);
            updateProgress();
            if (state.current) updateDetailActions(state.current);
            if (state.currentRoute === 'explore') renderAtlas();
            if (state.currentRoute.startsWith('collection/')) renderCollection(state.collection);
        });
        window.addEventListener('pagehide', () => {
            cleanupSky();
            cleanupSpeed();
            window.clearTimeout(state.toastTimer);
            window.clearTimeout(state.resizeTimer);
        });
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) renderRoute();
        });
    }

    function initialize() {
        elements.quizQuestion.setAttribute('aria-live', 'polite');
        elements.quizQuestion.setAttribute('aria-atomic', 'true');
        elements.speedQuestion.setAttribute('aria-live', 'polite');
        elements.speedQuestion.setAttribute('aria-atomic', 'true');
        bindEvents();
        updateFullscreenButton();
        try {
            history.scrollRestoration = 'manual';
        } catch (error) {
            // Native restoration is an acceptable fallback.
        }
        renderFeatured();
        updateProgress();
        if (!window.location.hash) {
            history.replaceState(null, '', '#explore');
        }
        renderRoute();
    }

    initialize();
}());
