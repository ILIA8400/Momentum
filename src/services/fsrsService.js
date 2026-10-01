'use strict';
const { createEmptyCard, FSRS, Rating, State } = require('ts-fsrs');

const fsrs = new FSRS();

const schedulerAPI = {
  createEmptyCard() {
    return createEmptyCard();
  },

  preview(card, now = new Date()) {
    const r = fsrs.repeat(card, now);
    return {
      again: r[Rating.Again],
      hard: r[Rating.Hard],
      good: r[Rating.Good],
      easy: r[Rating.Easy],
    };
  },

  review(card, now = new Date(), rating) {
    return fsrs.next(card, now, rating);
  },

  Rating,
  State,
};

function formatDueDate(due) {
  return due.toISOString();
}

function parseCard(json) {
  return JSON.parse(json);
}

function stringifyCard(card) {
  return JSON.stringify(card);
}

function getDueDate(card) {
  return new Date(card.due);
}

module.exports = {
  scheduler: schedulerAPI,
  formatDueDate,
  parseCard,
  stringifyCard,
  getDueDate,
  Rating,
  State,
};