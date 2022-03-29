import type {LicensePlateGameAPI} from "license-plate-game-api"
import {GradeLevel} from "license-plate-game-api"


// A description of a license plate puzzle.
// This builds on the NewGameResponse from the server, and adds
export class LicensePlatePuzzle implements LicensePlateGameAPI.NewGameResponse {
    //from NewGameResponse 
    public puzzle_seed: string
    // There is no game ID if there are no answers
    public game_id?: string
    public max_word_length: number
    public solutions_count: number
    public grade_level: GradeLevel
    public notes?:  string[]
    // end of NewGameResponse
    // An example of the text that would appear on an actual license plate. e.g. 7 ABC 123
    public license_plate_text: string
    public elapsed_seconds: number
    // The current answer being built by the user
    public answer_text: string
    // true while this Puzzle is active.
    // Set to false by calling the stop() command in order to stop the elapsed_seconds timer.
    private timer_is_active: boolean


    // @param notifyElapsedTimeUpdated Is called each time elapsed_seconds is updated.
    constructor(new_game: LicensePlateGameAPI.NewGameResponse, notifyElapsedTimeUpdated?: (puzzle: LicensePlatePuzzle) => void) {
        const updateElapsedTime = () => {
            if (this.timer_is_active) {
                this.elapsed_seconds++
                notifyElapsedTimeUpdated?.(this)
                setTimeout(updateElapsedTime, 1000)
            }
        }
        this.game_id = new_game.game_id
        this.puzzle_seed = new_game.puzzle_seed.toLocaleUpperCase()
        this.answer_text = this.puzzle_seed
        this.solutions_count = new_game.solutions_count
        this.grade_level = new_game.grade_level
        this.notes = new_game.notes
        this.license_plate_text = LicensePlatePuzzle.generateLicensePlateText(new_game.puzzle_seed, "US")
        this.elapsed_seconds = 0
        this.timer_is_active = true
        setTimeout(updateElapsedTime, 1000)
    }


    // Call this to stop the elapsed_seconds timer.
    // Upon timeout of the currently active timer, the timer is not renewed. 
    // This removes the final reference to this instance that is held by this instance,
    // allowing this instance to be garbage collected.
    public stop() {
        this.timer_is_active = false
    }


    // Generate an example of a license plate that contains the given puzzle_seed text.
    // For example "ABC 123"
    // The portions of the example license plate text other than the puzzle_seed are randomized.
    public static generateLicensePlateText(puzzle_seed: string, format: "US") {
        function getRandomInt(exclusive_max: number) {
            return Math.floor(Math.random() * exclusive_max);
        }
        function getRandomDigit() {
            const digit = getRandomInt(10)
            return digit
        }
        function getLicensePlateText() {
            const chars_precede_digits = (getRandomInt(2) == 1)
            if (chars_precede_digits) {
                return `${extra_digit} ${puzzle_seed.toUpperCase()} ${digits}`
            } else {
                return `${digits} ${puzzle_seed.toUpperCase()} ${extra_digit}`
            }
        }
        // for now format means "US"
        const add_extra_digit = (getRandomInt(5) == 1)
        const extra_digit = add_extra_digit ? getRandomDigit() : ""
        const digits = `${getRandomDigit()}${getRandomDigit()}${getRandomDigit()}`
        const license_plate_text = getLicensePlateText()
        return license_plate_text
    }

}
