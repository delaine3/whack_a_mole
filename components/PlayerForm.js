import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { mutate } from "swr";
import { Form } from "semantic-ui-react";
import { tileArray } from "./tile_array";
import Link from "next/link";

const PlayerForm = ({ formId, fornewPlayer = true }) => {
  const router = useRouter();
  const contentType = "application/json";

  const [inProgress, setInprogress] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [moveMole, setMoveMole] = useState(true);
  const [start_called, setStart_called] = useState(false);
  const [pause_called, setPause_called] = useState(false);
  const [form, setForm] = useState({
    name: playerName,
    score: score,
  });
  const game_timer = setTimeout(() => {
    if (inProgress) {
      setTimer(timer - 1);
      setMoveMole(!moveMole);
    }
  }, 1000);

  useEffect(() => {
    if (moveMole && !gameOver && inProgress) {
      var selectElements = document.querySelectorAll(".tile");

      selectElements.forEach((square) => {
        square.classList.remove("mole");
      });

      var selected_tile =
        selectElements[Math.floor(Math.random() * selectElements.length)];
      selected_tile.classList.add("mole");
    }
  }, [moveMole]);
  useEffect(() => {
    if (timer == 0) {
      clearTimeout(game_timer);
      setGameOver(true);
      setInprogress(false);
    }
  }, [timer]);
  const start = () => {
    clearTimeout(game_timer);

    setStart_called(true);
    setGameOver(false);
    setScore(0);
    setTimer(60);
    setInprogress(true);
    setPlayerName("");
  };
  const pause = () => {
    setPause_called(true);
    setInprogress(false);
  };
  const resume = () => {
    setPause_called(false);

    setInprogress(true);
  };
  function Tile() {
    const check_if_theres_mole = (event) => {
      if (event.target.classList.contains("mole")) {
        setScore(score + 1);
      }
    };
    return (
      <div
        className="tile"
        key={Math.random() * 10000}
        onClick={check_if_theres_mole}
      ></div>
    );
  }

  let tileGrid = tileArray[0].map((tile) => {
    return Tile();
  });

  /* The PUT method edits an existing entry in the mongodb database. */
  const putData = async (form) => {
    const { id } = router.query;

    try {
      const res = await fetch(`/api/player/${id}`, {
        method: "PUT",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify({
          name: playerName,
          score: score,
        }),
      });

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status);
      }

      const { data } = await res.json();

      mutate(`/api/player/${id}`, data, false); // Update the local data without a revalidation
      router.push("/");
    } catch (error) {
      setMessage("Failed to update player");
    }
  };

  /* The POST method adds a new entry in the mongodb database. */
  const postData = async (form) => {
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify({
          name: playerName,
          score: score,
        }),
      });

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status);
      }

      router.push("/");
    } catch (error) {
      setMessage("Failed to add player");
    }
  };

  const handleChange = (e) => {
    const target = e.target;
    const value = target.value;

    setPlayerName(value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = formValidate();
    if (Object.keys(errs).length === 0) {
      fornewPlayer ? postData(form) : putData(form);
    } else {
      setErrors({ errs });
    }
  };

  const formValidate = () => {
    let err = {};

    return err;
  };

  return (
    <div>
      <h1>
        <Link href="/">
          <button className="newFormButton">
            {" "}
            <a>Leader Board</a>{" "}
          </button>
        </Link>
      </h1>

      {gameOver ? (
        <div>
          <h1>
            <button onClick={start} className="newFormButton">
              {" "}
              <a>New Game</a>{" "}
            </button>
          </h1>
          <Form className="save-player" id={formId} onSubmit={handleSubmit}>
            <h2>Yay! Record your high score by filling in your name and hitting the submit button!</h2>
            <label htmlFor="name">Name</label>

            <input
              type="text"
              name="name"
              value={playerName}
              onChange={handleChange}
              required
            />
            <label htmlFor="score">Score</label>

            <p
              type="text"
              name="score"
              value={score}
              onChange={handleChange}
              required
            >
              {score}
            </p>

            <button type="submit" className="btn submit">
              Submit
            </button>

            <>{message != "" ? message : <></>}</>
            <div>
              {Object.keys(errors).map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </div>
          </Form>
        </div>
      ) : null}

      {!gameOver ? (
        <div className="game">
          <div>
            {start_called ? (
              <div>
                {pause_called ? (
                  <button id="resume" onClick={resume}>
                    Resume
                  </button>
                ) : (
                  <button id="pause" onClick={pause}>
                    Pause
                  </button>
                )}
              </div>
            ) : (
              <button id="start" onClick={start}>
                Start 
              </button>
            )}

            <h1>Score : {score} </h1>
            <h1>Time : {timer} </h1>

            <div id="tile-grid" className="grid">
              {tileGrid}
            </div>
          </div>
        </div>
      ) : null}
      <a href="https://www.vecteezy.com/free-vector/ground-texture">
        Ground Texture Vectors by Vecteezy
      </a>
    </div>
  );
};

export default PlayerForm;
