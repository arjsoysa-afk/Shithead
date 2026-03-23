"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIAL_RANKS = exports.RANK_ORDER = void 0;
exports.isRedSuit = isRedSuit;
exports.isBlackSuit = isBlackSuit;
exports.RANK_ORDER = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};
exports.SPECIAL_RANKS = new Set(['2', '3', '10']);
function isRedSuit(suit) {
    return suit === 'hearts' || suit === 'diamonds';
}
function isBlackSuit(suit) {
    return suit === 'clubs' || suit === 'spades';
}
