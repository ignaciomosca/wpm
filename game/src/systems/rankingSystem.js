const STORAGE_KEY = "exerciseRankings";

/**
 * Confidence levels the user assigns to each exercise. Lower means weaker,
 * which is what the weighted selection favours.
 */
export const RANK_NEW = 0;
export const RANK_SHAKY = 1;
export const RANK_SOLID = 2;

export const RANK_ORDER = [RANK_NEW, RANK_SHAKY, RANK_SOLID];

export const RANK_LABELS = {
    [RANK_NEW]: "New",
    [RANK_SHAKY]: "Shaky",
    [RANK_SOLID]: "Solid",
};

/**
 * How often an exercise at each level should show up when practising.
 * Weaker levels get a heavier weight so they appear more often, but Solid
 * still keeps a small weight so mastered exercises are never fully dropped.
 */
export const RANK_WEIGHTS = {
    [RANK_NEW]: 4,
    [RANK_SHAKY]: 3,
    [RANK_SOLID]: 1,
};

/**
 * Map of exercise id to confidence level.
 * @typedef {Object<string, number>} Rankings
 */

/**
 * @returns {Rankings}
 */
export const getRankings = () => {
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
 * @param {Rankings} rankings
 */
const saveRankings = (rankings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings));
};

/**
 * @param {number|string} id
 * @returns {number} the stored level, defaulting to RANK_NEW.
 */
export const getRanking = (id) => {
    const level = getRankings()[String(id)];
    return RANK_ORDER.includes(level) ? level : RANK_NEW;
};

/**
 * @param {number|string} id
 * @param {number} level
 */
export const setRanking = (id, level) => {
    const rankings = getRankings();
    rankings[String(id)] = level;
    saveRankings(rankings);
};

/**
 * Returns the weight to use when sampling this exercise for practice.
 * @param {number|string} id
 * @returns {number}
 */
export const getRankWeight = (id) => {
    const level = getRanking(id);
    return RANK_WEIGHTS[level] ?? RANK_WEIGHTS[RANK_NEW];
};
