import * as process from "process"
import * as express from "express"
import {LicensePlateGameAPI} from "license-plate-game-api"


const server_start_time = Date.now()


const PORT = parseInt(process.env["PORT"])
if (isNaN(PORT)) {
    console.error("Must specify the environment variable PORT")
    process.exit(1)
}


const predefined_new_games: LicensePlateGameAPI.NewGameResponse[] = [
    {puzzle_seed: "ear", max_word_length: 15, game_id: "1", solutions_count: 5473, grade_level: 1},
    {puzzle_seed: "xct", max_word_length: 15, game_id: "2", solutions_count: 173, grade_level: 5},
    {puzzle_seed: "bqh", max_word_length: 15, game_id: "3", solutions_count: 762, grade_level: 7},
]

let next_new_game_index = 0
export function handleNewGame(req: express.Request, res: express.Response): void {
    const i = next_new_game_index
    next_new_game_index = (next_new_game_index + 1) % predefined_new_games.length
    res.json(predefined_new_games[i])
}


const predefined_answer_checks: LicensePlateGameAPI.CheckAnswerResponse[] = [
    {answer_text: "", boggle_score: 5, scrabble_score: 11, word_set_size: 500000, grade_level: 3, notes: []},
    {answer_text: "", boggle_score: 4, scrabble_score: 13, word_set_size: 2300000, grade_level: 10, notes: []},
    {answer_text: "", boggle_score: 6, scrabble_score: 25, word_set_size: 610000, grade_level: 4, notes: []},
]


export function handleCheckAnswer(req: express.Request, res: express.Response): void {
    const i = Math.floor(Math.random() * predefined_answer_checks.length)
    const predefined_answer_check = predefined_answer_checks[i]
    const response = {...predefined_answer_check, answer_text: req.query.answer_text}
    res.send(response)
}

const predefined_hints: {[puzzle_seed: string]: LicensePlateGameAPI.HintResponse} = {
    "ear": {solution_pattern_text: "ear???", word_set_size: 33000},
    "xct": {solution_pattern_text: "?x?ct???", word_set_size: 560000},
    "bqh": {solution_pattern_text: "b?q????h", word_set_size: 1900000},
}

export function handleGetHint(req: express.Request, res: express.Response): void {
    const puzzle_seed = (<string> req.query.puzzle_seed).toLocaleLowerCase()
    const predefined_hint = predefined_hints[puzzle_seed]
    res.send(predefined_hint)
}


export function handleFeedback(req: express.Request, res: express.Response): void {
    res.sendStatus(200)
}


export function handleGetUpTime(req: express.Request, res: express.Response): void {
    const uptime_seconds = Math.trunc((Date.now() - server_start_time) / 1000)
    res.json({uptime_seconds});
}




function createExpressApp() {
    const app = express();
    app.get("/license_plate_game/new_game", handleNewGame);
    app.get("/license_plate_game/check_answer", handleCheckAnswer);
    app.get("/license_plate_game/hint", handleGetHint);
    app.get("/license_plate_game/uptime", handleGetUpTime);
    app.use(express.json());
    app.post("/license_plate_game/feedback", handleFeedback);
    app.get('/', function(req, res){
        res.redirect('/aurelia');
    });
    app.get('/aurelia', function(req, res){
        res.sendFile('index.html', {root: "dist"});
    });
    app.use(express.static("dist"))
    app.listen(PORT, function() {
        console.log(`dummy-server listening at http://localhost:${PORT}`)
    })
    return app
}


createExpressApp()

