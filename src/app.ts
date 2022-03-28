import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Settings, ExpiringMessage, PuzzleAnswer} from "./lib/index.d"
import {MAX_EXPIRATION_SECONDS} from "./lib/lib"
import {AuMsgAboutPanelState, AuMsgFeedbackPanelState, AuMsgRemoteCallState, AuMsgNewGameRequest, AuMsgCheckAnswer, AuMsgHintRequest} from './messages';
import {LicensePlatePuzzle} from "./lib/license-plate-puzzle"
import {LicensePlateGameClient} from "license-plate-game-api"
import type {LicensePlateGameAPI} from "license-plate-game-api"


function minutesToMilliseconds(minutes: number) {
    return minutes * 60 * 1000
}


const EXPIRATION_SECONDS = {
    REQUEST: 30,
    OK: 5,
    ERROR: MAX_EXPIRATION_SECONDS,   // errors must be cleared explicitly
}


@autoinject
export class App {
    settings: Settings
    in_process_count: number
    about_panel_is_open: boolean
    feedback_panel_is_open: boolean
    current_game: LicensePlatePuzzle | undefined
    elapsed_seconds: number
    remote_request_id: number
    puzzle_answers: PuzzleAnswer[]
    hint: LicensePlateGameAPI.HintResponse | undefined

    constructor(private ea: EventAggregator) {
        this.settings = {check_answer_on_enter_key: true}
        this.in_process_count = 0
        this.remote_request_id = 0
        this.elapsed_seconds = 0
        this.about_panel_is_open = false
        this.feedback_panel_is_open = false
        ea.subscribe(AuMsgAboutPanelState, (msg: AuMsgAboutPanelState) => {
            this.about_panel_is_open = msg.is_open
        })
        ea.subscribe(AuMsgFeedbackPanelState, (msg: AuMsgFeedbackPanelState) => {
            this.feedback_panel_is_open = msg.is_open
        })
        ea.subscribe(AuMsgNewGameRequest, (msg: AuMsgNewGameRequest) => {
            this.userRequestedStartNewGame(msg.request)
        })
        ea.subscribe(AuMsgRemoteCallState, (msg: AuMsgRemoteCallState) => {
            if (msg.message.remote_request_status === "sending") {
                this.in_process_count++
            } else {
                this.in_process_count--
            }
        })
        ea.subscribe(AuMsgCheckAnswer, (msg: AuMsgCheckAnswer) => {
            this.userRequestedCheckSolution(msg.callback)
        })
        ea.subscribe(AuMsgHintRequest, (msg: AuMsgHintRequest) => {
            this.userRequestedHint(msg.callback)
        })
        this.userRequestedStartNewGame({})
        this.keepAlive()
    }


    keepAlive() {
        setTimeout(() => {
            LicensePlateGameClient.requestUpTime()
            this.keepAlive()
        }, minutesToMilliseconds(15))
    }

    initiateRemoteRequest(message: ExpiringMessage) : void {
        this.ea.publish(new AuMsgRemoteCallState(message))
    }


    completedRemoteRequest(message: ExpiringMessage) : void {
        this.ea.publish(new AuMsgRemoteCallState(message))
    }


    notifyElapsedTimeUpdated(puzzle: LicensePlatePuzzle) {
        if (this.current_game) {
            this.current_game.elapsed_seconds = puzzle.elapsed_seconds
            this.elapsed_seconds = puzzle.elapsed_seconds    
        }
    }


    // @request
    //   The game_id and elapsed_seconds fields are populated by this function.
    userRequestedStartNewGame(request: LicensePlateGameAPI.NewGameRequest) {
        const getNextGradeLevel = (current_game: LicensePlatePuzzle) => {
            const average_grade_of_answers =  this.getAverageGradeLevelOfAnswers() 
            if (average_grade_of_answers != null) {
                return average_grade_of_answers
            } else {
                const reduced_grade = Math.max(this.current_game.grade_level - 1, 0)
                return reduced_grade
            }
        }
        if (this.current_game) {
            request.game_id = this.current_game.game_id
            request.elapsed_seconds = this.elapsed_seconds
            request.previous_puzzle_grade_level = getNextGradeLevel(this.current_game)
            this.current_game.stop()
            this.current_game = undefined  
        }
        this.elapsed_seconds = 0
        this.puzzle_answers = []
        this.hint = undefined
        const requested_text = request.user_selected_puzzle
        const promise = LicensePlateGameClient.requestNewGame(request)
        const remote_request_id = `new-game-${this.remote_request_id++}`
        this.initiateRemoteRequest({text: "requesting new game", message_type: "new-game-remote-request", remote_request_status: "sending", remote_request_id, expiration_secs: EXPIRATION_SECONDS.REQUEST})
        this.feedback_panel_is_open = false
        promise.then((new_game_response) => {
            if (new_game_response.solutions_count > 0) {
                new_game_response.puzzle_seed = new_game_response.puzzle_seed.toLocaleUpperCase()
                request.completion_callback?.(null, new_game_response)
                this.completedRemoteRequest({remote_request_id, text: `starting new game with: ${new_game_response.puzzle_seed}`, message_type: "new-game-remote-request", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.OK})
                const new_game = new LicensePlatePuzzle(new_game_response, this.notifyElapsedTimeUpdated.bind(this))
                this.current_game = new_game
                this.current_game.elapsed_seconds = 0
            } else {
                const text = `There are no solutions for: ${new_game_response.puzzle_seed}`
                request.completion_callback?.(text)
                this.completedRemoteRequest({remote_request_id, text, message_type: "new-game-remote-request", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR})
            }
            return undefined
        }, (error) => {
            let error_text = error.message || error.statusText || "unknown failure"
            request.completion_callback?.(error_text)
            this.completedRemoteRequest({remote_request_id, text: `new game for: "${requested_text}" failed: ${error_text}`, message_type: "new-game-remote-request", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR})
        })
    }

    currentWordIsANewAnswer() {
        const answer_text_uppercase = this.current_game.answer_text.toLocaleUpperCase()
        const found = this.puzzle_answers.find((puzzle_answer) => {return puzzle_answer.answer_text === answer_text_uppercase})
        return !found

    }

    userRequestedCheckSolution(completion_callback?: LicensePlateGameAPI.ClientCompletionCallback) {
        if (this.current_game) {
            if (this.currentWordIsANewAnswer()) {
                this.current_game.answer_text = this.current_game.answer_text
                const {game_id, puzzle_seed, elapsed_seconds, answer_text} = this.current_game
                const request: LicensePlateGameAPI.CheckAnswerRequest = {game_id, puzzle_seed, elapsed_seconds, answer_text}
                const promise = LicensePlateGameClient.requestCheckAnswer(request)
                const remote_request_id = `check-solution-${this.remote_request_id++}`
                this.initiateRemoteRequest({remote_request_id, text: "requesting answer check", message_type: "check-answer-remote-request", remote_request_status: "sending", expiration_secs: EXPIRATION_SECONDS.REQUEST})
                promise.then((graded_answer) => {
                    completion_callback?.(null, graded_answer)
                    this.completedRemoteRequest({remote_request_id, text: `received answer check for: ${answer_text}`, message_type: "check-answer-remote-request", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.OK})
                    const puzzle_answer = <PuzzleAnswer><unknown> graded_answer
                    puzzle_answer.attempt_number = this.puzzle_answers.length + 1
                    puzzle_answer.answer_text = puzzle_answer.answer_text.toLocaleUpperCase()
                    this.puzzle_answers.push(puzzle_answer)
                    return undefined
                }, (error) => {
                    let error_text = error.message || error.statusText || "unknown failure"
                    request.completion_callback?.(error_text)
                    this.completedRemoteRequest({remote_request_id, text: `check answer for: ${answer_text} failed: ${error_text}`, message_type: "check-answer-remote-request", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR})
                    return undefined
                })
            } else {
                completion_callback?.(`You have already submitted "${this.current_game.answer_text}" as an answer.`)
            }
        } else {
            completion_callback?.("There is no active game...")
        }
    }
    
    
    userRequestedHint(completion_callback?: LicensePlateGameAPI.ClientCompletionCallback) {
        if (this.current_game) {
            const {game_id, puzzle_seed, elapsed_seconds} = this.current_game
            const request: LicensePlateGameAPI.HintRequest = {game_id, puzzle_seed, elapsed_seconds}
            const promise = LicensePlateGameClient.requestHint(request)
            const remote_request_id = `get-hint-${this.remote_request_id++}`
            this.initiateRemoteRequest({remote_request_id, text: "requesting hint", message_type: "hint-remote-request", remote_request_status: "sending", expiration_secs: EXPIRATION_SECONDS.REQUEST})
            promise.then((hint) => {
                completion_callback?.(null, hint)
                this.completedRemoteRequest({remote_request_id, text: `received hint for: ${puzzle_seed}`, message_type: "hint-remote-request", remote_request_status: "ok", expiration_secs: EXPIRATION_SECONDS.OK})
                this.hint = hint
                return undefined
            }, (error) => {
                let error_text = error.message || error.statusText || "unknown failure"
                completion_callback?.(error_text)
                this.completedRemoteRequest({remote_request_id, text: `hint for: ${puzzle_seed} failed: ${error_text}`, message_type: "hint-remote-request", remote_request_status: "error", expiration_secs: EXPIRATION_SECONDS.ERROR})
                return undefined
            })
        }
    }

    getAverageGradeLevelOfAnswers() {
        const count = this.puzzle_answers.length
        let wrong_answer_count = 0
        let summed_grades = 0
        if (count) {
            this.puzzle_answers.forEach((puzzle_answer) => {
                if (puzzle_answer.grade_level != null) {
                    summed_grades += puzzle_answer.grade_level
                } else {
                    wrong_answer_count++
                }
            })
            const average_grade_before_penalties = Math.trunc(summed_grades / count)
            summed_grades -= (wrong_answer_count * average_grade_before_penalties)
            const adjusted_average_grade = Math.trunc(summed_grades / count)
            return Math.max(adjusted_average_grade, 0)
        } else {
            return undefined
        }
    }
    
}
