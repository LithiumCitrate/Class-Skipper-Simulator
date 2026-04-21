const TOTAL_DAYS = 10;
const DAY_LENGTH_SECONDS = 30 * 60;
const PREP_TIME_SECONDS = 400;
const ROLL_CALL_GRACE_SECONDS = 10 * 60;
const ROOMMATE_TRIGGER_AFTER_CLASS = 5 * 60;
const SECOND_ROLL_CALL_OFFSET = 3 * 60;
const TICK_MS = 100;
const GAME_SECONDS_PER_TICK = 2;
const FLOOR_OPTIONS = [1, 2, 3, 4];
const FLOOR_SEARCH_PENALTY_SECONDS = 90;
const ESCAPE_SUCCESS_SCORE = 1;

const courses = [
    {
        id: "math",
        name: "高等数学",
        location: "building7",
        teacher: "张老师",
        riskLabel: "随机点名",
        rollCallChance: 0.35,
        secondRollCallChance: 0.08,
        intro: "张老师嘴上说只讲一遍，名单倒是会讲很多遍。",
        quote: "题可以不会，点名的时候人得会出现。"
    },
    {
        id: "linear",
        name: "线性代数",
        location: "building3",
        teacher: "李老师",
        riskLabel: "看心情",
        rollCallChance: 0.28,
        secondRollCallChance: 0.12,
        intro: "李老师平时很平静，但会突然翻开那本令人心寒的名单。",
        quote: "矩阵可以晚点懂，到课最好别晚。"
    },
    {
        id: "programming",
        name: "程序设计",
        location: "building7",
        teacher: "王老师",
        riskLabel: "现场抽查",
        rollCallChance: 0.24,
        secondRollCallChance: 0.15,
        intro: "这课不一定点名，但很可能现场抓人解释 bug 为什么会长这样。",
        quote: "代码可以不跑，座位最好先到。"
    },
    {
        id: "ideology",
        name: "思想政治",
        location: "building3",
        teacher: "陈老师",
        riskLabel: "高压巡查",
        rollCallChance: 0.7,
        secondRollCallChance: 0.45,
        intro: "陈老师擅长在你刚松口气的时候，顺手再来一轮。",
        quote: "我就随便看看名单，你们不用紧张。"
    },
    {
        id: "history",
        name: "近代史纲要",
        location: "building7",
        teacher: "刘老师",
        riskLabel: "名单在手",
        rollCallChance: 0.76,
        secondRollCallChance: 0.55,
        intro: "刘老师和名单是绑定刷新的，今天大概率不讲武德。",
        quote: "后排同学别躲，我看见你们了。"
    }
];

const locations = {
    dormitory: { x: 70.4, y: 75.6, name: "寝室" },
    canteen: { x: 82.0, y: 70.8, name: "食堂" },
    libraryGate: { x: 24.0, y: 41.8, name: "图书馆" },
    building7: { x: 64.2, y: 41.1, name: "7号教学楼" },
    building3: { x: 88.3, y: 27.7, name: "3号教学楼" }
};

const roadGraph = {
    dormitory: { libraryGate: 420, canteen: 120 },
    libraryGate: { dormitory: 420, building7: 180 },
    canteen: { dormitory: 120, building3: 180 },
    building7: { libraryGate: 180 },
    building3: { canteen: 180 }
};

const roadWaypoints = {
    "dormitory:canteen": [
        { x: 70.4, y: 82.6 },
        { x: 82.0, y: 82.6 }
    ],
    "dormitory:libraryGate": [
        { x: 70.4, y: 82.6 },
        { x: 49.2, y: 82.6 },
        { x: 49.2, y: 54.8 },
        { x: 24.0, y: 54.8 }
    ],
    "libraryGate:building7": [
        { x: 24.0, y: 49.8 },
        { x: 24.0, y: 25.4 },
        { x: 64.2, y: 25.4 }
    ],
    "canteen:building3": [
        { x: 82.0, y: 58.8 },
        { x: 82.0, y: 41.4 },
        { x: 88.3, y: 41.4 }
    ]
};

const teacherMoods = [
    {
        id: "slack",
        name: "摆烂",
        rollCallDelta: -0.12,
        secondRollCallDelta: -0.1,
        headline: "老师今天像刚开完会，懒得多翻名单。",
        quote: "今天随便讲讲，点名看缘分。"
    },
    {
        id: "normal",
        name: "正常",
        rollCallDelta: 0,
        secondRollCallDelta: 0,
        headline: "老师状态在线，按流程走。",
        quote: "该来的还是得来。"
    },
    {
        id: "strict",
        name: "严查",
        rollCallDelta: 0.18,
        secondRollCallDelta: 0.2,
        headline: "老师今天像握着 KPI 一样握着名单。",
        quote: "今天我得看看谁又没来。"
    }
];

const roommateProfiles = [
    {
        id: "sleeping",
        name: "睡死了",
        warningChance: 0.2,
        headline: "室友昨晚通宵，今天消息像扔进黑洞。",
        quote: "指望他通风报信，不如指望老师忘带名单。"
    },
    {
        id: "online",
        name: "刷手机中",
        warningChance: 0.55,
        headline: "室友在群里潜水，偶尔还算有点良心。",
        quote: "你要是运气好，他能给你发一句快跑。"
    },
    {
        id: "reliable",
        name: "秒回战神",
        warningChance: 0.85,
        headline: "室友今天是电子哨兵，风吹草动都会转发。",
        quote: "宿舍战神已上线，名单一翻他先急。"
    }
];

const campusBuzzPool = [
    "班群里有人说“今天应该不点”，这句话的可信度和天气预报差不多。",
    "食堂排队的人都在聊今天查得严，消息来源极其混乱。",
    "有人看见老师提前进楼了，真假未知，但听着就让人腿软。",
    "据说今天只是走流程，问题是老师的流程通常包括翻名单。",
    "隔壁班说这节老师心情一般，“一般”通常意味着更危险。"
];

const dayHeadlines = [
    "先别热血冲锋，校园生存从蹲点开始。",
    "今天要赢，不是靠勇敢，是靠路线和脸色判断。",
    "只要名单翻得比你慢，今天就还有操作空间。",
    "这不是逃课，这是精确到秒的校园求生。"
];

const specialEvents = [
    {
        id: "monitor_ping",
        name: "班长探头",
        summary: "班长突然在群里问“都到齐了吗”，会把第一轮点名提前一点。",
        apply(state) {
            state.eventEffects.firstRollCallOffset = -120;
        },
        triggerMessage: "班长突然在群里发了句“都到齐了吗”。这 usually 不是什么好兆头。",
        badge: "班长盯梢"
    },
    {
        id: "teacher_early",
        name: "老师提前进楼",
        summary: "有人看见老师提前进教学楼，今天老师更容易点名。",
        apply(state) {
            state.eventEffects.rollCallDelta = 0.1;
            state.eventEffects.secondRollCallDelta = 0.08;
        },
        triggerMessage: "有人说老师提前进楼了。你还没进楼的话，现在腿应该已经软了。",
        badge: "老师提前到"
    },
    {
        id: "canteen_queue",
        name: "食堂排队",
        summary: "你刚想顺路买点吃的，结果食堂队伍像春运，今天移动会慢一点。",
        apply(state) {
            state.eventEffects.moveTimeMultiplier = 1.2;
        },
        triggerMessage: "食堂窗口今天像在办限量联名，队伍把你的节奏拖慢了。",
        badge: "被食堂拖住"
    },
    {
        id: "roommate_live",
        name: "室友现场直播",
        summary: "室友今天人在教室前排，还会额外提高一次提醒成功率。",
        apply(state) {
            state.eventEffects.roommateWarningDelta = 0.2;
        },
        triggerMessage: "室友今天人在前排，已经开启课堂实况转播模式。",
        badge: "前排视野"
    }
];

const floorVibes = {
    building7: {
        1: "一楼人来人往，像每个人都知道自己去哪，只有你像游客。",
        2: "二楼拐角全是抱书路过的同学，气氛很像临时抱佛脚展览。",
        3: "三楼安静得可疑，像老师们专门留给迟到生的心理压力测试。",
        4: "四楼风很大，腿也很酸，适合思考人生和为什么不早点出门。"
    },
    building3: {
        1: "一楼公告栏前围着一圈人，像每个人都在等命运刷新。",
        2: "二楼楼道回声很重，你每一步都像在给自己配音。",
        3: "三楼全是熟悉又不熟的面孔，社恐看了想原地撤退。",
        4: "四楼充满一种“都爬到这了不如顺便上课”的宿命感。"
    }
};

const gameState = {
    isRunning: false,
    isPaused: false,
    isMoving: false,
    isInsideBuilding: false,
    isNoticeOpen: false,
    noticeResumeAfterClose: false,
    attendanceResumeAfterClose: false,
    hasSeenNotice: false,
    dayCount: 0,
    dayTime: 0,
    score: 0,
    failCount: 0,
    currentLocation: "dormitory",
    currentMoveTarget: null,
    currentBuildingScene: null,
    playerPosition: { ...locations.dormitory },
    todayClass: null,
    todayClassFloor: null,
    todayFloorRumor: null,
    teacherMood: null,
    roommateProfile: null,
    campusBuzz: "",
    moveSegments: [],
    moveSegmentIndex: 0,
    moveSegmentElapsed: 0,
    moveElapsedTotal: 0,
    moveTotalTime: 0,
    moveEnterClassOnArrival: false,
    classArrivalTime: null,
    isInClass: false,
    pendingAttendanceDecision: false,
    escapedAfterRollCall: false,
    committedToClass: false,
    honestClassSettled: false,
    shouldFirstRollCall: false,
    firstRollCallResolved: false,
    secondRollCallResolved: false,
    shouldSecondRollCall: false,
    roommateWarned: false,
    roommateRolled: false,
    specialEvent: null,
    eventEffects: null,
    bgmEnabled: true,
    sfxEnabled: true,
    isSoundPanelOpen: false,
    audioReady: false,
    floorSearchAttempts: 0,
    wrongFloorCount: 0,
    perfectFloorGuessCount: 0,
    narrowEscapeCount: 0,
    secondRollCallHitCount: 0,
    warningSaveCount: 0
};

const elements = {
    dayCount: document.getElementById("dayCount"),
    currentLocation: document.getElementById("currentLocation"),
    score: document.getElementById("score"),
    failCount: document.getElementById("failCount"),
    startBtn: document.getElementById("startBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    resetBtn: document.getElementById("resetBtn"),
    noticeBtn: document.getElementById("noticeBtn"),
    soundBtn: document.getElementById("soundBtn"),
    soundPanel: document.getElementById("soundPanel"),
    bgmToggleBtn: document.getElementById("bgmToggleBtn"),
    sfxToggleBtn: document.getElementById("sfxToggleBtn"),
    goClassBtn: document.getElementById("goClassBtn"),
    dormitoryBtn: document.getElementById("dormitoryBtn"),
    canteenBtn: document.getElementById("canteenBtn"),
    libraryGateBtn: document.getElementById("libraryGateBtn"),
    building7Btn: document.getElementById("building7Btn"),
    building3Btn: document.getElementById("building3Btn"),
    player: document.getElementById("player"),
    courseNameLarge: document.getElementById("courseNameLarge"),
    courseMeta: document.getElementById("courseMeta"),
    courseCountdown: document.getElementById("courseCountdown"),
    courseBadgeRow: document.getElementById("courseBadgeRow"),
    headlineCopy: document.getElementById("headlineCopy"),
    teacherMood: document.getElementById("teacherMood"),
    roommateMood: document.getElementById("roommateMood"),
    campusBuzz: document.getElementById("campusBuzz"),
    gossipQuote: document.getElementById("gossipQuote"),
    notification: document.getElementById("notification"),
    mapStage: document.querySelector(".map-stage"),
    buildingOverlay: document.getElementById("buildingOverlay"),
    buildingTitle: document.getElementById("buildingTitle"),
    buildingSubtitle: document.getElementById("buildingSubtitle"),
    buildingHint: document.getElementById("buildingHint"),
    buildingFlavor: document.getElementById("buildingFlavor"),
    floorButtons: Array.from(document.querySelectorAll(".floor-button")),
    leaveBuildingBtn: document.getElementById("leaveBuildingBtn"),
    noticeOverlay: document.getElementById("noticeOverlay"),
    noticeCloseBtn: document.getElementById("noticeCloseBtn"),
    attendanceOverlay: document.getElementById("attendanceOverlay"),
    attendanceTitle: document.getElementById("attendanceTitle"),
    attendanceMessage: document.getElementById("attendanceMessage"),
    attendanceRunBtn: document.getElementById("attendanceRunBtn"),
    attendanceStayBtn: document.getElementById("attendanceStayBtn"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    gameOverTitle: document.getElementById("gameOverTitle"),
    gameOverMessage: document.getElementById("gameOverMessage"),
    finalScore: document.getElementById("finalScore"),
    finalTime: document.getElementById("finalTime"),
    restartBtn: document.getElementById("restartBtn")
};

let gameInterval = null;
let notificationTimeout = null;
let feedbackTimeout = null;
let audioContext = null;
let bgmAudio = null;

function initGame() {
    clearInterval(gameInterval);
    gameInterval = null;

    Object.assign(gameState, {
        isRunning: false,
        isPaused: false,
        isMoving: false,
        isInsideBuilding: false,
        isNoticeOpen: false,
        noticeResumeAfterClose: false,
        attendanceResumeAfterClose: false,
        hasSeenNotice: false,
        dayCount: 0,
        dayTime: 0,
        score: 0,
        failCount: 0,
        currentLocation: "dormitory",
        currentMoveTarget: null,
        currentBuildingScene: null,
        playerPosition: { ...locations.dormitory },
        todayClass: null,
        todayClassFloor: null,
        todayFloorRumor: null,
        teacherMood: null,
        roommateProfile: null,
        campusBuzz: "",
        moveSegments: [],
        moveSegmentIndex: 0,
        moveSegmentElapsed: 0,
        moveElapsedTotal: 0,
        moveTotalTime: 0,
        moveEnterClassOnArrival: false,
        classArrivalTime: null,
        isInClass: false,
        pendingAttendanceDecision: false,
        escapedAfterRollCall: false,
        committedToClass: false,
        honestClassSettled: false,
        shouldFirstRollCall: false,
        firstRollCallResolved: false,
        secondRollCallResolved: false,
        shouldSecondRollCall: false,
        roommateWarned: false,
        roommateRolled: false,
        specialEvent: null,
        eventEffects: createDefaultEventEffects(),
        bgmEnabled: true,
        sfxEnabled: true,
        isSoundPanelOpen: false,
        audioReady: false,
        floorSearchAttempts: 0,
        wrongFloorCount: 0,
        perfectFloorGuessCount: 0,
        narrowEscapeCount: 0,
        secondRollCallHitCount: 0,
        warningSaveCount: 0
    });

    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = "暂停";
    elements.goClassBtn.disabled = true;
    elements.soundBtn.textContent = "音效：开";
    updateSoundControls();
    elements.gameOverScreen.classList.remove("show");
    elements.gameOverScreen.setAttribute("aria-hidden", "true");
    closeBuildingOverlay(false);
    closeNoticeOverlay(false);
    closeAttendanceOverlay(false);
    stopBgm();
    updateSoundControls();
    elements.player.classList.remove("moving");
    elements.player.style.setProperty("--player-facing", "1");
    updateUI();
    openNoticeOverlay({ auto: true });
}

function startGame() {
    ensureAudioReady();
    ensureBgmReady();
    if (gameState.isRunning && !gameState.isPaused) {
        syncBgmPlayback();
        return;
    }

    if (!gameState.isRunning) {
        startNewDay();
    }

    gameState.isRunning = true;
    gameState.isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    syncBgmPlayback();
    elements.pauseBtn.textContent = "暂停";

    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        gameState.dayTime += GAME_SECONDS_PER_TICK;
        advanceMovement(GAME_SECONDS_PER_TICK);
        checkCourseLogic();

        if (gameState.dayTime >= DAY_LENGTH_SECONDS) {
            settleClassAtDayEnd();
            nextDay();
            return;
        }

        checkGameStatus();
        updateUI();
    }, TICK_MS);
}

function pauseGame() {
    if (!gameState.isRunning) {
        return;
    }

    if (gameState.isNoticeOpen || gameState.pendingAttendanceDecision) {
        return;
    }

    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
        clearInterval(gameInterval);
        gameInterval = null;
        elements.pauseBtn.textContent = "继续";
        showNotification("时间暂停了，人物和路线会一起冻结。", "info");
        return;
    }

    startGame();
}

function pauseForOverlay() {
    if (!gameState.isRunning || gameState.isPaused) {
        return false;
    }

    clearInterval(gameInterval);
    gameInterval = null;
    gameState.isPaused = true;
    elements.pauseBtn.textContent = "继续";
    return true;
}

function resumeAfterOverlay() {
    if (!gameState.noticeResumeAfterClose) {
        return;
    }

    gameState.noticeResumeAfterClose = false;
    startGame();
}

function resetGame() {
    initGame();
    showNotification("已经回到第一天。名单清空，心态重来。", "info");
}

function startNewDay() {
    gameState.dayCount += 1;
    gameState.dayTime = 0;
    gameState.todayClass = sample(courses);
    gameState.todayClassFloor = sample(FLOOR_OPTIONS);
    gameState.teacherMood = sample(teacherMoods);
    gameState.roommateProfile = sample(roommateProfiles);
    gameState.campusBuzz = sample(campusBuzzPool);
    gameState.todayFloorRumor = createFloorRumor();
    gameState.currentLocation = "dormitory";
    gameState.currentMoveTarget = null;
    gameState.currentBuildingScene = null;
    gameState.playerPosition = { ...locations.dormitory };
    gameState.moveSegments = [];
    gameState.moveSegmentIndex = 0;
    gameState.moveSegmentElapsed = 0;
    gameState.moveElapsedTotal = 0;
    gameState.moveTotalTime = 0;
    gameState.moveEnterClassOnArrival = false;
    gameState.isMoving = false;
    gameState.isInsideBuilding = false;
    gameState.classArrivalTime = null;
    gameState.isInClass = false;
    gameState.pendingAttendanceDecision = false;
    gameState.escapedAfterRollCall = false;
    gameState.committedToClass = false;
    gameState.honestClassSettled = false;
    gameState.shouldFirstRollCall = false;
    gameState.firstRollCallResolved = false;
    gameState.secondRollCallResolved = false;
    gameState.roommateWarned = false;
    gameState.roommateRolled = false;
    gameState.floorSearchAttempts = 0;
    gameState.specialEvent = sample(specialEvents);
    gameState.eventEffects = createDefaultEventEffects();
    gameState.specialEvent.apply(gameState);
    gameState.shouldFirstRollCall = Math.random() < getEffectiveRollCallChance();
    gameState.shouldSecondRollCall = rollSecondCall();
    elements.player.classList.remove("moving");
    closeBuildingOverlay(false);
    closeAttendanceOverlay(false);

    elements.headlineCopy.textContent = sample(dayHeadlines);
    showNotification(
        `第 ${gameState.dayCount} 天开始。今天是 ${gameState.todayClass.name}，${gameState.teacherMood.name} 模式，班群传闻在 ${formatFloor(gameState.todayFloorRumor.hintedFloor)}。`,
        "info"
    );
    showNotification(gameState.specialEvent.triggerMessage, "warning");
    updateUI();
}

function nextDay() {
    if (gameState.dayCount >= TOTAL_DAYS) {
        endGame(true);
        return;
    }

    startNewDay();
}

function updateUI() {
    elements.dayCount.textContent = gameState.dayCount;
    elements.currentLocation.textContent = gameState.isInsideBuilding
        ? `${locations[gameState.currentLocation]?.name ?? "楼内"}`
        : locations[gameState.currentLocation]?.name ?? "路上";
    elements.score.textContent = gameState.score;
    elements.failCount.textContent = gameState.failCount;

    if (gameState.todayClass) {
        const locationName = locations[gameState.todayClass.location].name;
        elements.courseNameLarge.textContent = gameState.todayClass.name;
        elements.courseMeta.textContent = `${gameState.todayClass.teacher} · 上课地点 ${locationName} · 班群传闻 ${formatFloor(gameState.todayFloorRumor?.hintedFloor)} · ${gameState.todayClass.intro}`;
        elements.courseCountdown.textContent = getCourseStatusText();
        elements.teacherMood.textContent = `${gameState.teacherMood.name}：${gameState.teacherMood.headline}`;
        elements.roommateMood.textContent = `${gameState.roommateProfile.name}：${gameState.roommateProfile.headline}`;
        elements.campusBuzz.textContent = gameState.campusBuzz;
        elements.gossipQuote.textContent = `“${getQuoteForToday()}”`;
        renderCourseBadges();
        elements.goClassBtn.disabled = !gameState.isRunning || gameState.isPaused || gameState.isMoving;
    } else {
        elements.courseNameLarge.textContent = "等待开始";
        elements.courseMeta.textContent = "每天开始上课前有 20 秒现实时间准备，对应 400 秒游戏时间。";
        elements.courseCountdown.textContent = "点击开始游戏";
        elements.teacherMood.textContent = "未刷新";
        elements.roommateMood.textContent = "未刷新";
        elements.campusBuzz.textContent = "今天还没人放风。";
        elements.gossipQuote.textContent = "“这节不点名”和“老师马上下课”通常一样不可信。";
        elements.courseBadgeRow.innerHTML = "";
        elements.goClassBtn.disabled = true;
    }

    updatePlayerPosition();
    updateMarkers();
    renderBuildingOverlay();
}

function renderCourseBadges() {
    const badges = [
        gameState.todayClass.riskLabel,
        gameState.teacherMood.name,
        gameState.roommateProfile.name,
        gameState.shouldSecondRollCall ? "疑似二次点名" : "今日单轮点名",
        `传闻${formatFloor(gameState.todayFloorRumor?.hintedFloor)}`,
        gameState.specialEvent?.badge ?? "今日无事"
    ];

    elements.courseBadgeRow.innerHTML = badges.map((label) => `<span class="badge">${label}</span>`).join("");
}

function getCourseStatusText() {
    if (!gameState.todayClass) {
        return "今天还没有课程。";
    }

    if (gameState.isMoving && gameState.currentMoveTarget) {
        const remaining = Math.max(0, gameState.moveTotalTime - gameState.moveElapsedTotal);
        return `沿路前往 ${locations[gameState.currentMoveTarget].name}，还需 ${Math.ceil(remaining)} 秒。`;
    }

    if (gameState.isInsideBuilding && gameState.currentBuildingScene) {
        return `你已经冲进 ${locations[gameState.currentBuildingScene].name}，正在楼道里赌今天教室藏在哪层。跑错一层会额外浪费 ${FLOOR_SEARCH_PENALTY_SECONDS} 秒。`;
    }

    if (gameState.pendingAttendanceDecision) {
        return "老师刚点完名，你得立刻决定是继续留着还是直接跑掉。";
    }

    if (gameState.committedToClass && gameState.isInClass) {
        return gameState.shouldSecondRollCall && !gameState.secondRollCallResolved
            ? "你决定老实留在教室里。现在不加分也不扣分，但得防老师二次点名。"
            : "你决定老实留在教室里。今天这节课不加分，也不扣分，熬到下课就算平安。";
    }

    if (gameState.escapedAfterRollCall && gameState.shouldSecondRollCall && !gameState.secondRollCallResolved) {
        return "你已经在第一次点名后开溜，但老师可能还会回头补刀。";
    }

    if (gameState.currentLocation === gameState.todayClass.location && !gameState.isInClass) {
        return `你已经到 ${locations[gameState.currentLocation].name} 楼下了，下一步是选楼层。班群统一口径是 ${formatFloor(gameState.todayFloorRumor?.hintedFloor)}。`;
    }

    if (gameState.dayTime < PREP_TIME_SECONDS) {
        return `准备时间还剩 ${PREP_TIME_SECONDS - gameState.dayTime} 秒。`;
    }

    const firstRollCallTime = getFirstRollCallTime();
    const secondRollCallTime = firstRollCallTime + SECOND_ROLL_CALL_OFFSET;

    if (!gameState.firstRollCallResolved) {
        if (!gameState.shouldFirstRollCall) {
            return "老师看起来还没打算点名，今天也许真能赌一把。";
        }
        return `距离第一轮点名还有 ${Math.max(0, firstRollCallTime - gameState.dayTime)} 秒。`;
    }

    if (gameState.shouldSecondRollCall && !gameState.secondRollCallResolved) {
        return `第一轮点名已过，老师还可能在 ${Math.max(0, secondRollCallTime - gameState.dayTime)} 秒后回头补刀。`;
    }

    return "今天的点名流程已经结束，可以准备下一天了。";
}

function getQuoteForToday() {
    if (!gameState.todayClass || !gameState.teacherMood || !gameState.roommateProfile) {
        return "先别慌，等课表刷新。";
    }

    if (gameState.teacherMood.id === "strict") {
        return gameState.todayClass.quote;
    }

    if (gameState.roommateProfile.id === "reliable") {
        return gameState.roommateProfile.quote;
    }

    return gameState.teacherMood.quote;
}

function updatePlayerPosition() {
    elements.player.style.left = `${gameState.playerPosition.x}%`;
    elements.player.style.top = `${gameState.playerPosition.y}%`;
    elements.player.style.zIndex = `${Math.round(20 + gameState.playerPosition.y * 10)}`;
}

function updateMarkers() {
    document.querySelectorAll(".location-marker").forEach((button) => {
        button.classList.remove("active", "target");
    });

    const activeMap = {
        dormitory: elements.dormitoryBtn,
        canteen: elements.canteenBtn,
        libraryGate: elements.libraryGateBtn,
        building7: elements.building7Btn,
        building3: elements.building3Btn
    };

    const activeButton = activeMap[gameState.currentLocation];
    if (activeButton) {
        activeButton.classList.add("active");
    }

    if (gameState.currentMoveTarget && activeMap[gameState.currentMoveTarget]) {
        activeMap[gameState.currentMoveTarget].classList.add("target");
    } else if (gameState.isInsideBuilding && activeButton) {
        activeButton.classList.add("target");
    }
}

function ensureAudioReady() {
    if (gameState.audioReady || !gameState.sfxEnabled) {
        return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
        return;
    }

    audioContext = new AudioContextCtor();
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    gameState.audioReady = true;
}

function ensureBgmReady() {
    if (bgmAudio) {
        return;
    }

    bgmAudio = new Audio("Tiptoeing.mp3");
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = 0.42;
}

function syncBgmPlayback() {
    ensureBgmReady();
    if (!bgmAudio) {
        return;
    }

    if (!gameState.bgmEnabled || !gameState.isRunning || gameState.isPaused) {
        bgmAudio.pause();
        return;
    }

    const playPromise = bgmAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }
}

function stopBgm() {
    if (!bgmAudio) {
        return;
    }

    bgmAudio.pause();
    bgmAudio.currentTime = 0;
}

function updateSoundControls() {
    elements.soundBtn.textContent = gameState.isSoundPanelOpen ? "收起声音设置" : "声音设置";
    elements.soundPanel.classList.toggle("show", gameState.isSoundPanelOpen);
    elements.soundPanel.setAttribute("aria-hidden", gameState.isSoundPanelOpen ? "false" : "true");
    elements.bgmToggleBtn.textContent = gameState.bgmEnabled ? "开" : "关";
    elements.sfxToggleBtn.textContent = gameState.sfxEnabled ? "开" : "关";
}

function toggleSoundPanel() {
    gameState.isSoundPanelOpen = !gameState.isSoundPanelOpen;
    updateSoundControls();
}

function toggleBgm() {
    gameState.bgmEnabled = !gameState.bgmEnabled;
    if (!gameState.bgmEnabled) {
        stopBgm();
    } else {
        syncBgmPlayback();
    }
    updateSoundControls();
}

function toggleSfx() {
    gameState.sfxEnabled = !gameState.sfxEnabled;
    if (gameState.sfxEnabled) {
        ensureAudioReady();
        playFeedbackSound("info");
    }
    updateSoundControls();
}

function playFeedbackSound(type) {
    if (!gameState.sfxEnabled) {
        return;
    }

    ensureAudioReady();
    if (!audioContext) {
        return;
    }

    const now = audioContext.currentTime;
    const sequences = {
        info: [392, 494],
        success: [523, 659, 784],
        warning: [440, 392, 440],
        danger: [330, 247, 196]
    };
    const notes = sequences[type] || sequences.info;

    notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = type === "danger" ? "sawtooth" : "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.04, now + index * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.07);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now + index * 0.08);
        oscillator.stop(now + index * 0.08 + 0.08);
    });
}

function flashMapFeedback(type) {
    clearTimeout(feedbackTimeout);
    elements.mapStage.classList.remove("feedback-success", "feedback-warning", "feedback-danger");
    if (!["success", "warning", "danger"].includes(type)) {
        return;
    }

    elements.mapStage.classList.add(`feedback-${type}`);
    feedbackTimeout = setTimeout(() => {
        elements.mapStage.classList.remove("feedback-success", "feedback-warning", "feedback-danger");
    }, 520);
}

function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function createDefaultEventEffects() {
    return {
        firstRollCallOffset: 0,
        rollCallDelta: 0,
        secondRollCallDelta: 0,
        roommateWarningDelta: 0,
        moveTimeMultiplier: 1
    };
}

function getFirstRollCallTime() {
    return PREP_TIME_SECONDS + ROLL_CALL_GRACE_SECONDS + gameState.eventEffects.firstRollCallOffset;
}

function getEffectiveRollCallChance() {
    return clamp(
        gameState.todayClass.rollCallChance +
            gameState.teacherMood.rollCallDelta +
            gameState.eventEffects.rollCallDelta,
        0.08,
        0.95
    );
}

function getEffectiveSecondRollCallChance() {
    return clamp(
        gameState.todayClass.secondRollCallChance +
            gameState.teacherMood.secondRollCallDelta +
            gameState.eventEffects.secondRollCallDelta,
        0.02,
        0.95
    );
}

function rollSecondCall() {
    return Math.random() < getEffectiveSecondRollCallChance();
}

function buildSegmentsFromPath(path) {
    const segments = [];
    let totalTime = 0;

    for (let index = 0; index < path.length - 1; index += 1) {
        const from = path[index];
        const to = path[index + 1];
        const edgeTime = Math.round(roadGraph[from][to] * gameState.eventEffects.moveTimeMultiplier);
        const edgePoints = getRoutePoints(from, to);
        const edgeSegments = buildSegmentsForPoints(from, to, edgePoints, edgeTime);

        edgeSegments.forEach((segment) => {
            segments.push(segment);
            totalTime += segment.time;
        });
    }

    return { segments, totalTime };
}

function getRoutePoints(from, to) {
    const directKey = `${from}:${to}`;
    if (roadWaypoints[directKey]) {
        return [locations[from], ...roadWaypoints[directKey], locations[to]];
    }

    const reverseKey = `${to}:${from}`;
    if (roadWaypoints[reverseKey]) {
        return [locations[from], ...[...roadWaypoints[reverseKey]].reverse(), locations[to]];
    }

    return [locations[from], locations[to]];
}

function buildSegmentsForPoints(from, to, points, totalTime) {
    if (points.length < 2) {
        return [];
    }

    const distances = [];
    let distanceSum = 0;

    for (let index = 0; index < points.length - 1; index += 1) {
        const distance = getPointDistance(points[index], points[index + 1]);
        distances.push(distance);
        distanceSum += distance;
    }

    let remainingTime = Math.max(1, totalTime);
    let remainingDistance = Math.max(distanceSum, 1);

    return distances.map((distance, index) => {
        const isLastSegment = index === distances.length - 1;
        const remainingSegments = distances.length - index - 1;
        const suggestedTime = Math.round((distance / remainingDistance) * remainingTime);
        const segmentTime = isLastSegment
            ? remainingTime
            : Math.max(1, Math.min(remainingTime - remainingSegments, suggestedTime));

        remainingTime -= segmentTime;
        remainingDistance -= distance;

        return {
            from,
            to,
            fromPoint: points[index],
            toPoint: points[index + 1],
            time: Math.max(1, segmentTime)
        };
    });
}

function getPointDistance(fromPoint, toPoint) {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function findShortestPath(start, target) {
    if (start === target) {
        return [start];
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(roadGraph));

    Object.keys(roadGraph).forEach((node) => {
        distances[node] = Number.POSITIVE_INFINITY;
    });
    distances[start] = 0;

    while (unvisited.size > 0) {
        let current = null;
        let bestDistance = Number.POSITIVE_INFINITY;

        unvisited.forEach((node) => {
            if (distances[node] < bestDistance) {
                bestDistance = distances[node];
                current = node;
            }
        });

        if (!current || bestDistance === Number.POSITIVE_INFINITY) {
            break;
        }

        unvisited.delete(current);
        if (current === target) {
            break;
        }

        Object.entries(roadGraph[current]).forEach(([neighbor, weight]) => {
            if (!unvisited.has(neighbor)) {
                return;
            }

            const nextDistance = distances[current] + weight;
            if (nextDistance < distances[neighbor]) {
                distances[neighbor] = nextDistance;
                previous[neighbor] = current;
            }
        });
    }

    const path = [];
    let cursor = target;
    while (cursor) {
        path.unshift(cursor);
        cursor = previous[cursor];
    }

    return path[0] === start ? path : [];
}

function moveToLocation(targetLocation, options = {}) {
    if (!gameState.isRunning || gameState.isPaused) {
        showNotification("先开始游戏。现在连蹲点都还没开始。", "warning");
        return;
    }

    if (gameState.pendingAttendanceDecision) {
        showNotification("先决定点名后是继续留着还是直接跑路。", "warning");
        return;
    }

    if (gameState.isInsideBuilding) {
        showNotification("先把楼层找明白，再决定往哪跑。", "warning");
        return;
    }

    if (gameState.isMoving) {
        showNotification("你已经在路上了，先把这一段走完。", "warning");
        return;
    }

    if (gameState.isInClass && !options.forceMove) {
        showNotification("你人已经在教室里了，再乱跑就太明显了。", "warning");
        return;
    }

    if (gameState.currentLocation === targetLocation) {
        if (options.enterClass && targetLocation === gameState.todayClass?.location) {
            openBuildingOverlay(targetLocation);
            return;
        }

        showNotification(`你已经在${locations[targetLocation].name}。继续蹲点也行。`, "info");
        return;
    }

    const path = findShortestPath(gameState.currentLocation, targetLocation);
    if (path.length < 2) {
        showNotification("这条路现在走不过去。", "danger");
        return;
    }

    const { segments, totalTime } = buildSegmentsFromPath(path);
    gameState.isMoving = true;
    gameState.currentMoveTarget = targetLocation;
    gameState.moveSegments = segments;
    gameState.moveSegmentIndex = 0;
    gameState.moveSegmentElapsed = 0;
    gameState.moveElapsedTotal = 0;
    gameState.moveTotalTime = totalTime;
    gameState.moveEnterClassOnArrival = Boolean(options.enterClass && targetLocation === gameState.todayClass?.location);
    gameState.isInClass = false;
    gameState.classArrivalTime = null;
    elements.player.classList.add("moving");

    showNotification(
        `沿路前往${locations[targetLocation].name}，预计 ${totalTime} 秒游戏时间。蹲点路线开始执行。`,
        "info"
    );
    updateUI();
}

function advanceMovement(stepSeconds) {
    if (!gameState.isMoving || gameState.moveSegments.length === 0) {
        return;
    }

    let remainingStep = stepSeconds;
    while (remainingStep > 0 && gameState.isMoving) {
        const segment = gameState.moveSegments[gameState.moveSegmentIndex];
        const remainingSegmentTime = segment.time - gameState.moveSegmentElapsed;
        const consumed = Math.min(remainingStep, remainingSegmentTime);

        gameState.moveSegmentElapsed += consumed;
        gameState.moveElapsedTotal += consumed;
        remainingStep -= consumed;

        const ratio = segment.time === 0 ? 1 : gameState.moveSegmentElapsed / segment.time;
        gameState.playerPosition = interpolate(segment.fromPoint, segment.toPoint, ratio);
        updateFacing(segment.fromPoint, segment.toPoint);

        if (gameState.moveSegmentElapsed >= segment.time) {
            gameState.currentLocation = segment.to;
            gameState.playerPosition = { ...segment.toPoint };
            gameState.moveSegmentIndex += 1;
            gameState.moveSegmentElapsed = 0;

            if (gameState.moveSegmentIndex >= gameState.moveSegments.length) {
                finishMovement();
            }
        }
    }
}

function finishMovement() {
    const targetLocation = gameState.currentMoveTarget;
    gameState.isMoving = false;
    gameState.currentMoveTarget = null;
    gameState.moveSegments = [];
    gameState.moveSegmentIndex = 0;
    gameState.moveSegmentElapsed = 0;
    gameState.moveElapsedTotal = 0;
    gameState.moveTotalTime = 0;
    elements.player.classList.remove("moving");

    if (gameState.moveEnterClassOnArrival && targetLocation === gameState.todayClass?.location) {
        gameState.moveEnterClassOnArrival = false;
        openBuildingOverlay(targetLocation);
        showNotification(`已冲到${locations[targetLocation].name}门口，快决定楼层。`, "success");
        return;
    }

    gameState.moveEnterClassOnArrival = false;
    showNotification(`已到达${locations[gameState.currentLocation].name}。现在可以继续蹲点或冲教室。`, "success");
}

function interpolate(fromPoint, toPoint, ratio) {
    return {
        x: fromPoint.x + (toPoint.x - fromPoint.x) * ratio,
        y: fromPoint.y + (toPoint.y - fromPoint.y) * ratio
    };
}

function updateFacing(fromPoint, toPoint) {
    const facing = toPoint.x < fromPoint.x ? -1 : 1;
    elements.player.style.setProperty("--player-facing", String(facing));
}

function goToClass() {
    if (!gameState.todayClass) {
        showNotification("今天没有课。那你这局已经赢一半了。", "info");
        return;
    }

    if (gameState.currentLocation === gameState.todayClass.location && !gameState.isMoving) {
        openBuildingOverlay(gameState.todayClass.location);
        return;
    }

    moveToLocation(gameState.todayClass.location, { enterClass: true });
}

function openBuildingOverlay(buildingId) {
    if (!isTeachingBuilding(buildingId)) {
        return;
    }

    gameState.currentBuildingScene = buildingId;
    gameState.isInsideBuilding = true;
    elements.buildingOverlay.classList.add("show");
    elements.buildingOverlay.setAttribute("aria-hidden", "false");
    renderBuildingOverlay();
}

function openNoticeOverlay(options = {}) {
    const { auto = false } = options;
    if (gameState.isNoticeOpen) {
        return;
    }

    gameState.noticeResumeAfterClose = pauseForOverlay();
    gameState.isNoticeOpen = true;
    if (auto) {
        gameState.hasSeenNotice = true;
    }
    elements.noticeOverlay.classList.add("show");
    elements.noticeOverlay.setAttribute("aria-hidden", "false");
}

function closeNoticeOverlay(withResume = true) {
    gameState.isNoticeOpen = false;
    elements.noticeOverlay.classList.remove("show");
    elements.noticeOverlay.setAttribute("aria-hidden", "true");
    if (withResume) {
        resumeAfterOverlay();
    }
}

function openAttendanceOverlay() {
    if (!gameState.todayClass) {
        return;
    }

    gameState.attendanceResumeAfterClose = pauseForOverlay();
    gameState.pendingAttendanceDecision = true;
    elements.attendanceTitle.textContent = `老师刚点完 ${gameState.todayClass.name} 的名`;
    elements.attendanceMessage.textContent = gameState.shouldSecondRollCall
        ? "你现在可以直接跑，但老师看起来不像准备收名单的样子。继续留着不会加分，也不会扣分；直接跑掉则有可能吃到二次点名。"
        : "现在可以直接跑掉拿逃课分，也可以继续留在教室里当老实人。继续留着不会加分，也不会扣分。";
    elements.attendanceOverlay.classList.add("show");
    elements.attendanceOverlay.setAttribute("aria-hidden", "false");
}

function closeAttendanceOverlay(withResume = true) {
    gameState.pendingAttendanceDecision = false;
    elements.attendanceOverlay.classList.remove("show");
    elements.attendanceOverlay.setAttribute("aria-hidden", "true");
    if (withResume && gameState.attendanceResumeAfterClose) {
        gameState.attendanceResumeAfterClose = false;
        startGame();
    } else {
        gameState.attendanceResumeAfterClose = false;
    }
}

function closeBuildingOverlay(withUpdate = true) {
    gameState.isInsideBuilding = false;
    gameState.currentBuildingScene = null;
    elements.buildingOverlay.classList.remove("show");
    elements.buildingOverlay.setAttribute("aria-hidden", "true");
    if (withUpdate) {
        updateUI();
    }
}

function renderBuildingOverlay() {
    if (!gameState.isInsideBuilding || !gameState.currentBuildingScene || !gameState.todayClass) {
        elements.buildingOverlay.classList.remove("show");
        elements.buildingOverlay.setAttribute("aria-hidden", "true");
        return;
    }

    const buildingId = gameState.currentBuildingScene;
    const atCorrectBuilding = buildingId === gameState.todayClass.location;
    const recommendedFloor =
        gameState.floorSearchAttempts >= 2 ? gameState.todayClassFloor : gameState.todayFloorRumor?.hintedFloor;
    const hintText =
        gameState.floorSearchAttempts >= 2
            ? `你已经在楼里迷路两次，热心同学终于指路：教室真在 ${formatFloor(gameState.todayClassFloor)}。`
            : getTodayRumorText();

    elements.buildingOverlay.classList.add("show");
    elements.buildingOverlay.setAttribute("aria-hidden", "false");
    elements.buildingTitle.textContent = `${locations[buildingId].name} · 楼层选择`;
    elements.buildingSubtitle.textContent = atCorrectBuilding
        ? `${gameState.todayClass.name} 今天随机刷在某一层，你得先选对楼层。`
        : `今天这门课不在这栋楼。你进来只会收获迷路和步数。`;
    elements.buildingHint.textContent = atCorrectBuilding
        ? hintText
        : `这栋楼今天没有你的课。真正目标在 ${locations[gameState.todayClass.location].name}。`;
    elements.buildingFlavor.textContent = getBuildingFlavor(buildingId, recommendedFloor);

    elements.floorButtons.forEach((button) => {
        const floor = Number(button.dataset.floor);
        button.classList.toggle("recommended", atCorrectBuilding && recommendedFloor === floor);
        button.classList.toggle("locked", !atCorrectBuilding);
        button.disabled = !atCorrectBuilding;
    });
}

function chooseFloor(floor) {
    if (!gameState.isInsideBuilding || !gameState.todayClass) {
        return;
    }

    if (gameState.currentBuildingScene !== gameState.todayClass.location) {
        showNotification("这栋楼今天没你的课，再翻楼层也翻不出教室。", "warning");
        return;
    }

    if (floor === gameState.todayClassFloor) {
        if (gameState.floorSearchAttempts === 0) {
            gameState.perfectFloorGuessCount += 1;
        }
        closeBuildingOverlay(false);
        enterClassroom();
        return;
    }

    gameState.floorSearchAttempts += 1;
    gameState.wrongFloorCount += 1;
    gameState.dayTime = Math.min(DAY_LENGTH_SECONDS, gameState.dayTime + FLOOR_SEARCH_PENALTY_SECONDS);
    showNotification(
        `你冲上了 ${formatFloor(floor)}，结果这层全是无关群众。白白浪费 ${FLOOR_SEARCH_PENALTY_SECONDS} 秒。`,
        "warning"
    );
    checkCourseLogic();
    checkGameStatus();
    updateUI();
}

function enterClassroom() {
    if (!gameState.todayClass) {
        return;
    }

    gameState.isInClass = true;
    gameState.classArrivalTime = gameState.dayTime;
    gameState.pendingAttendanceDecision = false;
    gameState.escapedAfterRollCall = false;
    gameState.committedToClass = false;
    gameState.honestClassSettled = false;
    if (gameState.roommateWarned) {
        gameState.warningSaveCount += 1;
        gameState.roommateWarned = false;
    }
    showNotification(
        `你已经进入 ${gameState.todayClass.name} 的 ${formatFloor(gameState.todayClassFloor)} 教室。先低头，装作刚到。`,
        "success"
    );
    updateUI();
}

function checkCourseLogic() {
    if (!gameState.todayClass) {
        return;
    }

    maybeTriggerRoommateWarning();

    const firstRollCallTime = getFirstRollCallTime();
    const secondRollCallTime = firstRollCallTime + SECOND_ROLL_CALL_OFFSET;

    if (!gameState.firstRollCallResolved && gameState.dayTime >= firstRollCallTime) {
        if (gameState.shouldFirstRollCall) {
            resolveRollCall("first");
        } else {
            gameState.firstRollCallResolved = true;
            showNotification("老师今天居然真没点第一轮。先别高兴太早。", "success");
        }
    }

    if (
        gameState.shouldSecondRollCall &&
        gameState.firstRollCallResolved &&
        !gameState.secondRollCallResolved &&
        gameState.dayTime >= secondRollCallTime
    ) {
        resolveRollCall("second");
    }
}

function maybeTriggerRoommateWarning() {
    if (gameState.roommateWarned || gameState.roommateRolled || !gameState.todayClass) {
        return;
    }

    if (gameState.dayTime < PREP_TIME_SECONDS + ROOMMATE_TRIGGER_AFTER_CLASS) {
        return;
    }

    gameState.roommateRolled = true;
    const moodAdjustment = gameState.teacherMood.id === "strict" ? 0.08 : 0;
    const warningChance = clamp(
        gameState.roommateProfile.warningChance +
            moodAdjustment +
            gameState.eventEffects.roommateWarningDelta,
        0.1,
        0.95
    );

    if (Math.random() <= warningChance) {
        gameState.roommateWarned = true;
        showNotification(
            `室友发来 9 秒语音，翻译成人话只有两个字：快跑。${gameState.todayClass.name} 可能要点名。`,
            "warning"
        );
    }
}

function resolveRollCall(stage) {
    const stageLabel = stage === "first" ? "第一轮点名" : "第二轮点名";
    const inCorrectClassroom =
        gameState.currentLocation === gameState.todayClass.location && gameState.isInClass;

    if (stage === "first") {
        gameState.firstRollCallResolved = true;
    } else {
        gameState.secondRollCallResolved = true;
    }

    if (inCorrectClassroom && gameState.classArrivalTime !== null) {
        const attendanceDuration = gameState.dayTime - gameState.classArrivalTime;

        if (attendanceDuration < ROLL_CALL_GRACE_SECONDS) {
            if (stage === "first") {
                gameState.score += 1;
                gameState.narrowEscapeCount += 1;
                showNotification(`${stageLabel}擦线过关。你只混了不到 10 分钟，得分 +1。`, "success");
            } else {
                gameState.score -= 1;
                gameState.secondRollCallHitCount += 1;
                showNotification(`${stageLabel}来了个回马枪。你本来都想溜了，结果还是被拖住，得分 -1。`, "warning");
            }
        } else {
            gameState.score -= 1;
            if (stage === "second") {
                gameState.secondRollCallHitCount += 1;
            }
            showNotification(`${stageLabel}撞上了，你这次属于真的坐满了，得分 -1。`, "warning");
        }
    } else {
        gameState.failCount += 1;
        gameState.score -= 1;
        if (stage === "second") {
            gameState.secondRollCallHitCount += 1;
        }
        closeBuildingOverlay(false);
        showNotification(`${stageLabel}没赶上，${gameState.todayClass.name} 逃课失败，得分 -1。`, "danger");
    }

    if (stage === "first" && gameState.shouldSecondRollCall) {
        showNotification("老师翻完一轮名单还没收起来，今天很可能还有第二下。", "warning");
    }

    if (stage === "second" || !gameState.shouldSecondRollCall) {
        gameState.isInClass = false;
    }
}

function checkGameStatus() {
    if (gameState.failCount >= 3) {
        endGame(false);
    }
}

function resolveRollCall(stage) {
    const stageLabel = stage === "first" ? "第一轮点名" : "第二轮点名";
    const inCorrectClassroom =
        gameState.currentLocation === gameState.todayClass.location && gameState.isInClass;

    if (stage === "first") {
        gameState.firstRollCallResolved = true;
    } else {
        gameState.secondRollCallResolved = true;
    }

    if (stage === "first") {
        if (!inCorrectClassroom || gameState.classArrivalTime === null) {
            failCurrentClass(`${stageLabel}没赶上，${gameState.todayClass.name} 逃课失败。`);
            return;
        }

        if (gameState.shouldSecondRollCall) {
            showNotification("老师翻完第一轮名单还没收起来，今天很可能还有第二下。", "warning");
        } else {
            showNotification("第一轮点名已经过去了，现在是继续留着还是立刻开溜。", "success");
        }

        openAttendanceOverlay();
        updateUI();
        return;
    }

    if (!inCorrectClassroom || gameState.classArrivalTime === null) {
        gameState.secondRollCallHitCount += 1;
        failCurrentClass(`${stageLabel}回头补刀，你不在教室里，当场翻车。`);
        return;
    }

    if (gameState.committedToClass) {
        showNotification(`${stageLabel}来了，你选择老实留着，安全过关，不加分也不扣分。`, "success");
        updateUI();
        return;
    }

    gameState.escapedAfterRollCall = false;
    showNotification(`${stageLabel}来了，但你及时回到了教室，惊险过关，不加分也不扣分。`, "success");
    updateUI();
}

function chooseStayAfterRollCall() {
    gameState.committedToClass = true;
    gameState.escapedAfterRollCall = false;
    closeAttendanceOverlay(true);
    showNotification("你决定继续留在教室里。这节课不加分，也不扣分，但得把后续风险熬过去。", "info");
    updateUI();
}

function chooseRunAfterRollCall() {
    const attendanceDuration = gameState.classArrivalTime === null
        ? ROLL_CALL_GRACE_SECONDS
        : gameState.dayTime - gameState.classArrivalTime;

    gameState.committedToClass = false;
    gameState.escapedAfterRollCall = true;
    gameState.isInClass = false;
    closeAttendanceOverlay(true);

    if (gameState.shouldSecondRollCall) {
        showNotification("你趁老师转身先溜了，但名单还没收起来。二次点名随时可能补刀。", "warning");
    } else if (attendanceDuration < ROLL_CALL_GRACE_SECONDS) {
        gameState.score += ESCAPE_SUCCESS_SCORE;
        gameState.narrowEscapeCount += 1;
        gameState.escapedAfterRollCall = false;
        showNotification(`你在第一次点名后成功开溜，擦线逃课成立，得分 +${ESCAPE_SUCCESS_SCORE}。`, "success");
    } else {
        gameState.escapedAfterRollCall = false;
        showNotification("你虽然点名后跑了，但已经坐够了，这波不加分，也不扣分。", "info");
    }

    updateUI();
}

function settleClassAtDayEnd() {
    if (!gameState.todayClass || gameState.honestClassSettled) {
        return;
    }

    if (gameState.committedToClass && gameState.isInClass) {
        gameState.honestClassSettled = true;
        gameState.isInClass = false;
        showNotification("你把这节课老老实实坐完了。不加分，也不扣分，主打一个平安落地。", "info");
        updateUI();
        return;
    }

    if (gameState.escapedAfterRollCall) {
        const attendanceDuration = gameState.classArrivalTime === null
            ? ROLL_CALL_GRACE_SECONDS
            : gameState.dayTime - gameState.classArrivalTime;
        gameState.honestClassSettled = true;
        gameState.escapedAfterRollCall = false;
        if (attendanceDuration < ROLL_CALL_GRACE_SECONDS) {
            gameState.score += ESCAPE_SUCCESS_SCORE;
            gameState.narrowEscapeCount += 1;
            showNotification(`今天没有等来二次点名，你点名后成功开溜，得分 +${ESCAPE_SUCCESS_SCORE}。`, "success");
        } else {
            showNotification("你点名后才走，但已经坐够了，今天不加分，也不扣分。", "info");
        }
        updateUI();
    }
}

function failCurrentClass(message) {
    gameState.failCount += 1;
    gameState.score -= 1;
    gameState.isInClass = false;
    gameState.committedToClass = false;
    gameState.escapedAfterRollCall = false;
    closeAttendanceOverlay(false);
    closeBuildingOverlay(false);
    showNotification(`${message} 得分 -1。`, "danger");
    checkGameStatus();
    updateUI();
}

function getEndingMessage(score) {
    if (gameState.failCount >= 3 && gameState.secondRollCallHitCount >= 2) {
        return "二次点名反杀结局。你不是死在第一轮名单上，而是死在老师那句“后排同学等等”上。";
    }

    if (score >= 8 && gameState.failCount === 0 && gameState.secondRollCallHitCount === 0) {
        return "神隐结局。你把图书馆和食堂两条线跑成了传说，老师只听说过你，没真正抓到过你。";
    }

    if (gameState.narrowEscapeCount >= 5) {
        return "擦线艺术家结局。你每次都像踩着名单边缘过桥，心脏和路线一样硬。";
    }

    if (gameState.warningSaveCount >= 4) {
        return "宿舍联动作战结局。你和室友像打双排一样配合，群消息就是第二生命。";
    }

    if (gameState.wrongFloorCount >= 8) {
        return "楼梯战神结局。名单没把你练废，教学楼的楼梯先把你练成了有氧圣体。";
    }

    if (gameState.perfectFloorGuessCount >= 5) {
        return "认路怪物结局。你进楼几乎不带犹豫，像提前偷看了教务系统。";
    }

    if (score >= 6) {
        return "你已经不是普通学生了，你是校园影分身。图书馆、食堂、教学楼两条线被你玩成了战术地图。";
    }

    if (score >= 2) {
        return "你属于侥幸流大师，运气和路线都还算在线，就是心脏可能不太行。";
    }

    if (score >= 0) {
        return "你勉强活过来了，但名单对你仍然抱有深刻印象。";
    }

    return "你已经成为签到系统受害者，老师和班长都对你有一种熟悉的陌生感。";
}

function endGame(completedTenDays) {
    clearInterval(gameInterval);
    gameInterval = null;
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.isMoving = false;
    gameState.moveSegments = [];
    elements.player.classList.remove("moving");

    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = true;
    elements.goClassBtn.disabled = true;

    closeBuildingOverlay(false);
    closeNoticeOverlay(false);
    closeAttendanceOverlay(false);
    stopBgm();
    elements.finalScore.textContent = gameState.score;
    elements.finalTime.textContent = `第 ${gameState.dayCount} 天`;

    if (completedTenDays) {
        elements.gameOverTitle.textContent = "10 天挑战完成";
        elements.gameOverMessage.textContent = getEndingMessage(gameState.score);
    } else {
        elements.gameOverTitle.textContent = "名单上的常驻嘉宾";
        elements.gameOverMessage.textContent = "逃课失败累计 3 次。老师未必记得你讲过什么，但一定记得你没到。";
    }

    elements.gameOverScreen.classList.add("show");
    elements.gameOverScreen.setAttribute("aria-hidden", "false");
}

function showNotification(message, type = "info") {
    clearTimeout(notificationTimeout);
    elements.notification.textContent = message;
    elements.notification.className = `notification show ${type}`;
    playFeedbackSound(type);
    flashMapFeedback(type);
    notificationTimeout = setTimeout(() => {
        elements.notification.classList.remove("show");
    }, 3600);
}

function isTeachingBuilding(locationId) {
    return locationId === "building3" || locationId === "building7";
}

function formatFloor(floor) {
    return floor ? `${floor}F` : "未知楼层";
}

function createFloorRumor() {
    const accuracyChance = clamp(
        0.45 +
            gameState.roommateProfile.warningChance * 0.25 +
            (gameState.teacherMood.id === "strict" ? 0.05 : 0) +
            gameState.eventEffects.roommateWarningDelta * 0.5,
        0.35,
        0.9
    );
    const accurate = Math.random() < accuracyChance;
    const hintedFloor = accurate
        ? gameState.todayClassFloor
        : sample(FLOOR_OPTIONS.filter((floor) => floor !== gameState.todayClassFloor));

    const rumorSources = {
        sleeping: `宿舍上铺半梦半醒地说“我记得像是 ${formatFloor(hintedFloor)}”，语气不是很能让人放心。`,
        online: `班群里连发了三条“好像在 ${formatFloor(hintedFloor)}”，看起来像边刷短视频边打字。`,
        reliable: `室友言之凿凿地说“今天八成在 ${formatFloor(hintedFloor)}”，可信度相对像个人话。`
    };

    return {
        accurate,
        hintedFloor,
        text: rumorSources[gameState.roommateProfile.id] ?? `有人说在 ${formatFloor(hintedFloor)}。`
    };
}

function getTodayRumorText() {
    if (!gameState.todayFloorRumor) {
        return "班群还没统一口径。";
    }

    return `班群风声：${gameState.todayFloorRumor.text}`;
}

function getBuildingFlavor(buildingId, floor) {
    if (!isTeachingBuilding(buildingId)) {
        return "这里不像是你该久留的地方。";
    }

    const vibe = floorVibes[buildingId]?.[floor];
    if (gameState.floorSearchAttempts >= 2 && buildingId === gameState.todayClass.location) {
        return `${vibe} 你已经把这栋楼跑成了迷宫，热心路人终于肯救你一命。`;
    }

    return vibe ?? "楼道安静得像在等你犯错。";
}

elements.startBtn.addEventListener("click", startGame);
elements.pauseBtn.addEventListener("click", pauseGame);
elements.resetBtn.addEventListener("click", resetGame);
elements.noticeBtn.addEventListener("click", () => {
    gameState.hasSeenNotice = true;
    openNoticeOverlay();
});
elements.soundBtn.addEventListener("click", toggleSoundPanel);
elements.bgmToggleBtn.addEventListener("click", toggleBgm);
elements.sfxToggleBtn.addEventListener("click", toggleSfx);
elements.goClassBtn.addEventListener("click", goToClass);
elements.dormitoryBtn.addEventListener("click", () => moveToLocation("dormitory"));
elements.canteenBtn.addEventListener("click", () => moveToLocation("canteen"));
elements.libraryGateBtn.addEventListener("click", () => moveToLocation("libraryGate"));
elements.building7Btn.addEventListener("click", () => moveToLocation("building7"));
elements.building3Btn.addEventListener("click", () => moveToLocation("building3"));
elements.floorButtons.forEach((button) => {
    button.addEventListener("click", () => chooseFloor(Number(button.dataset.floor)));
});
elements.leaveBuildingBtn.addEventListener("click", () => {
    closeBuildingOverlay();
    showNotification("你先缩回楼道观察局势，准备再赌一次。", "info");
});
elements.noticeCloseBtn.addEventListener("click", () => {
    closeNoticeOverlay(true);
});
elements.attendanceRunBtn.addEventListener("click", chooseRunAfterRollCall);
elements.attendanceStayBtn.addEventListener("click", chooseStayAfterRollCall);
elements.restartBtn.addEventListener("click", initGame);

document.addEventListener("DOMContentLoaded", initGame);
