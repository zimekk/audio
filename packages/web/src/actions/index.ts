import { createAction } from "redux-actions";
// import { createAction, createActions } from "redux-actions";

export const increment = createAction("INCREMENT");

// export const { increment, navigate, navigatePath } = createActions({
//   INCREMENT: null,
//   NAVIGATE: (path) => {
//     console.log(["navigate"], path);
//     history.push(`#${path}`);
//   },
//   NAVIGATE_PATH: null,
// });

// export const locationHash = (locationHash) => (dispatch) => {
//   const [path, hash = "page1"] = decodeURI(locationHash).match(/^#(.+)/) || [];
//   console.log(["LOCATION_HASH"], path, hash);
//   dispatch(navigatePath(hash));
// };
