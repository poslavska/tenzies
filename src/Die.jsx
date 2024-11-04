import './index.css'
export default function Die(props) {
    const styles = {
        backgroundColor: props.isHeld ? "#59E391" : "white"
    }
    return (
        <button 
            className={`die-face pattern${props.template}`}
            style={styles}
            onClick={props.tenzies ? null : props.holdDice}
        >
            {props.dots()}
        </button>
    )
}