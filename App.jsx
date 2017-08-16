import React from 'react';

import SplitPane from 'react-split-pane';

import ToolbarView from './ContainerComponents/ToolbarView';
import ContainerView from './ContainerComponents/ContainerView';

export class App extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<SplitPane split="horizontal" minSize={40} defaultSize={40} className="primary" onChange={size => localStorage.setItem('splitPos0', size)}>
				<ToolbarView/>
				<ContainerView/>
			</SplitPane>
		);
	}
}
