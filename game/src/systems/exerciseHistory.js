import { shuffle } from "../data/utilities.js";

const STORAGE_KEY = "exerciseHistory";

/**
 * Map of exercise id to timestamp (ms) of the last time it was completed.
 * @typedef {Object<string, number>} History
 */

/**
 * @returns {History}
 */
export const getHistory = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

/**
 * @param {History} history
 */
const saveHistory = (history) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

/**
 * Records the given exercise ids as completed at the current time.
 * @param {Array<number|string>} ids
 */
export const markShown = (ids) => {
    if (!ids || ids.length === 0) return;
    const history = getHistory();
    const now = Date.now();
    for (const id of ids) {
        history[String(id)] = now;
    }
    saveHistory(history);
};

/**
 * Picks `count` exercises from `dialogs`, preferring those completed longer
 * ago (never-completed first). Ties are broken randomly, and the final picked
 * set is shuffled to randomize session order.
 *
 * Replace the priority function here to evolve into spaced repetition.
 *
 * @template {{id: number|string}} T
 * @param {T[]} dialogs
 * @param {number} count
 * @returns {T[]}
 */
export const pickExercises = (dialogs, count) => {
    const history = getHistory();
    const pool = shuffle([...dialogs]);
    pool.sort((a, b) => {
        const aShown = history[String(a.id)] ?? 0;
        const bShown = history[String(b.id)] ?? 0;
        return aShown - bShown;
    });
    return shuffle(pool.slice(0, count));
};
