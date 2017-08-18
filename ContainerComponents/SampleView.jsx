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
		var contentsDataMap = [];
		{
			var contentsDatas = [];
			for( var i = 0 ; i < 10;i++){
				contentsDatas.push( { key:i%5, data: "on" ,  time: i ,  width:2 } );
				contentsDatas.push( { key:i%5, data: "off" , time: i+2, width:2 } );
			}
			{
				for( var i = 0 ; i < contentsDatas.length ; i++ ){
					var key = contentsDatas[i].key;
					if( !contentsDataMap[ key ] ){
						contentsDataMap[ key ] = [];
					}
					contentsDataMap[ key ].push( contentsDatas[i] );
				}
			}
		}
		this.state = {
		 contentsDataMap : contentsDataMap,
		 draggingTarget : Define.DRAG_TARGET.NONE,
		 horizontalScaleWidth : Define.SCALE_HORIZONTAL_WIDTH,
		};

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragStop  = this.onDragStop.bind(this);
		this.onDrag      = this.onDrag.bind(this);

		this.setContentsData = this.setContentsData.bind(this);

		this.beforeMouseX = 0;
	}

	componentDidUpdate(prevProps, prevState){
	}

	componentDidMount(){
	}

	onDragStart( target, key, index, e ){
		this.beforeMouseX = e.clientX;
		this.setState( { draggingTarget : target } );
	}

	onDragStop( target, key, index, e ){
		var beforeTime = this.state.contentsDataMap[key][index].time;
		var beforeWidth = this.state.contentsDataMap[key][index].width;

		var newTime = beforeTime;
		var newWidth = beforeWidth;

		var deltaX = e.clientX - this.beforeMouseX;
		this.beforeMouseX = e.clientX;
		{
			switch(target){
				case Define.DRAG_TARGET.BODY :
				{
					newTime += deltaX/this.state.horizontalScaleWidth;
				}
				break;
				case Define.DRAG_TARGET.RIGHT :
				{
					newWidth += deltaX/this.state.horizontalScaleWidth;
				}
				break;
				case Define.DRAG_TARGET.LEFT :
				{
					newWidth -= deltaX/this.state.horizontalScaleWidth;
					newTime += deltaX/this.state.horizontalScaleWidth;
				}
				break;
			}
		}
		{ /* データの整合性チェック */
			newWidth = Math.round(newWidth);
			newTime = Math.round(newTime);
			if( newWidth < 0 ){
				newWidth = 0;
				if( newTime != beforeTime ){
					newTime = beforeTime + (beforeWidth - newWidth);
				}
			}
			if( newTime < 0 ){
				newTime = 0;
				if( newWidth != beforeWidth ){
					newWidth = beforeWidth + beforeTime - newTime;
				}
			}
		}
		this.setContentsData( key, index, newTime, newWidth );

		this.setState(
			{
				contentsDataMap  : this.state.contentsDataMap,
				draggingTarget   : Define.DRAG_TARGET.NONE
			}
		);
	}

	onDrag( target, key, index, e ){
		/* ドラッグが重かったらここを消す */
//		this.onDragStop(target, key, index, e);
	}

	setContentsData( key,index,time,width ){
		var targetData = this.state.contentsDataMap[key][index];
		var previousData = this.state.contentsDataMap[key][index-1];
		var nextData = this.state.contentsDataMap[key][index+1];
		if( null != time ){
			var oldTime = targetData.time;
			if( time < oldTime ){
				if( previousData ){
					if(
							targetData.data === Define.DATA.OFF
							|| targetData.data === Define.DATA.ON
					){
							if( time <= previousData.time ){
								this.setContentsData(key, index-1, time-1, null);
							}
					}
				}
			}
			if( time > oldTime ){
				if( nextData ){
					if(
							targetData.data === Define.DATA.OFF
							|| targetData.data === Define.DATA.ON
					){
							if( time >= nextData.time ){
								this.setContentsData(key, index+1, time+1, null);
							}
					}
				}
			}
			targetData.time = time;
		}
		if( null != width ){
			targetData.width = width;
		}
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
					<div className='scrollable-contents-body'>
						<HeaderScale  that={that} />
						<SidebarScale indexes={ Object.keys(that.state.contentsDataMap) } />
						<div className='scrollable-contents'>
							<ContentsVerticalScale that={that} />
							<ContentsHorizontalScale that={that} />
							<ContentsItems that={that} dataMap={that.state.contentsDataMap}/>
						</div>
					</div>
					<Button bsStyle="warning" className="button0" onClick={(e) => {that.setState({ horizontalScaleWidth : that.state.horizontalScaleWidth/10 })}} >-</Button>
					<Button bsStyle="primary" className="button1" onClick={(e) => {that.setState({ horizontalScaleWidth : that.state.horizontalScaleWidth*10 })}} >+</Button>
				</div>
			</div>
	)
}

const ContentsItems = ({that,dataMap}) => {
	var items = [];
	{
		var keys = Object.keys(dataMap);
		for(var i = 0 ; i < keys.length ; i++ ){
			var key = keys[i];
			for( var j = 0 ; j < dataMap[key].length ; j++ ){
				var data = dataMap[key][j];
				var itemPartsConfig = [
					{
						dragTarget : Define.DRAG_TARGET.LEFT,
						className : "handle contents-item-left-bar "+( (that.state.draggingTarget === Define.DRAG_TARGET.BODY)? "hidden" : "" ),
						style : {},
						x          : data.time * that.state.horizontalScaleWidth-6,
						y          : i * Define.SCALE_VERTICAL_HEIGHT,
					},
					{
						dragTarget : Define.DRAG_TARGET.RIGHT,
						className : "handle contents-item-right-bar "+( (that.state.draggingTarget === Define.DRAG_TARGET.BODY)? "hidden" : "" ),
						style : {},
						x          : ( data.time + data.width ) * that.state.horizontalScaleWidth - 1,
						y          : i * Define.SCALE_VERTICAL_HEIGHT,
					},
					{
						dragTarget : Define.DRAG_TARGET.BODY,
						className  : "handle contents-item-body ",
						style      : { width : data.width * that.state.horizontalScaleWidth },
						x          : data.time * that.state.horizontalScaleWidth,
						y          : i * Define.SCALE_VERTICAL_HEIGHT,
					}
				];

				items.push(
					<div key={`dragable-${key}-${j}`} className={"contents-item "+ data.data}>
						<ContentsItemParts that={that} partsConfig={itemPartsConfig[0]} keyword={key} index={j} data={dataMap[key][j]} />
						<ContentsItemParts that={that} partsConfig={itemPartsConfig[1]} keyword={key} index={j} data={dataMap[key][j]} />
						<ContentsItemParts that={that} partsConfig={itemPartsConfig[2]} keyword={key} index={j} data={dataMap[key][j]} />
					</div>
				)
			}
		}
	}

	return (
		<div className="contents-items">
			{items}
		</div>
	)
};


const ContentsItemParts = ({that, partsConfig, keyword, keyIndex, index, data}) => (
	<Draggable
		axis="x"
		handle=".handle"

		defaultPosition={ { x: partsConfig.x, y: partsConfig.y  } }
		position=       { { x: partsConfig.x, y: partsConfig.y } }
		onStart=        { (e) => {that.onDragStart( partsConfig.dragTarget, keyword, index, e)}}
		onStop=         { (e) => {that.onDragStop(  partsConfig.dragTarget, keyword, index, e)}}
		onDrag=         { (e) => {that.onDrag(      partsConfig.dragTarget, keyword, index, e)}}
	>
		<div
			className={partsConfig.className}
			style={ partsConfig.style }
		>
		</div>
	</Draggable>
);


const SidebarScale = ({indexes}) => {
	var li = [];
	{
		for(var i = 0 ; i < indexes.length ; i++){
			li.push( <li key={`sidebar-scale-${i}`}>{indexes[i]}</li> );
		}
	}
	return (
		<div className='scrollable-contents-sidebar'>
			<ul className="scale-sidebar">
				{li}
			</ul>
		</div>
	)
}


const HeaderScale = ({that}) => {
	var li = [];
	{
		var style = {
			width:that.state.horizontalScaleWidth,
			visibility: (that.state.horizontalScaleWidth==10)?"visible":"hidden",
		};
		for(var i = 0 ; i < scaleDatas.length ; i++){
			li.push( <li key={`item-${i}`} style={style} >{scaleDatas[i].text}</li> );
		}
	}
	return (
		<div className='scrollable-contents-header'>
			<ul className="scale-header">
				{li}
		  </ul>
		</div>
	)
}


const ContentsHorizontalScale = ({that}) => {
	var li = [];
	{
		for(var i = 0 ; i < scaleDatas.length ; i++){
			li.push( <li key={`item-${i}`} ></li> );
		}
	}
	return (
		<ul className="scale-contents-horizon">
			{li}
	  </ul>
	)
}

const ContentsVerticalScale = ({that}) => {
	var li = [];
	{
		var style = {
			width:that.state.horizontalScaleWidth,
			visibility: (that.state.horizontalScaleWidth==10)?"visible":"hidden",
		};
		for(var i = 0 ; i < scaleDatas.length ; i++){
			li.push( <li key={`item-${i}`} style={style} ></li> );
		}
	}
	return (
		<ul className="scale-contents-vertical">
			{li}
	  </ul>
	)
}
