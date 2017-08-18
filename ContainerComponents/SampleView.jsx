'use strict';
import Define from './../class/Define.js'

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
		this.state = {
		 scrollTop     : 0 ,
		 scrollLeft    : 0,
		 contentsDatas : contentsDatas,
		 itemDragState : Define.DRAG_TARGET.NONE,
		 horizontalScaleWidth : Define.SCALE_HORIZONTAL_WIDTH,
		};

		this.onScroll = this.onScroll.bind(this);

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragStop  = this.onDragStop.bind(this);
		this.onDrag      = this.onDrag.bind(this);

		this.beforeMouseX = 0;
	}

	componentDidUpdate(prevProps, prevState){
	}

	componentDidMount(){
	}

	onScroll(left,top){
		this.setState({scrollTop : top ,scrollLeft : left});
	}

	onDragStart( target, index, e ){
		this.beforeMouseX = e.clientX;
		this.setState( { itemDragTarget : target } );
	}

	onDragStop( target, index, e ){
		var beforeTime = this.state.contentsDatas[index].time;
		var beforeWidth = this.state.contentsDatas[index].width;

		var deltaX = e.clientX - this.beforeMouseX;
		this.beforeMouseX = e.clientX;
		{
			switch(target){
				case Define.DRAG_TARGET.BODY :
				{
					this.state.contentsDatas[index].time += deltaX/this.state.horizontalScaleWidth;
					if(this.state.contentsDatas[index].time < 0){
						this.state.contentsDatas[index].time = 0;
					}
				}
				break;
				case Define.DRAG_TARGET.RIGHT :
				{
					this.state.contentsDatas[index].width += deltaX/this.state.horizontalScaleWidth;
					if(this.state.contentsDatas[index].width < 0){
						this.state.contentsDatas[index].width = 0;
					}
				}
				break;
				case Define.DRAG_TARGET.LEFT :
				{
					this.state.contentsDatas[index].width -= deltaX/this.state.horizontalScaleWidth;
					if(this.state.contentsDatas[index].width < 0){
						this.state.contentsDatas[index].width = 0;
					}
					this.state.contentsDatas[index].time  = beforeTime + (beforeWidth - this.state.contentsDatas[index].width);
					if( this.state.contentsDatas[index].time < 0 ){
						this.state.contentsDatas[index].time = 0;
						this.state.contentsDatas[index].width = beforeWidth + beforeTime - this.state.contentsDatas[index].time;
					}
				}
				break;
			}
		}

		this.setState(
			{
				contentsDatas : this.state.contentsDatas,
				itemDragState : Define.DRAG_TARGET.NONE
			}
		);
	}

	onDrag( target, index, e ){
		/* ドラッグが重かったらここを消す */
		this.onDragStop(target, index, e);
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
					<div
					 	className='scrollable-contents-header'
					  style={
							{
								transform: "translateX(" + -that.state.scrollLeft + "px)"
							}
						}
					>
						<HeaderScale that={that} />
					</div>
					<div
						className='scrollable-contents-sidebar'
						style={
							{
								transform: "translateY(" + -that.state.scrollTop + "px)"
							}
						}
					>
						<SidebarScale that={that} />
					</div>
					<div className='scrollable-contents-body' onScroll={(event)=>{that.onScroll(event.target.scrollLeft,event.target.scrollTop);}}>
						<div className='scrollable-contents'>
							<ContentsVerticalScale that={that} />
							<ContentsHorizontalScale that={that} />
							<ContentsItems that={that} datas={that.state.contentsDatas}/>
						</div>
					</div>
				</div>
			</div>
	)
}


const ContentsItems = ({that,datas}) => {
	return (
		<div className="contents-items">
			{
				datas.map(
					function(data,index){
						return(
								<Draggable
									key={`dragable-${index}`}
									axis="x"
									defaultPosition={{x:data.time * that.state.horizontalScaleWidth, y:data.name * Define.SCALE_VERTICAL_HEIGHT}}
									position={{x:data.time * that.state.horizontalScaleWidth,y:data.name * Define.SCALE_VERTICAL_HEIGHT}}
									onStart={(e) => {that.onDragStart(Define.DRAG_TARGET.BODY,index,e)}}
									onStop={(e) => {that.onDragStop(Define.DRAG_TARGET.BODY,index,e)}}
									onDrag={(e) => {that.onDrag(Define.DRAG_TARGET.BODY,index,e)}}
									handle=".contents-item-body"
								>
									<div
										key={`data-${index}`}
										className="contents-item-body"
										style={
											{
												width : data.width * that.state.horizontalScaleWidth,
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

										defaultPosition={{x:data.time * that.state.horizontalScaleWidth, y : data.name * Define.SCALE_VERTICAL_HEIGHT}}
										position={{x:data.time * that.state.horizontalScaleWidth, y : data.name * Define.SCALE_VERTICAL_HEIGHT}}
										onStart={(e) => {that.onDragStart(Define.DRAG_TARGET.LEFT,index,e)}}
										onDrag={(e) => {that.onDrag(Define.DRAG_TARGET.LEFT,index,e)}}
										onStop={(e) => {that.onDragStop(Define.DRAG_TARGET.LEFT,index,e)}}
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

										defaultPosition={{x:data.time * that.state.horizontalScaleWidth + data.width * that.state.horizontalScaleWidth - 7, y : data.name * Define.SCALE_VERTICAL_HEIGHT}}
										position={{x:data.time * that.state.horizontalScaleWidth + data.width * that.state.horizontalScaleWidth - 7, y : data.name * Define.SCALE_VERTICAL_HEIGHT}}
										onStart={(e) => {that.onDragStart(Define.DRAG_TARGET.RIGHT,index,e)}}
										onStop={(e) => {that.onDragStop(Define.DRAG_TARGET.RIGHT,index,e)}}
										onDrag={(e) => {that.onDrag(Define.DRAG_TARGET.RIGHT,index,e)}}

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

const ContentsVerticalScale = ({that}) => {
	return (
		<ul className="scale-contents-vertical">
	    {ContentsVerticalScales}
	  </ul>
	)
}

const ContentsVerticalScales = scaleDatas.map(
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

const ContentsHorizontalScale = ({that}) => {
	return (
		<ul className="scale-contents-horizon">
	    {ContentsHorizontalScales}
	  </ul>
	)
}

const SidebarScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}>{item.text}</li>
	}
);

const ContentsHorizontalScales = scaleDatas.map(
	function(item,index){
  	return <li key={`item-${index}`}></li>
		}
);
