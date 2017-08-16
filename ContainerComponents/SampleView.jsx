'use strict';
import jQuery from 'jquery'
window.$ = window.jQuery = jQuery;
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { remote, ipcRenderer } from 'electron'
import scanf from 'scanf'
import fs from 'fs'
import { ButtonGroup, ButtonToolbar, Button, DropdownButton, MenuItem }  from 'react-bootstrap'
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc'
import Draggable from 'react-draggable';
import {DraggableCore} from 'react-draggable';
import { Resizable, ResizableBox } from 'react-resizable';

/* デバッグ用 */
function __debug(text) {
	ipcRenderer.send('debug-log', text);
}

/* クラスの実装 */
class SampleView extends React.Component {

	constructor(props) {
		super(props);
		var contentsDatas = [];
		{
			for( var i = 0 ; i < 10;i++){
				contentsDatas.push( { time: i ,name:i, width:2 } );
			}
		}
		this.state = { scrollTop : 0 ,scrollLeft : 0, contentsDatas : contentsDatas};

		this.onScroll = this.onScroll.bind(this);
		this.onBodyDrag = this.onBodyDrag.bind(this);
		this.onBodyDragStart = this.onBodyDragStart.bind(this);
		this.onBodyDragStop = this.onBodyDragStop.bind(this);
		this.onRightDrag = this.onRightDrag.bind(this);
		this.onRightDragStart = this.onRightDragStart.bind(this);
		this.onRightDragStop = this.onRightDragStop.bind(this);
		this.onLeftDrag = this.onLeftDrag.bind(this);
		this.onLeftDragStart = this.onLeftDragStart.bind(this);
		this.onLeftDragStop = this.onLeftDragStop.bind(this);

		this.beforeMouseX = 0;
	}

	componentDidUpdate(prevProps, prevState){
	}

	componentDidMount(){
	}

	onScroll(left,top){
		this.setState({scrollTop : top ,scrollLeft : left});
	}

	onBodyDragStart(e,index){
		this.beforeMouseX = e.clientX;
	}

	onBodyDrag(e,index){
	}


	onBodyDragStop(e,index){
		var deltaX = e.clientX - this.beforeMouseX;
		this.beforeMouseX = e.clientX;

		this.state.contentsDatas[index].time += deltaX/50;
		if(this.state.contentsDatas[index].time < 0){
			this.state.contentsDatas[index].time = 0;
		}
		this.setState(
			{
				contentsDatas : this.state.contentsDatas
			}
		);
	}

	onRightDragStart(e,index){
		this.beforeMouseX = e.clientX;
	}

	onRightDrag(e,index){
//		this.onRightDragStop(e,index);
	}

	onRightDragStop(e,index){
		var deltaX = e.clientX - this.beforeMouseX;
		this.beforeMouseX = e.clientX;
		this.state.contentsDatas[index].width += deltaX/50;
		if(this.state.contentsDatas[index].width < 0){
			this.state.contentsDatas[index].width = 0;
		}
		this.setState(
			{
				contentsDatas : this.state.contentsDatas
			}
		);
	}

	onLeftDragStart(e,index){
		this.beforeMouseX = e.clientX;
	}

	onLeftDrag(e,index){
//		this.onLeftDragStop(e,index);
	}

	onLeftDragStop(e,index){
		var deltaX = e.clientX - this.beforeMouseX;
		this.beforeMouseX = e.clientX;

		{
			var beforeWidth = this.state.contentsDatas[index].width;
			var newWidth = beforeWidth - deltaX/50;
			if( newWidth < 0){
				newWidth = 0;
			}
			var beforeTime = this.state.contentsDatas[index].time;
			var newTime = beforeTime + (beforeWidth - newWidth);

			this.state.contentsDatas[index].width = newWidth;
			this.state.contentsDatas[index].time  = newTime;
		}
		this.setState(
			{
				contentsDatas : this.state.contentsDatas
			}
		);
	}

	render() {
		return (
			<SampleViewBody that={this}/>
		);
	}
}

/* propsの型指定を行う */
SampleView.propTypes = {
//	test	 : React.PropTypes.instanceOf(Test),
};

function deleteTest() {
	return {
		type: 'DELETE_TEST',
	}
}

/* ContainerComponentの作成 */
const mapStateToProps = (state, ownProps) => {
	return {
		test	 : state.test,
	}
}


const mapDispatchToProps = dispatch => {
	return {
		onDeleteTest	  : () => dispatch(deleteTest()),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	null,
	{pure: false}
)(SampleView)

var scaleDatas = [];

{
	for( var i = 0 ; i < 1000;i++){
		scaleDatas.push( { text: i } );
	}
}


const SampleViewBody = ({that}) => {
	return (
			<div id='sample-view-body'>
				<div className='scrollable-contents-area'>
					<div className='scrollable-contents-top-left' />
					<div className='scrollable-contents-header' style={{left : -that.state.scrollLeft}}>
						<HeaderScale that={that} />
					</div>
					<div className='scrollable-contents-sidebar' style={{top : -that.state.scrollTop}}>
						<SidebarScale that={that} />
					</div>
					<div className='scrollable-contents-body' onScroll={(event)=>{that.onScroll(event.target.scrollLeft,event.target.scrollTop);}}>
						<div className='scrollable-contents'>
							<BodyVerticalScale that={that} />
							<BodyHorizonScale that={that} />
							<BodyContents that={that} datas={that.state.contentsDatas}/>
						</div>
					</div>
				</div>
			</div>
	)
}


const BodyContents = ({that,datas}) => {
	return (
		<div className="contents-items">
			{
				datas.map(
					function(data,index){
						return(
								<Draggable
									key={`dragable-${index}`}
									axis="x"
									defaultPosition={{x:data.time * 50,y:data.name * 50}}
									position={{x:data.time * 50,y:data.name * 50}}
									onStart={that.onBodyDragStart}
									onDrag={(e) => {that.onBodyDrag(e,index)}}
									onStop={(e) => {that.onBodyDragStop(e,index)}}
									handle=".contents-item-body"
								>
									<div
										key={`data-${index}`}
										className="contents-item-body"
										style={
											{
												width : data.width * 50,
											}
										}
									>
									</div>
								</Draggable>
						 );
					}
				)
			}
			{
					datas.map(
						function(data,index){
					  	return(
									<Draggable
						 		  	key={`dragable-${index}`}
						 				axis="x"
										handle=".contents-item-left-bar"

										defaultPosition={{x:data.time * 50, y : data.name * 50}}
										position={{x:data.time * 50, y : data.name * 50}}
										onStart={(e) => {that.onLeftDragStart(e,index)}}
										onDrag={(e) => {that.onLeftDrag(e,index)}}
										onStop={(e) => {that.onLeftDragStop(e,index)}}
						 			>
							 		 	<div
							 				className="contents-item-left-bar"
							 			>
									 	</div>
							 		</Draggable>
					 		);
						}
					)
			}
			{
					datas.map(
						function(data,index){
							return(
									<Draggable
										key={`dragable-${index}`}
										axis="x"
										handle=".contents-item-right-bar"

										defaultPosition={{x:data.time * 50 + data.width * 50 - 7, y : data.name * 50}}
										position={{x:data.time * 50 + data.width * 50 - 7, y : data.name * 50}}
										onStart={(e) => {that.onRightDragStart(e,index)}}
										onDrag={(e) => {that.onRightDrag(e,index)}}
										onStop={(e) => {that.onRightDragStop(e,index)}}

									>
										<div
											className="contents-item-right-bar"
										>
										</div>
									</Draggable>
							 );
						}
					)
			}
		</div>
	)
}

const HeaderScale = ({that}) => {
	return (
		<ul className="scale-header">
	    {HeaderScales}
	  </ul>
	)
}

const HeaderScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}>{item.text}</li>
		}
);

const BodyVerticalScale = ({that}) => {
	return (
		<ul className="scale-contents-vertical">
	    {BodyVerticalScales}
	  </ul>
	)
}

const BodyVerticalScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}></li>
		}
);

const SidebarScale = ({that}) => {
	return (
		<ul className="scale-sidebar">
	    {SidebarScales}
	  </ul>
	)
}

const BodyHorizonScale = ({that}) => {
	return (
		<ul className="scale-contents-horizon">
	    {BodyHorizonScales}
	  </ul>
	)
}

const SidebarScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}>{item.text}</li>
	}
);

const BodyHorizonScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}></li>
		}
);
