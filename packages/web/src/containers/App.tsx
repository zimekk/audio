import { hot } from "react-hot-loader/root";
import React, { Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
} from "react-router-dom";
import { increment } from "../actions";
import Spinner from "../components/Spinner";
import styles from "./App.module.scss";

const Player = lazy(() => import("./Player"));

const Search = lazy(() => import("./Search"));

const Piano = lazy(() => import("./Piano"));

const Tones = lazy(() => import("./Tones"));

const Tuner = lazy(() => import("./Tuner"));

const About = lazy(() => import("./About"));

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
          <Suspense fallback={<Spinner />}>
            <Navigation />
            <Switch>
              <Route path="/player/">
                <Player />
              </Route>
              <Route path="/search/">
                <Search />
              </Route>
              <Route path="/about/">
                <About />
              </Route>
              <Route path="/tones/">
                <Tones />
              </Route>
              <Route path="/tuner/">
                <Tuner />
              </Route>
              <Route path="/piano/">
                <Piano />
              </Route>
              <Redirect to={"/player/"} />
            </Switch>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

export default hot(App);
