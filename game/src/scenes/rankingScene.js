import { k } from "../kaplay.js";
import { resizablePos } from "../components/resizablePos.js";
import { settings } from "./selectionScene.js";
import dialogs from "../data/CodeBlocks.json";
import {
    RANK_LABELS,
    RANK_NEW,
    RANK_SHAKY,
    RANK_SOLID,
    getRanking,
    setRanking,
} from "../systems/rankingSystem.js";

const LEVEL_COLORS = {
    [RANK_NEW]: [128, 128, 128],
    [RANK_SHAKY]: [255, 214, 10],
    [RANK_SOLID]: [3, 255, 87],
};

const MAX_VISIBLE = 14;
const ROW_HEIGHT = 34;
const FONT_SIZE = 20;

k.scene("ranking", () => {
    const exercises = dialogs.filter(
        item => (item.language || "default") === settings.language
    );

    let cursor = 0;
    let windowStart = 0;

    k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.12)),
        k.anchor("center"),
        k.scale(0.7),
        k.z(18),
    ]);
    k.add([
        k.text("Rate how well you know each exercise", { size: 22 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.22)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(21),
    ]);

    const listStartX = k.width() * 0.22;
    const levelX = k.width() * 0.62;
    const listStartY = k.height() * 0.3;

    const cursorArrow = k.add([
        k.text(">", { size: FONT_SIZE }),
        k.pos(listStartX - 30, listStartY),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.z(22),
    ]);

    const rows = [];
    for (let i = 0; i < MAX_VISIBLE; i++) {
        const y = listStartY + i * ROW_HEIGHT;
        const title = k.add([
            k.text("", { size: FONT_SIZE }),
            k.pos(listStartX, y),
            k.anchor("left"),
            k.color(k.WHITE),
            k.z(21),
        ]);
        const level = k.add([
            k.text("", { size: FONT_SIZE }),
            k.pos(levelX, y),
            k.anchor("left"),
            k.color(k.WHITE),
            k.z(21),
        ]);
        rows.push({ title, level });
    }

    function render() {
        for (let i = 0; i < MAX_VISIBLE; i++) {
            const exIndex = windowStart + i;
            const { title, level } = rows[i];
            const exercise = exercises[exIndex];

            if (!exercise) {
                title.text = "";
                level.text = "";
                continue;
            }

            const isSelected = exIndex === cursor;
            const rank = getRanking(exercise.id);
            const [lr, lg, lb] = LEVEL_COLORS[rank];

            title.text = exercise.title;
            title.color = isSelected ? k.rgb(255, 255, 255) : k.rgb(150, 150, 150);
            level.text = RANK_LABELS[rank];
            level.color = k.rgb(lr, lg, lb);
        }

        cursorArrow.pos = k.vec2(
            listStartX - 30,
            listStartY + (cursor - windowStart) * ROW_HEIGHT
        );
    }

    function clampWindow() {
        if (cursor < windowStart) {
            windowStart = cursor;
        } else if (cursor >= windowStart + MAX_VISIBLE) {
            windowStart = cursor - MAX_VISIBLE + 1;
        }
    }

    function moveCursor(delta) {
        if (exercises.length === 0) return;
        cursor = Math.max(0, Math.min(exercises.length - 1, cursor + delta));
        clampWindow();
        render();
    }

    function changeLevel(delta) {
        const exercise = exercises[cursor];
        if (!exercise) return;
        const current = getRanking(exercise.id);
        const next = Math.max(RANK_NEW, Math.min(RANK_SOLID, current + delta));
        if (next !== current) {
            setRanking(exercise.id, next);
            render();
        }
    }

    k.onKeyPressRepeat(["up", "w"], () => moveCursor(-1));
    k.onKeyPressRepeat(["down", "s"], () => moveCursor(1));
    k.onKeyPress(["left", "a"], () => changeLevel(-1));
    k.onKeyPress(["right", "d"], () => changeLevel(1));
    k.onKeyPress("escape", () => k.go("selection"));

    k.add([
        k.text("UP / DOWN move    LEFT / RIGHT set level    ESC back", { size: 18 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.92)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.z(19),
    ]);

    render();
});
