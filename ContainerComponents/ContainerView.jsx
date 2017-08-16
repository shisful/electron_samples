import Define from './../class/Define.js'

import React from 'react';

import SplitPane from 'react-split-pane';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';

import SampleView from './SampleView';

/* デバッグ用 */
function __debug(text) {
	ipcRenderer.send('debug-log', text);
}

/* クラスの実装 */
class ContainerView extends React.Component {

	constructor(props) {
		super(props);

		/* bind */


		/* イベントの登録 */
		const that = this;

		/**/

	}

	render() {
		switch(this.props.viewType){

		case Define.VIEW_TYPE.SAMPLE0 :
			return (
					<SampleView/>
			);
		default:
			return (
					<div />
				);
		}
	}
}


/* Actionの実装 */



/* Componentのプロパティとデータの状態をバインドする */
const mapState = (state, ownProps) => ({
	viewType:	state.viewType
});

/* ActionをDispatchする */
function mapDispatch(dispatch) {
	return {
	}
}

/* ContainerからActionが発行されてState(データの状態)を変更できるようにする */
export default connect(mapState, mapDispatch)(ContainerView);
