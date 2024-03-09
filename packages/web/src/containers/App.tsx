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

const PAGES = {
  about: lazy(() => import("./About")),
  chords: lazy(() => import("./Chords")),
  dictaphone: lazy(() => import("./Dictaphone")),
  guitar: lazy(() => import("./Guitar")),
  midi: lazy(() => import("./Midi")),
  piano: lazy(() => import("./Piano")),
  player: lazy(() => import("./Player")),
  radio: lazy(() => import("./Radio")),
  search: lazy(() => import("./Search")),
  staff: lazy(() => import("./Staff")),
  tones: lazy(() => import("./Tones")),
  tuner: lazy(() => import("./Tuner")),
  video: lazy(() => import("./Video")),
};

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
        {Object.keys(PAGES).map((path) => (
          <li key={path}>
            <Link to={`/${path}/`}>{path}</Link>
          </li>
        ))}
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
              {Object.entries(PAGES).map(([path, Page]) => (
                <Route key={path} path={`/${path}/`} element={<Page />} />
              ))}
              <Route path="/" element={<Redirect to="/piano/" />} />
            </Routes>
          </Suspense>
        </Router>
      </div>
    </div>
  );
}

export default hot(App);
