import React from 'react'
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import './index.css'

export default function App() {
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [rollCount, setRollCount] = React.useState(0)
    const [endTime, setEndTime] = React.useState(0)
    const [timeArray, setTimeArray] = React.useState(() => JSON.parse(localStorage.getItem("time")) || [])
    const [timeText, setTimeText] = React.useState("")
    const [notEqualText, setNotEqualText] = React.useState("")
    const rollsTime = React.useRef(0) /* makes sure it holds the value across renders without needing to rely on React's 
    state-update timing (maintains a mutable reference without needing re-rendering) */
    
    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            const end = Math.round((Date.now() - rollsTime.current) / 1000) //convert from milliseconds to seconds
            if (end >= 60) {
              setEndTime((end / 60).toFixed(2)) //convert to minutes with 2 decimal places
              setTimeText(end === 1 ? "minute" : "minutes")
          } else {
              setEndTime(end)
              setTimeText("seconds")
          }
        }
    }, [dice])

    React.useEffect(() => { //useEffect to handle when 'tenzies' becomes true
        if (tenzies){
            const end = Math.round((Date.now() - rollsTime.current) / 1000)
            setTimeArray(prevArr => [end, ...prevArr])
        }
    }, [tenzies])

    React.useEffect(() => { //useEffect to store timeArray in localStorage, so that localStorage is always updated whenever it changes
        localStorage.setItem("time", JSON.stringify(timeArray))
    }, [timeArray])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            const heldDice = dice.filter(die => die.isHeld)
            const allEqual = heldDice.every(die => die.value === heldDice[0]?.value)
            if (heldDice && !allEqual){
                setNotEqualText(<p className="not-equal">Held dice are not equal!</p>)
                return
            } else {
                setNotEqualText("")
            }

            if (rollCount === 1){
              setEndTime(0)
              rollsTime.current = Date.now() //start timing on the first roll
            }
            setRollCount(prevCount => prevCount + 1)
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            setRollCount(0)
            setTenzies(false)
            setDice(allNewDice())
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }

    function generateDots(id){
        const foundDie = dice.find(die => die.id === id)
        const dots = []
        for (let i = 0; i < foundDie.value; i++){
            dots.push(<span key={i} className={`dot dot${[i + 1]}`}></span>) 
        }

        return dots
    }

    function getBestTime(){
        const arr = JSON.parse(localStorage.getItem("time")) || []

        const currentEndTime = endTime
        const combinedArr = [currentEndTime, ...arr]

        if (combinedArr.length === 0) {
            return `${endTime} ${timeText}`
        }

        const best = Math.min(...combinedArr)

        if (best >= 60) {
            const formattedBest = (best / 60).toFixed(2)
            if (formattedBest === 1){
                return `${formattedBest} minute`
            } else {
                return `${formattedBest} minutes`
            }
        } else {
            return `${best} seconds`
        }
    }

    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            template={die.value} 
            dots={() => generateDots(die.id)}
            tenzies={tenzies}
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            {tenzies && <p className="rolls-total">You won the game with <span className="bold">{rollCount}
            </span> rolls in <span className="bold">{endTime} {timeText}</span></p>}
            {!tenzies && <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>}
            <div className="dice-container">
                {diceElements}
            </div>
            {notEqualText}
            {tenzies && <p className="best-time"> Your best time is: <span className="bold">{getBestTime()}</span></p>}
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    )
}