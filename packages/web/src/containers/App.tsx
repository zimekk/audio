import { hot } from "react-hot-loader/root";
import React, { Suspense, lazy, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  HashRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
} from "react-router-dom";
import { increment } from "../actions";
import { delay } from "../utils";
import Spinner from "../components/Spinner";
import styles from "./App.module.scss";

const Piano = lazy(() => import("./Piano"));

const Tuner = lazy(() => import("./Tuner"));

const About = lazy(() => import("./About"));

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/piano/">Piano</Link>
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
      <h1>Audio</h1>
      <div>
        <button onClick={(e) => dispatch(increment())}>{counter}</button>
        <Router>
          <Suspense fallback={<Spinner />}>
            <Navigation />
            <Switch>
              <Route path="/about/">
                <About />
              </Route>
              <Route path="/tuner/">
                <Tuner />
              </Route>
              <Route path="/piano/">
                <Piano />
              </Route>
              <Redirect to={"/piano/"} />
            </Switch>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

export default hot(App);
