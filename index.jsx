import Define from './class/Define.js'

import SplitPane from 'react-split-pane';
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { App } from './App';


/* Stateの初期値 */
const initialState = {
	viewType			: Define.VIEW_TYPE.SAMPLE0,
};


/* Reducerの実装 */
function appReducer( state = initialState, action ) {
	switch (action.type) {
		case 'CHANGE_MODE':
			return Object.assign({}, state, {
				viewType: action.mode
			});

		default:
			return state;
	}
}


/* Viewの実装 */
//Connect to Redux
function mapStateToProps(state, ownProps) {
	return {
		value: state.value,
		viewType: state.viewType,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onClick(value) {
			dispatch(send(value));
		},
	};
}

export const AppContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(App);


/* Storeの作成 */
const store = createStore(appReducer, initialState);

/* Reducerによって変更された状態(Store)をContainerに渡す */
render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('container')
);
