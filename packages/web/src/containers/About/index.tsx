import React from "react";
import styles from "./styles.module.scss";

export default function Section() {
  return (
    <section className={styles.Section}>
      <h3>About</h3>
      <div className={styles.Hero}>
        <div className={styles.Columns}>
          <div className={styles.Body}>
            <p>
              Super User is a question and answer site for computer enthusiasts
              and power users. It only takes a minute to sign up.
            </p>
            <a
              className={styles.Button}
              href="/users/signup?ssrc=hero&amp;returnurl=https%3a%2f%2fsuperuser.com%2fquestions%2f1202835%2fexim4-says-warning-purging-the-environment-even-though-add-keep-environment-a"
            >
              Sign up to join this community
            </a>
          </div>
          <div
            className={styles.Background}
            style={{
              backgroundImage: `url("${
                require("./assets/anonymousHeroBackground.svg").default
              }")`,
            }}
          >
            <div className={styles.Text}>
              <div className={styles.Icon}>
                <img
                  width="31"
                  src={require("./assets/anonymousHeroQuestions.svg").default}
                />
              </div>
              <div>Anybody can ask a question</div>
            </div>
            <div className={styles.Text}>
              <div className={styles.Icon}>
                <img
                  width="35"
                  src={require("./assets/anonymousHeroAnswers.svg").default}
                />
              </div>
              <div>Anybody can answer</div>
            </div>
            <div className={styles.Text}>
              <div className={styles.Icon}>
                <img
                  width="24"
                  src={require("./assets/anonymousHeroUpvote.svg").default}
                />
              </div>
              <div>The best answers are voted up and rise to the top</div>
            </div>
          </div>
          <div className={styles.Close}>
            <button>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M15 4.41 13.59 3 9 7.59 4.41 3 3 4.41 7.59 9 3 13.59 4.41 15 9 10.41 13.59 15 15 13.59 10.41 9 15 4.41Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
