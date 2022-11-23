import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import { useEffect, useState, useRef } from 'react';
import pipe_green from "./assets/sprites/pipe-green.png";
import pipe_red from "./assets/sprites/pipe-red.png";
import backgroundDay from "./assets/sprites/background-day.png";
import backgroundNight from "./assets/sprites/background-night.png";
import base from "./assets/sprites/base.png";
import bird from "./assets/sprites/yellowbird-midflap.png";

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const GAME_WIDTH = 500;
const GAME_HEIGHT = 500;
const GRAVITY = 6;
const JUMP_HEIGHT = 100;
const OBSTACLE_WIDTH = 52;
let OBSTACLE_GAP = 200;
let OBSTACLE_SPEED = 5;
const REFRESH_RATE = 24;

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [obstacleHeight, setObstacleHeight] = useState(50);
  const [obstacleLeft, setObstacleLeft] = useState(GAME_WIDTH - OBSTACLE_WIDTH);
  const [score, setScore] = useState(0);
  const [birdDirection, setBirdDirection] = useState(null);

  const bottomObstacleHeight = GAME_HEIGHT - OBSTACLE_GAP- obstacleHeight;
  const obstacles = document.querySelectorAll(".obstacle");
  let backgroundScenes = document.querySelectorAll("#backgroundScene");

  var flying = useRef(0);

  useEffect(() => {
    let timeId;
    
    if(gameHasStarted && birdPosition < GAME_HEIGHT - BIRD_HEIGHT) {
      timeId = setInterval(()=>{
        setBirdPosition((birdPosition) => birdPosition + GRAVITY)
      }, REFRESH_RATE);
    }

    return ()=> {
      clearInterval(timeId);
    }
  }, [birdPosition, gameHasStarted]);

  useEffect(()=>{   
    let obstacleId;
    
    if(gameHasStarted && obstacleLeft >= -OBSTACLE_WIDTH) {
      obstacleId = setInterval(()=>{
        setObstacleLeft((obstacleLeft) => obstacleLeft - OBSTACLE_SPEED);
      }, REFRESH_RATE);

      return ()=>{
        clearInterval(obstacleId);
      }
    } else {
      setObstacleLeft(GAME_WIDTH - OBSTACLE_WIDTH);
      setObstacleHeight(Math.floor(Math.random() * (GAME_HEIGHT - OBSTACLE_GAP)));
      if(gameHasStarted) setScore((score) => score + 1);

      if(score > 0 && score%5 === 0 && OBSTACLE_GAP > 100) {
        OBSTACLE_GAP = OBSTACLE_GAP - 10;
        console.log("OBSTACLE GAP: " + OBSTACLE_GAP);
      }

      if(score > 0 && score%10 === 0 ) {
        OBSTACLE_SPEED = OBSTACLE_SPEED + 1;
        console.log("OBSTACLE SPEED: " + OBSTACLE_SPEED);
      }

      if(score % 7 === 0) {
        for(const obstacle of obstacles) {
          obstacle.classList.toggle("obstacle__green");
          obstacle.classList.toggle("obstacle__red");
        }
      }

      if(score % 13 === 0) {
        for(const backgroundScene of backgroundScenes) {
          backgroundScene.classList.remove("background__day");
          backgroundScene.classList.add("background__night");
        }
      }
    }
  }, [gameHasStarted, obstacleLeft]);

  useEffect(()=>{
    const hasCollidedTopObstacle = 
      birdPosition >= 0 && birdPosition < obstacleHeight;
    const hasCollidedBottomObstacle = 
      birdPosition <= GAME_HEIGHT && birdPosition >= GAME_HEIGHT - bottomObstacleHeight;
    const hasCollidedFloor = 
      birdPosition >= GAME_HEIGHT - BIRD_HEIGHT;

      if(
        hasCollidedFloor ||
        (obstacleLeft >= 0 && 
        obstacleLeft <= OBSTACLE_WIDTH && 
        (hasCollidedBottomObstacle || hasCollidedTopObstacle))
      ) {
        setGameHasStarted(false);
      }
  }, [birdPosition, obstacleHeight, bottomObstacleHeight, obstacleLeft]);

  const handleClick = () => {
    let newBirdPosition = birdPosition - JUMP_HEIGHT;
    setBirdDirection("bird__up");

    clearInterval(flying.current);

    flying.current = setTimeout(() => {
      setBirdDirection("bird__down");
    }, 400);

    if(!gameHasStarted) {
      setGameHasStarted(true);
      setScore(0);
      setBirdPosition(250);
      OBSTACLE_GAP = 200;
      OBSTACLE_SPEED = 6;
    } else if(newBirdPosition < 0) {
      setBirdPosition(0);
    } else {
      setBirdPosition(newBirdPosition);
    }
  };

  return (
    <Div onClick={handleClick}>
      <GameBox 
        height={GAME_HEIGHT} 
        width={GAME_WIDTH}
        >
        <Background id="backgroundScene" className="background__day"/>
        <Obstacle className='obstacle obstacle__top obstacle__green'
          top={0}
          width={OBSTACLE_WIDTH}
          height={obstacleHeight}
          left={obstacleLeft}
        />
        <Obstacle className='obstacle obstacle__bottom obstacle__green'
          top={GAME_HEIGHT - (obstacleHeight + bottomObstacleHeight)}
          width={OBSTACLE_WIDTH}
          height={bottomObstacleHeight}
          left={obstacleLeft}
        />
        <Bird id="bird" className = {birdDirection}
          width={BIRD_WIDTH}
          height={BIRD_HEIGHT}
          top={birdPosition}
        />
      </GameBox>
      <span>{score}</span>
      <Base />
    </Div>
  );
}

export default App;

const Bird = styled.div.attrs(props=>({
  style:{
    height: props.height,
    width: props.width,
    top: props.top,
  },
}))`
  position: absolute;
  transition: top .1s ease;
  left: 20px;
  border-radius: 50%;
  background-image: url(${bird});
  background-repeat: no-repeat;
  background-position: center;
  animation: flapping 1s linear infinite;

  &.bird__up {
    rotate: -20deg;
  }

  &.bird__down {
    rotate: 20deg;
  }

  &.bird__idle{
    ${'' /* animation: flapping 1s linear infinite, idle 1s linear infinite; */}
  }
`;

const Div = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  position: absolute;
  & span {
    color: white;
    font-size: 24px;
    position: absolute;
  }
`;

const GameBox = styled.div.attrs(props=>({
  style: {
    height: props.height,
    width: props.width,
  },
}))`
  position: relative;
  background-color: blue;

  overflow: hidden;
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(${GAME_WIDTH}px * 2);
  background-repeat: repeat-x;
  animation: slide 60s linear infinite;
  &.background__day{
    background-image: url(${backgroundDay});
  }
  &.background__night{
    background-image: url(${backgroundNight});
  }
`

const Base = styled.div`
  background-image: url(${base});
  position: absolute;
  bottom: 0;
  transform: translateY(100%);
  width: ${GAME_WIDTH}px;
  height: 100%;
  background-repeat: repeat-x;
`;

const Obstacle = styled.div.attrs(props => ({
    style: {
      top: props.top,
      left: props.left,
      height: props.height,
      width: props.width,
    },
}))`position:relative;
  background-color: green;
  &.obstacle__green {
    background-image: url(${pipe_green});
  }
  &.obstacle__red {
    background-image: url(${pipe_red});
  }
  &.obstacle__top{
     rotate: 180deg;
   }
`;

