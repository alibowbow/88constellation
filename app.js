/* 88 Constellations — pocket atlas runtime */
(function () {
    'use strict';

    const STORAGE_KEYS = {
        bookmarks: 'bookmarkedConstellations',
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
        unlearned: '미발견',
        learned: '발견 완료'
    };

    const QUIZ_ROUNDS = 10;
    const VALID_SPEED_COUNTS = new Set([8, 20, 44, 88]);
    const miniSvgCache = new Map();

    const byId = (id) => document.getElementById(id);
    const elements = {
        app: byId('app'),
        brandHome: byId('brand-home-button'),
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
        atlasGrid: byId('constellation-list-grid'),
        atlasCount: byId('atlas-result-count'),
        atlasEmpty: byId('atlas-empty-state'),
        backToList: byId('back-to-list-button'),
        detailPosition: byId('detail-position'),
        bookmark: byId('bookmark-button'),
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
        collectionBookmarks: byId('collection-bookmark-count'),
        collectionReview: byId('collection-review-count'),
        collectionTabs: byId('collection-tabs'),
        collectionGrid: byId('collection-grid'),
        collectionEmpty: byId('collection-empty-state'),
        collectionEmptyTitle: byId('collection-empty-title'),
        collectionEmptyCopy: byId('collection-empty-copy'),
        collectionExplore: byId('collection-explore-button'),
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

    function koreanTitleParts(constellation) {
        const korean = parseName(constellation).korean;
        return korean.endsWith('자리')
            ? { core: korean.slice(0, -2), suffix: '자리' }
            : { core: korean, suffix: '' };
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
        collection: 'learned',
        current: null,
        featured: atlas[todayIndex(atlas.length)],
        bookmarks: readSet(STORAGE_KEYS.bookmarks, validStorageKeys),
        learned: readSet(STORAGE_KEYS.learned, validStorageKeys),
        mistakes: readSet(STORAGE_KEYS.mistakes, validStorageKeys),
        magnitude: readMagnitude(),
        detailOpenedInternally: false,
        detailReturnHash: '#explore',
        currentRoute: '',
        quiz: null,
        speed: null,
        sky: null,
        toastTimer: 0,
        resizeTimer: 0,
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
        if (state.learned.has(key)) statuses.push('발견 완료');
        if (state.bookmarks.has(key)) statuses.push('북마크');
        if (state.mistakes.has(key)) statuses.push('복습 필요');
        return statuses.join(', ');
    }

    function cardMarkup(constellation) {
        const index = atlas.indexOf(constellation);
        const names = parseName(constellation);
        const key = keyFor(constellation);
        const learned = state.learned.has(key);
        const bookmarked = state.bookmarks.has(key);
        const review = state.mistakes.has(key);
        const stateClasses = [
            learned ? 'is-learned' : '',
            bookmarked ? 'is-bookmarked' : '',
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
                        <span class="card-status" aria-hidden="true">${learned ? '✓' : ''}${bookmarked ? ' ★' : ''}${review ? ' ↻' : ''}</span>
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

    function renderAtlas() {
        const results = atlas.filter((item) => matchesFilter(item) && matchesSearch(item));
        elements.atlasGrid.innerHTML = results.map(cardMarkup).join('');
        elements.atlasCount.textContent = `${results.length}개`;
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
        elements.headerProgress.setAttribute('aria-label', `나의 하늘 보기, ${total}개 중 ${learnedCount}개 발견`);
        elements.headerProgressRing.style.setProperty('--progress', `${percentage}%`);
        elements.headerProgressRing.style.setProperty('--progress-angle', `${percentage * 3.6}deg`);
        elements.collectionLearned.textContent = String(learnedCount);
        elements.collectionProgress.style.width = `${percentage}%`;
        elements.collectionBookmarks.textContent = String(state.bookmarks.size);
        elements.collectionReview.textContent = String(state.mistakes.size);

        const target = nextUnlearned();
        const targetName = parseName(target).korean;
        elements.continueLabel.textContent = learnedCount
            ? (learnedCount === total ? '완성한 별지도 다시 보기' : `다음 별 · ${targetName}`)
            : '첫 별자리 만나기';
        elements.welcomeMessage.textContent = learnedCount
            ? `${total}개 중 ${learnedCount}개를 발견했어요. 다음 별을 이어서 만나보세요.`
            : `${total}개의 별자리를 실제 별의 배치로 하나씩 발견해 보세요.`;
    }

    function showToast(message) {
        window.clearTimeout(state.toastTimer);
        elements.toast.textContent = message;
        elements.toast.classList.add('show');
        state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('show'), 2400);
    }

    function openFilterDialog() {
        elements.filterToggle.setAttribute('aria-expanded', 'true');
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
            const panel = parts[1] === 'quiz' || parts[1] === 'speed' ? parts[1] : 'hub';
            return { kind: 'challenge', key: `challenge/${panel}`, panel };
        }
        if (parts[0] === 'collection') {
            const collection = ['learned', 'bookmarked', 'review'].includes(parts[1]) ? parts[1] : state.collection;
            return { kind: 'collection', key: `collection/${collection}`, collection };
        }
        return { kind: 'explore', key: 'explore' };
    }

    function saveScrollForCurrentRoute() {
        if (state.currentRoute && !state.currentRoute.startsWith('constellation/')) {
            state.scroll[state.currentRoute] = window.scrollY;
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

    function showPrimaryView(view) {
        setHidden(elements.exploreView, view !== 'explore');
        setHidden(elements.challengeView, view !== 'challenge');
        setHidden(elements.collectionView, view !== 'collection');
        updatePrimaryNavigation(view);
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

    function renderDetailCopy(constellation) {
        const names = parseName(constellation);
        const title = koreanTitleParts(constellation);
        elements.constellationName.innerHTML = `
            <p class="detail-eyebrow">${escapeHTML(names.english.toUpperCase())} <span>· ${escapeHTML(constellation.abbr)}</span></p>
            <h1 id="detail-title"><span class="title-core">${escapeHTML(title.core)}</span><span class="title-suffix">${escapeHTML(title.suffix)}</span></h1>
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
            ${infoBlock('별에 얽힌 이야기', constellation.story)}
            ${infoBlock('모양과 특징', constellation.characteristics)}
            ${infoBlock('알아두면 좋은 사실', constellation.fact)}
        `;
    }

    function updateDetailActions(constellation) {
        const key = keyFor(constellation);
        const learned = state.learned.has(key);
        const bookmarked = state.bookmarks.has(key);
        elements.bookmark.classList.toggle('is-bookmarked', bookmarked);
        elements.bookmark.setAttribute('aria-pressed', bookmarked ? 'true' : 'false');
        elements.bookmark.querySelector('span').textContent = bookmarked ? '북마크됨' : '북마크';

        elements.complete.classList.toggle('is-complete', learned);
        elements.complete.setAttribute('aria-pressed', learned ? 'true' : 'false');
        elements.complete.disabled = learned;
        elements.complete.querySelector('.complete-label').textContent = learned ? '발견 기록됨' : '발견 완료';
        elements.complete.querySelector('small').textContent = learned
            ? '나의 하늘에 저장되었습니다'
            : '내 별지도에 기록하기';
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

    function completeCurrentConstellation() {
        if (!state.current) return;
        const key = keyFor(state.current);
        if (state.learned.has(key)) return;
        state.learned.add(key);
        writeSet(STORAGE_KEYS.learned, state.learned);
        updateDetailActions(state.current);
        updateProgress();
        showToast(`${parseName(state.current).korean}를 나의 하늘에 기록했어요`);
    }

    function toggleCurrentBookmark() {
        if (!state.current) return;
        const key = keyFor(state.current);
        if (state.bookmarks.has(key)) state.bookmarks.delete(key);
        else state.bookmarks.add(key);
        writeSet(STORAGE_KEYS.bookmarks, state.bookmarks);
        updateDetailActions(state.current);
        updateProgress();
        showToast(state.bookmarks.has(key) ? '북마크에 저장했어요' : '북마크에서 해제했어요');
    }

    function renderChallenge(panel, enteringPanel) {
        showPrimaryView('challenge');
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
        return `<button class="time-attack-button" type="button" data-abbr="${escapeHTML(constellation.abbr)}">${escapeHTML(label)}</button>`;
    }

    function startSpeed() {
        const countInput = document.querySelector('input[name="difficulty"]:checked');
        const languageInput = document.querySelector('input[name="language"]:checked');
        const requestedCount = Number.parseInt(countInput ? countInput.value : '8', 10);
        const count = VALID_SPEED_COUNTS.has(requestedCount) ? requestedCount : 8;
        const language = languageInput && languageInput.value === 'en' ? 'en' : 'ko';
        cleanupSpeed();
        state.speed = {
            active: true,
            questions: shuffled(atlas).slice(0, count).map((target) => ({
                target,
                choices: createChoiceSet(target)
            })),
            index: 0,
            errors: 0,
            language,
            count,
            startedAt: Date.now(),
            pausedMilliseconds: 0,
            pauseStartedAt: 0,
            interval: 0,
            advanceTimer: 0,
            roundHadError: false
        };
        setHidden(elements.speedSettings, true);
        setHidden(elements.speedResults, true);
        setHidden(elements.speedGame, false);
        elements.speedErrors.textContent = '0';
        elements.speedTimer.textContent = '00:00';
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
        const question = speed.questions[speed.index];
        const prompt = speedPrompt(question.target, speed.index);
        speed.roundHadError = false;
        elements.speedTitle.textContent = `${speed.index + 1} / ${speed.questions.length}`;
        elements.speedRemaining.textContent = String(speed.questions.length - speed.index);
        elements.speedQuestion.innerHTML = `
            <p class="question-kicker">${escapeHTML(prompt.kicker)}</p>
            <h2>${escapeHTML(prompt.prompt)}</h2>
            <p class="question-clue">${escapeHTML(prompt.clue)}</p>
            <p id="speed-live" class="sr-only" aria-live="polite"></p>
        `;
        elements.speedOptions.innerHTML = question.choices.map((choice) => speedChoiceMarkup(choice, speed.language)).join('');
        requestAnimationFrame(() => focusElement(elements.speedOptions.querySelector('button:not([disabled])')));
    }

    function answerSpeed(selectedAbbr) {
        const speed = state.speed;
        if (!speed || !speed.active) return;
        const question = speed.questions[speed.index];
        const selectedButton = Array.from(elements.speedOptions.querySelectorAll('[data-abbr]'))
            .find((button) => button.dataset.abbr === selectedAbbr);
        if (!selectedButton || selectedButton.disabled) return;
        const live = byId('speed-live');
        const targetKey = keyFor(question.target);

        if (selectedAbbr !== question.target.abbr) {
            speed.errors += 1;
            speed.roundHadError = true;
            state.mistakes.add(targetKey);
            writeSet(STORAGE_KEYS.mistakes, state.mistakes);
            elements.speedErrors.textContent = String(speed.errors);
            selectedButton.disabled = true;
            selectedButton.classList.add('incorrect');
            if (live) live.textContent = '오답입니다. 다른 답을 골라보세요.';
            updateProgress();
            return;
        }

        if (!speed.roundHadError) {
            state.mistakes.delete(targetKey);
            writeSet(STORAGE_KEYS.mistakes, state.mistakes);
        }
        elements.speedOptions.querySelectorAll('button').forEach((button) => {
            button.disabled = true;
        });
        selectedButton.classList.add('solved', 'correct');
        if (live) live.textContent = '정답입니다.';
        updateProgress();
        speed.pauseStartedAt = Date.now();
        speed.advanceTimer = window.setTimeout(() => {
            if (!state.speed || !state.speed.active) return;
            state.speed.pausedMilliseconds += Date.now() - state.speed.pauseStartedAt;
            state.speed.pauseStartedAt = 0;
            state.speed.index += 1;
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

    function collectionItems(collection) {
        if (collection === 'bookmarked') return atlas.filter((item) => state.bookmarks.has(keyFor(item)));
        if (collection === 'review') return atlas.filter((item) => state.mistakes.has(keyFor(item)));
        return atlas.filter((item) => state.learned.has(keyFor(item)));
    }

    function renderCollection(collection) {
        state.collection = collection;
        showPrimaryView('collection');
        document.body.classList.remove('detail-open', 'game-open');
        document.body.dataset.route = 'collection';
        updateProgress();

        elements.collectionTabs.querySelectorAll('[data-collection]').forEach((button) => {
            const selected = button.dataset.collection === collection;
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
            button.tabIndex = selected ? 0 : -1;
            button.classList.toggle('selected', selected);
        });

        const items = collectionItems(collection);
        elements.collectionGrid.innerHTML = items.map(cardMarkup).join('');
        setHidden(elements.collectionEmpty, items.length !== 0);
        const emptyCopy = {
            learned: ['아직 발견한 별자리가 없어요', '탐험에서 별자리를 살펴보고 발견 완료를 눌러보세요.'],
            bookmarked: ['아직 북마크한 별자리가 없어요', '다시 보고 싶은 별의 상세 화면에서 별 버튼을 눌러보세요.'],
            review: ['복습할 별자리가 없어요', '도전에서 헷갈린 별자리가 여기에 자동으로 모입니다.']
        }[collection];
        elements.collectionEmptyTitle.textContent = emptyCopy[0];
        elements.collectionEmptyCopy.textContent = emptyCopy[1];
    }

    function renderRoute() {
        const route = parseRoute();
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
            const scrollTarget = route.kind === 'detail' ? 0 : (state.scroll[route.key] || 0);
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollTarget);
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

    function handleResultAction(event) {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (!action) return;
        if (action === 'quiz-restart') startQuiz();
        if (action === 'open-review') routeHash('#collection/review');
        if (action === 'speed-restart') startSpeed();
        if (action === 'speed-settings') showSpeedSettings();
    }

    function bindEvents() {
        elements.brandHome.addEventListener('click', () => routeHash('#explore'));
        elements.surprise.addEventListener('click', () => openConstellation(atlas[Math.floor(Math.random() * atlas.length)]));
        elements.headerProgress.addEventListener('click', () => routeHash('#collection/learned'));
        elements.continueExplore.addEventListener('click', () => openConstellation(nextUnlearned()));
        elements.randomExplore.addEventListener('click', () => openConstellation(atlas[Math.floor(Math.random() * atlas.length)]));
        elements.featured.addEventListener('click', () => openConstellation(state.featured));
        elements.atlasGrid.addEventListener('click', handleCardClick);
        elements.collectionGrid.addEventListener('click', handleCardClick);

        elements.search.addEventListener('input', () => {
            state.query = elements.search.value;
            renderAtlas();
        });
        elements.clearSearch.addEventListener('click', () => {
            state.query = '';
            elements.search.value = '';
            renderAtlas();
            elements.search.focus();
        });
        elements.filterToggle.addEventListener('click', openFilterDialog);
        elements.filterDialog.addEventListener('close', () => elements.filterToggle.setAttribute('aria-expanded', 'false'));
        elements.filterDialog.addEventListener('click', (event) => {
            const button = event.target.closest('[data-filter]');
            if (!button) return;
            state.filter = button.dataset.filter;
            renderAtlas();
            closeFilterDialog();
        });
        elements.resetFilter.addEventListener('click', () => {
            state.filter = 'all';
            state.query = '';
            elements.search.value = '';
            renderAtlas();
        });

        elements.backToList.addEventListener('click', () => {
            if (state.detailOpenedInternally && history.length > 1) {
                state.detailOpenedInternally = false;
                history.back();
            } else {
                replaceRoute(state.detailReturnHash || '#explore');
            }
        });
        elements.bookmark.addEventListener('click', toggleCurrentBookmark);
        elements.complete.addEventListener('click', completeCurrentConstellation);
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
            if (button.dataset.view === 'challenge') routeHash('#challenge');
            else if (button.dataset.view === 'collection') routeHash(`#collection/${state.collection}`);
            else routeHash('#explore');
        });
        elements.quizMode.addEventListener('click', () => routeHash('#challenge/quiz'));
        elements.speedMode.addEventListener('click', () => routeHash('#challenge/speed'));
        elements.quizBack.addEventListener('click', () => routeHash('#challenge'));
        elements.speedBack.addEventListener('click', () => routeHash('#challenge'));
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
        elements.collectionExplore.addEventListener('click', () => routeHash('#explore'));

        window.addEventListener('hashchange', renderRoute);
        window.addEventListener('resize', () => {
            window.clearTimeout(state.resizeTimer);
            state.resizeTimer = window.setTimeout(() => {
                if (state.sky) drawSky(state.sky.canvas, state.sky.constellation);
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
            if (![STORAGE_KEYS.bookmarks, STORAGE_KEYS.learned, STORAGE_KEYS.mistakes].includes(event.key)) return;
            state.bookmarks = readSet(STORAGE_KEYS.bookmarks, validStorageKeys);
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
