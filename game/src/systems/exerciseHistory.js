import { shuffle } from "../data/utilities.js";
import { getRankWeight } from "./rankingSystem.js";

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
 * Picks `count` exercises from `dialogs` using weighted random sampling
 * without replacement. Each exercise's weight comes from the user's
 * confidence ranking (see rankingSystem): weaker exercises are more likely
 * to be picked, while mastered ("Solid") ones keep a small chance so they
 * still come up occasionally for review.
 *
 * @template {{id: number|string}} T
 * @param {T[]} dialogs
 * @param {number} count
 * @returns {T[]}
 */
export const pickExercises = (dialogs, count) => {
    const pool = shuffle([...dialogs]);
    const picked = [];

    while (picked.length < count && pool.length > 0) {
        const weights = pool.map(d => getRankWeight(d.id));
        const total = weights.reduce((sum, w) => sum + w, 0);
        let r = Math.random() * total;

        let idx = 0;
        while (idx < pool.length - 1 && r >= weights[idx]) {
            r -= weights[idx];
            idx++;
        }

        picked.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return picked;
};
