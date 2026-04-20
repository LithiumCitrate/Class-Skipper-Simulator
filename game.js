const TOTAL_DAYS = 10;
const DAY_LENGTH_SECONDS = 30 * 60;
const PREP_TIME_SECONDS = 400;
const ROLL_CALL_GRACE_SECONDS = 10 * 60;
const ROOMMATE_TRIGGER_AFTER_CLASS = 5 * 60;
const SECOND_ROLL_CALL_OFFSET = 3 * 60;
const TICK_MS = 100;
const GAME_SECONDS_PER_TICK = 2;

const courses = [
    {
        id: "math",
        name: "高等数学",
        location: "building7",
        teacher: "张老师",
        riskLabel: "随缘点名",
        rollCallChance: 0.35,
        secondRollCallChance: 0.08,
        intro: "张老师嘴上说只讲一遍，名单倒是会讲很多遍。",
        quote: "这题没听懂没关系，点名的时候记得答到。"
    },
    {
        id: "linear",
        name: "线性代数",
        location: "building3",
        teacher: "李老师",
        riskLabel: "看心情",
        rollCallChance: 0.28,
        secondRollCallChance: 0.12,
        intro: "李老师属于那种表情很平静，但会突然翻名单的人。",
        quote: "矩阵可以不会，点名不能不在。"
    },
    {
        id: "programming",
        name: "程序设计",
        location: "building7",
        teacher: "王老师",
        riskLabel: "抽查型",
        rollCallChance: 0.24,
        secondRollCallChance: 0.15,
        intro: "程序设计不一定点名，但很可能现场抓人解释 bug。",
        quote: "代码没跑起来没关系，人先到。"
    },
    {
        id: "ideology",
        name: "思想政治",
        location: "building3",
        teacher: "陈老师",
        riskLabel: "高压巡逻",
        rollCallChance: 0.7,
        secondRollCallChance: 0.45,
        intro: "陈老师是那种会在你松口气之后再来一轮的人。",
        quote: "我就随便看看名单，不用紧张。"
    },
    {
        id: "history",
        name: "近代史纲要",
        location: "building7",
        teacher: "刘老师",
        riskLabel: "名单在手",
        rollCallChance: 0.76,
        secondRollCallChance: 0.55,
        intro: "刘老师和名单是绑定刷新，今天大概率不讲武德。",
        quote: "后排同学别躲，我看见你们了。"
    }
];

const locations = {
    dormitory: { x: 70.4, y: 75.6, name: "寝室" },
    lakeside: { x: 72.8, y: 47.4, name: "湖边路口" },
    eastPath: { x: 78.4, y: 70.8, name: "东侧路口" },
    libraryGate: { x: 49.5, y: 47.4, name: "图书馆" },
    route7: { x: 64.2, y: 47.4, name: "7号楼路口" },
    northPath: { x: 78.4, y: 20.2, name: "教学楼路口" },
    building7: { x: 64.2, y: 41.1, name: "7号教学楼" },
    building3: { x: 88.3, y: 27.7, name: "3号教学楼" }
};

const roadGraph = {
    dormitory: { lakeside: 120, eastPath: 120 },
    lakeside: { dormitory: 120, libraryGate: 120 },
    libraryGate: { lakeside: 120, route7: 180 },
    route7: { libraryGate: 180, building7: 180 },
    eastPath: { dormitory: 120, northPath: 120 },
    northPath: { eastPath: 120, building3: 60 },
    building7: { route7: 180 },
    building3: { northPath: 60 }
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
        headline: "室友昨晚通宵，今天消息像投进黑洞。",
        quote: "你指望他报信，不如指望老师忘带名单。"
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
        name: "消息秒回",
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
    "隔壁班说这节老师心情一般，‘一般’通常意味着更危险。"
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
        summary: "班长突然在群里问“都到齐了吗”，会把第一次点名提前一点。",
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
        summary: "室友今天在教室前排，还会额外提高一次提醒成功率。",
        apply(state) {
            state.eventEffects.roommateWarningDelta = 0.2;
        },
        triggerMessage: "室友今天人在前排，已经开启课堂实况转播模式。",
        badge: "前排眼线"
    }
];

const gameState = {
    isRunning: false,
    isPaused: false,
    isMoving: false,
    dayCount: 0,
    dayTime: 0,
    score: 0,
    failCount: 0,
    currentLocation: "dormitory",
    playerPosition: { ...locations.dormitory },
    todayClass: null,
    teacherMood: null,
    roommateProfile: null,
    campusBuzz: "",
    currentMoveTarget: null,
    moveSegments: [],
    moveSegmentIndex: 0,
    moveSegmentElapsed: 0,
    moveElapsedTotal: 0,
    moveTotalTime: 0,
    moveEnterClassOnArrival: false,
    classArrivalTime: null,
    isInClass: false,
    shouldFirstRollCall: false,
    firstRollCallResolved: false,
    secondRollCallResolved: false,
    shouldSecondRollCall: false,
    roommateWarned: false,
    roommateRolled: false,
    specialEvent: null,
    eventEffects: null
};

const elements = {
    dayCount: document.getElementById("dayCount"),
    currentLocation: document.getElementById("currentLocation"),
    score: document.getElementById("score"),
    failCount: document.getElementById("failCount"),
    startBtn: document.getElementById("startBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    resetBtn: document.getElementById("resetBtn"),
    goClassBtn: document.getElementById("goClassBtn"),
    dormitoryBtn: document.getElementById("dormitoryBtn"),
    lakesideBtn: document.getElementById("lakesideBtn"),
    eastPathBtn: document.getElementById("eastPathBtn"),
    libraryGateBtn: document.getElementById("libraryGateBtn"),
    route7Btn: document.getElementById("route7Btn"),
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
    gameOverScreen: document.getElementById("gameOverScreen"),
    gameOverTitle: document.getElementById("gameOverTitle"),
    gameOverMessage: document.getElementById("gameOverMessage"),
    finalScore: document.getElementById("finalScore"),
    finalTime: document.getElementById("finalTime"),
    restartBtn: document.getElementById("restartBtn")
};

let gameInterval = null;
let notificationTimeout = null;

function initGame() {
    clearInterval(gameInterval);
    gameInterval = null;

    Object.assign(gameState, {
        isRunning: false,
        isPaused: false,
        isMoving: false,
        dayCount: 0,
        dayTime: 0,
        score: 0,
        failCount: 0,
        currentLocation: "dormitory",
        playerPosition: { ...locations.dormitory },
        todayClass: null,
        teacherMood: null,
        roommateProfile: null,
        campusBuzz: "",
        currentMoveTarget: null,
        moveSegments: [],
        moveSegmentIndex: 0,
        moveSegmentElapsed: 0,
        moveElapsedTotal: 0,
        moveTotalTime: 0,
        moveEnterClassOnArrival: false,
        classArrivalTime: null,
        isInClass: false,
        shouldFirstRollCall: false,
        firstRollCallResolved: false,
        secondRollCallResolved: false,
        shouldSecondRollCall: false,
        roommateWarned: false,
        roommateRolled: false,
        specialEvent: null,
        eventEffects: createDefaultEventEffects()
    });

    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = "暂停";
    elements.goClassBtn.disabled = true;
    elements.gameOverScreen.classList.remove("show");
    elements.gameOverScreen.setAttribute("aria-hidden", "true");
    elements.player.classList.remove("moving");
    elements.player.style.setProperty("--player-facing", "1");

    updateUI();
}

function startGame() {
    if (gameState.isRunning && !gameState.isPaused) {
        return;
    }

    if (!gameState.isRunning) {
        startNewDay();
    }

    gameState.isRunning = true;
    gameState.isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.pauseBtn.textContent = "暂停";

    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        gameState.dayTime += GAME_SECONDS_PER_TICK;
        advanceMovement(GAME_SECONDS_PER_TICK);

        if (gameState.dayTime >= DAY_LENGTH_SECONDS) {
            nextDay();
            return;
        }

        checkCourseLogic();
        checkGameStatus();
        updateUI();
    }, TICK_MS);
}

function pauseGame() {
    if (!gameState.isRunning) {
        return;
    }

    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
        clearInterval(gameInterval);
        gameInterval = null;
        elements.pauseBtn.textContent = "继续";
        showNotification("时间暂停了，人物和路线会一起冻结。", "info");
    } else {
        startGame();
    }
}

function resetGame() {
    initGame();
    showNotification("已经回到第一天。名单清空，心态重来。", "info");
}

function startNewDay() {
    gameState.dayCount += 1;
    gameState.dayTime = 0;
    gameState.todayClass = sample(courses);
    gameState.teacherMood = sample(teacherMoods);
    gameState.roommateProfile = sample(roommateProfiles);
    gameState.campusBuzz = sample(campusBuzzPool);
    gameState.currentLocation = "dormitory";
    gameState.playerPosition = { ...locations.dormitory };
    gameState.isMoving = false;
    gameState.currentMoveTarget = null;
    gameState.moveSegments = [];
    gameState.moveSegmentIndex = 0;
    gameState.moveSegmentElapsed = 0;
    gameState.moveElapsedTotal = 0;
    gameState.moveTotalTime = 0;
    gameState.moveEnterClassOnArrival = false;
    gameState.classArrivalTime = null;
    gameState.isInClass = false;
    gameState.shouldFirstRollCall = false;
    gameState.firstRollCallResolved = false;
    gameState.secondRollCallResolved = false;
    gameState.roommateWarned = false;
    gameState.roommateRolled = false;
    gameState.specialEvent = sample(specialEvents);
    gameState.eventEffects = createDefaultEventEffects();
    gameState.specialEvent.apply(gameState);
    gameState.shouldFirstRollCall = Math.random() < getEffectiveRollCallChance();
    gameState.shouldSecondRollCall = rollSecondCall();
    elements.player.classList.remove("moving");

    elements.headlineCopy.textContent = sample(dayHeadlines);

    showNotification(
        `第 ${gameState.dayCount} 天开始。今天是 ${gameState.todayClass.name}，${gameState.teacherMood.name}模式，先看风声再行动。`,
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
    elements.currentLocation.textContent = locations[gameState.currentLocation]?.name ?? "路上";
    elements.score.textContent = gameState.score;
    elements.failCount.textContent = gameState.failCount;

    if (gameState.todayClass) {
        const locationName = locations[gameState.todayClass.location].name;
        elements.courseNameLarge.textContent = gameState.todayClass.name;
        elements.courseMeta.textContent = `${gameState.todayClass.teacher} · 上课地点 ${locationName} · ${gameState.todayClass.intro}`;
        elements.courseCountdown.textContent = getCourseStatusText();
        elements.teacherMood.textContent = `${gameState.teacherMood.name}，${gameState.teacherMood.headline}`;
        elements.roommateMood.textContent = `${gameState.roommateProfile.name}，${gameState.roommateProfile.headline}`;
        elements.campusBuzz.textContent = gameState.campusBuzz;
        elements.gossipQuote.textContent = `“${getQuoteForToday()}”`;
        renderCourseBadges();
        elements.goClassBtn.disabled = !gameState.isRunning || gameState.isPaused || gameState.isMoving;
    } else {
        elements.courseNameLarge.textContent = "等待开始";
        elements.courseMeta.textContent = "每天开始上课前有 30 秒准备时间。";
        elements.courseCountdown.textContent = "点击开始游戏";
        elements.teacherMood.textContent = "未刷新";
        elements.roommateMood.textContent = "未刷新";
        elements.campusBuzz.textContent = "今天还没人放风。";
        elements.gossipQuote.textContent = "“这节不点名”通常和“老师马上下课”一样不可信。";
        elements.courseBadgeRow.innerHTML = "";
        elements.goClassBtn.disabled = true;
    }

    updatePlayerPosition();
    updateMarkers();
}

function renderCourseBadges() {
    const badges = [
        gameState.todayClass.riskLabel,
        gameState.teacherMood.name,
        gameState.roommateProfile.name,
        gameState.shouldSecondRollCall ? "疑似二次点名" : "今日一轮点名",
        gameState.specialEvent?.badge ?? "今日无事"
    ];

    elements.courseBadgeRow.innerHTML = badges
        .map((label) => `<span class="badge">${label}</span>`)
        .join("");
}

function getCourseStatusText() {
    if (!gameState.todayClass) {
        return "今天还没有课程。";
    }

    if (gameState.isMoving && gameState.currentMoveTarget) {
        const remaining = Math.max(0, gameState.moveTotalTime - gameState.moveElapsedTotal);
        return `沿道路前往 ${locations[gameState.currentMoveTarget].name}，还需 ${Math.ceil(remaining)} 秒。`;
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
        return `距离第一次点名还有 ${Math.max(0, firstRollCallTime - gameState.dayTime)} 秒。`;
    }

    if (gameState.shouldSecondRollCall && !gameState.secondRollCallResolved) {
        return `第一次点名已过，老师还可能在 ${Math.max(0, secondRollCallTime - gameState.dayTime)} 秒后回头补刀。`;
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
        button.classList.remove("active");
    });

    const activeMap = {
        dormitory: elements.dormitoryBtn,
        lakeside: elements.lakesideBtn,
        eastPath: elements.eastPathBtn,
        libraryGate: elements.libraryGateBtn,
        route7: elements.route7Btn,
        building7: elements.building7Btn,
        building3: elements.building3Btn
    };

    const activeButton = activeMap[gameState.currentLocation];
    if (activeButton) {
        activeButton.classList.add("active");
    }
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
        const time = Math.round(roadGraph[from][to] * gameState.eventEffects.moveTimeMultiplier);
        segments.push({
            from,
            to,
            fromPoint: locations[from],
            toPoint: locations[to],
            time
        });
        totalTime += time;
    }

    return { segments, totalTime };
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
            enterClassroom();
        } else {
            showNotification(`你已经在${locations[targetLocation].name}。继续蹲点也行。`, "info");
        }
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
        `沿道路前往${locations[targetLocation].name}，预计 ${totalTime} 秒游戏时间。蹲点路线开始执行。`,
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
        enterClassroom();
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

    moveToLocation(gameState.todayClass.location, { enterClass: true });
}

function enterClassroom() {
    if (!gameState.todayClass) {
        return;
    }

    gameState.isInClass = true;
    gameState.classArrivalTime = gameState.dayTime;
    showNotification(`你已经进入 ${gameState.todayClass.name} 教室。先低头装作刚到。`, "success");
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
    const stageLabel = stage === "first" ? "第一次点名" : "第二次点名";
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
            } else {
                gameState.score -= 1;
            }

            if (stage === "first") {
                showNotification(
                    `${stageLabel}擦线过关。你在教室里只混了不到 10 分钟，得分 +1。`,
                    "success"
                );
            } else {
                showNotification(
                    `${stageLabel}来了个回马枪。你本来都想溜了，结果还是被拖住，得分 -1。`,
                    "warning"
                );
            }
        } else {
            gameState.score -= 1;
            showNotification(`${stageLabel}撞上了，你这次属于真的坐满了，得分 -1。`, "warning");
        }
    } else {
        gameState.failCount += 1;
        gameState.score -= 1;
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

function getEndingMessage(score) {
    if (score >= 6) {
        return "你已经不是普通学生了，你是校园影分身。图书馆、路口、教学楼三点一线被你玩成了战术地图。";
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
    notificationTimeout = setTimeout(() => {
        elements.notification.classList.remove("show");
    }, 3600);
}

elements.startBtn.addEventListener("click", startGame);
elements.pauseBtn.addEventListener("click", pauseGame);
elements.resetBtn.addEventListener("click", resetGame);
elements.goClassBtn.addEventListener("click", goToClass);

elements.dormitoryBtn.addEventListener("click", () => moveToLocation("dormitory"));
elements.lakesideBtn.addEventListener("click", () => moveToLocation("lakeside"));
elements.eastPathBtn.addEventListener("click", () => moveToLocation("eastPath"));
elements.libraryGateBtn.addEventListener("click", () => moveToLocation("libraryGate"));
elements.route7Btn.addEventListener("click", () => moveToLocation("route7"));
elements.building7Btn.addEventListener("click", () => moveToLocation("building7"));
elements.building3Btn.addEventListener("click", () => moveToLocation("building3"));

elements.restartBtn.addEventListener("click", initGame);

document.addEventListener("DOMContentLoaded", initGame);
