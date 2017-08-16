import Define from './../class/Define.js'

import React from 'react';
import render from 'react-dom';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import { ButtonGroup, ButtonToolbar, Button } from 'react-bootstrap';

/* デバッグ用 */
function __debug(text) {
	ipcRenderer.send('debug-log', text);
}

/* クラスの実装 */
class ToolbarView extends React.Component {

	constructor(props) {
		super(props);

		/* bind */
		this.SetMode = this.SetMode.bind(this);

		/* イベントの登録 */
		const that = this;

	}

	render() {
		return (
			<ButtonToolbar>
				<Button bsStyle="primary" onClick={() => this.SetMode(Define.VIEW_TYPE.SAMPLE0)}>サンプル0</Button>
			</ButtonToolbar>
		);
	}

	/*  */
	SetMode(mode) {
		this.props.onSetMode(mode);
	}
}


/* Actionの実装 */
function changeMode(mode) {
	return {
		type: 'CHANGE_MODE',
		mode,
	};
}

/* Componentのプロパティとデータの状態をバインドする */
const mapState = (state, ownProps) => ({
});

/* ActionをDispatchする */
function mapDispatch(dispatch) {
	return {
		onSetMode: (mode) => dispatch(changeMode(mode)),
	}
}

/* ContainerからActionが発行されてState(データの状態)を変更できるようにする */
export default connect(mapState, mapDispatch)(ToolbarView);
