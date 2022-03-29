"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetUpTime = exports.handleFeedback = exports.handleGetHint = exports.handleCheckAnswer = exports.handleNewGame = void 0;
const process = require("process");
const express = require("express");
const server_start_time = Date.now();
const PORT = parseInt(process.env["PORT"]);
if (isNaN(PORT)) {
    console.error("Must specify the environment variable PORT");
    process.exit(1);
}
const predefined_new_games = [
    { puzzle_seed: "ear", max_word_length: 15, game_id: "1", solutions_count: 5473, grade_level: 1 },
    { puzzle_seed: "xct", max_word_length: 15, game_id: "2", solutions_count: 173, grade_level: 5 },
    { puzzle_seed: "bqh", max_word_length: 15, game_id: "3", solutions_count: 762, grade_level: 7 },
];
let next_new_game_index = 0;
function handleNewGame(req, res) {
    const i = next_new_game_index;
    next_new_game_index = (next_new_game_index + 1) % predefined_new_games.length;
    res.json(predefined_new_games[i]);
}
exports.handleNewGame = handleNewGame;
const predefined_answer_checks = [
    { answer_text: "", boggle_score: 5, scrabble_score: 11, word_set_size: 500000, grade_level: 3, notes: [] },
    { answer_text: "", boggle_score: 4, scrabble_score: 13, word_set_size: 2300000, grade_level: 10, notes: [] },
    { answer_text: "", boggle_score: 6, scrabble_score: 25, word_set_size: 610000, grade_level: 4, notes: [] },
];
function handleCheckAnswer(req, res) {
    const i = Math.floor(Math.random() * predefined_answer_checks.length);
    const predefined_answer_check = predefined_answer_checks[i];
    const response = Object.assign(Object.assign({}, predefined_answer_check), { answer_text: req.query.answer_text });
    res.send(response);
}
exports.handleCheckAnswer = handleCheckAnswer;
const predefined_hints = {
    "ear": { solution_pattern_text: "ear???", word_set_size: 33000 },
    "xct": { solution_pattern_text: "?x?ct???", word_set_size: 560000 },
    "bqh": { solution_pattern_text: "b?q????h", word_set_size: 1900000 },
};
function handleGetHint(req, res) {
    const puzzle_seed = req.query.puzzle_seed.toLocaleLowerCase();
    const predefined_hint = predefined_hints[puzzle_seed];
    res.send(predefined_hint);
}
exports.handleGetHint = handleGetHint;
function handleFeedback(req, res) {
    res.sendStatus(200);
}
exports.handleFeedback = handleFeedback;
function handleGetUpTime(req, res) {
    const uptime_seconds = Math.trunc((Date.now() - server_start_time) / 1000);
    res.json({ uptime_seconds });
}
exports.handleGetUpTime = handleGetUpTime;
function createExpressApp() {
    const app = express();
    app.get("/license_plate_game/new_game", handleNewGame);
    app.get("/license_plate_game/check_answer", handleCheckAnswer);
    app.get("/license_plate_game/hint", handleGetHint);
    app.get("/license_plate_game/uptime", handleGetUpTime);
    app.use(express.json());
    app.post("/license_plate_game/feedback", handleFeedback);
    app.get('/', function (req, res) {
        res.redirect('/aurelia');
    });
    app.get('/aurelia', function (req, res) {
        res.sendFile('index.html', { root: "dist" });
    });
    app.use(express.static("dist"));
    app.listen(PORT, function () {
        console.log(`dummy-server listening at http://localhost:${PORT}`);
    });
    return app;
}
createExpressApp();
//# sourceMappingURL=dummy-server.js.map