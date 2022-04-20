import { hot } from "react-hot-loader/root";
import React, { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  HashRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import { increment } from "../actions";
import Spinner from "../components/Spinner";
import styles from "./App.module.scss";

const Player = lazy(() => import("./Player"));

const Search = lazy(() => import("./Search"));

const Piano = lazy(() => import("./Piano"));

const Midi = lazy(() => import("./Midi"));

const Tones = lazy(() => import("./Tones"));

const Tuner = lazy(() => import("./Tuner"));

const About = lazy(() => import("./About"));

function Redirect({ to }) {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}

function Navigation() {
  return (
    <nav className={styles.Nav}>
      <h1>Audio</h1>
      <ul>
        <li>
          <Link to="/player/">Player</Link>
        </li>
        <li>
          <Link to="/search/">Search</Link>
        </li>
        <li>
          <Link to="/piano/">Piano</Link>
        </li>
        <li>
          <Link to="/midi/">Midi</Link>
        </li>
        <li>
          <Link to="/tones/">Tones</Link>
        </li>
        <li>
          <Link to="/tuner/">Tuner</Link>
        </li>
        <li>
          <Link to="/about/">About</Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  const counter = useSelector(({ counter }: { counter: number }) => counter);
  const dispatch = useDispatch();

  return (
    <div className={styles.App}>
      <div>
        <button onClick={(e) => dispatch(increment())}>{counter}</button>
        <Router>
          <Navigation />
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/player/" element={<Player />} />
              <Route path="/search/" element={<Search />} />
              <Route path="/about/" element={<About />} />
              <Route path="/tones/" element={<Tones />} />
              <Route path="/tuner/" element={<Tuner />} />
              <Route path="/piano/" element={<Piano />} />
              <Route path="/midi/" element={<Midi />} />
              <Route path="/" element={<Redirect to="/player/" />} />
            </Routes>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

export default hot(App);
