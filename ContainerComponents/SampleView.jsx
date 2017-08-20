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
		this.state = {
			contentsDataTimeMax : 0,
			contentsDataMap : [],
			draggingTarget : Define.DRAG_TARGET.NONE,
			scaleIndex : Define.SCALE_HORIZONTAL_WIDTH_DEFAULT_INDEX,
		};

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragStop  = this.onDragStop.bind(this);
		this.onDrag      = this.onDrag.bind(this);

		this.setContentsData = this.setContentsData.bind(this);
		this.scaleZoomIn = this.scaleZoomIn.bind(this);
		this.scaleZoomOut = this.scaleZoomOut.bind(this);

		this.setDatas = this.setDatas.bind(this);
		this.addData = this.addData.bind(this);
		this.removeData = this.removeData.bind(this);
		this._addData = this._addData.bind(this);

		this.beforeMouseX = 0;

		{
			var contentsDatas = [];
			for( var i = 0 ; i < 10;i++){
				contentsDatas.push( { key:i%5, data: "on" ,  time: i*1000,     width:2000 } );
				contentsDatas.push( { key:i%5, data: "off" , time: (i+2)*1000, width:2000 } );
			}
			contentsDatas.push( { key:0%5, data: "on" ,  time: 0*1000,     width:2000 } );
			this.setDatas(contentsDatas);
		}

	}

	componentDidUpdate(prevProps, prevState){
	}

	componentDidMount(){
	}

	addData(data){
		console.log("addData");
		this._addData(data);
		this.setState(
			{
				contentsDataTimeMax : this.state.contentsDataTimeMax,
				contentsDataMap : this.state.contentsDataMap
			}
		);
	}

	removeData(key,index){
		if( this.state.contentsDataMap[key] ){
			if( this.state.contentsDataMap[key][index] ){
				var timeMax = this.state.contentsDataMap[key][index].time + this.state.contentsDataMap[key][index].width;
				this.state.contentsDataMap[key].splice(index,1);

				if( timeMax == this.state.contentsDataTimeMax ){
					this.state.contentsDataTimeMax = 0;
					for( var key in Object.keys(this.state.contentsDataMap) ){
						for( var i = 0 ; i < this.state.contentsDataMap[key].length ; i++ ){
							var targetTimeMax = this.state.contentsDataMap[key][i].time + this.state.contentsDataMap[key][i].width;
							if( targetTimeMax > this.state.contentsDataTimeMax ){
								this.state.contentsDataTimeMax = targetTimeMax;
							}
						}
					}
					this.setState(
						{
							contentsDataTimeMax : this.state.contentsDataTimeMax,
							contentsDataMap : this.state.contentsDataMap
						}
					);
				}else{
					this.setState(
						{
							contentsDataMap : this.state.contentsDataMap
						}
					);
				}
			}
		}
	}

	setDatas(datas){
		this.state.contentsDataTimeMax = 0;
		this.state.contentsData = [];

		for( var i = 0 ; i < datas.length ; i++ ){
			this._addData(datas[i]);
		}

		this.setState(
			{
				contentsDataTimeMax : this.state.contentsDataTimeMax,
				contentsDataMap : this.state.contentsDataMap
			}
		);
	}

	_addData(data){
		var key = data.key;
		if( !this.state.contentsDataMap[ key ] ){
			this.state.contentsDataMap[ key ] = [];
		}
		var insertIndex = this.state.contentsDataMap[ key ].length;
		for( var i = 0 ; i < this.state.contentsDataMap[ key ].length ; i++ ){
			if( data.time == this.state.contentsDataMap[ key ][ i ].time ){
				data.time++;
			}else if( data.time < this.state.contentsDataMap[ key ][ i ].time ){
				insertIndex = i;
				break;
			}
		}
		this.state.contentsDataMap[ key ].splice(insertIndex,0,data);

		if( data.time + data.width > this.state.contentsDataTimeMax ){
			this.state.contentsDataTimeMax = data.time + data.width;
		}
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
					newTime += deltaX/Define.SCALE_HORIZONTAL[ this.state.scaleIndex ].pxPerUs;
				}
				break;
				case Define.DRAG_TARGET.RIGHT :
				{
					newWidth += deltaX/Define.SCALE_HORIZONTAL[ this.state.scaleIndex ].pxPerUs;
				}
				break;
				case Define.DRAG_TARGET.LEFT :
				{
					newWidth -= deltaX/Define.SCALE_HORIZONTAL[ this.state.scaleIndex ].pxPerUs;
					newTime += deltaX/Define.SCALE_HORIZONTAL[ this.state.scaleIndex ].pxPerUs;
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

	scaleZoomIn(){
		var newScale = this.state.scaleIndex + 1;
		if( newScale < Define.SCALE_HORIZONTAL.length ){
			this.setState(
				{
					scaleIndex : newScale
				}
			);
		}
	}

	scaleZoomOut(){
		var newScale = this.state.scaleIndex - 1;
		if( newScale >= 0 ){
			this.setState(
				{
					scaleIndex : newScale
				}
			);
		}
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
			<SampleViewBody that={this} dataMap={this.state.contentsDataMap}/>
		);
	}
}



var scaleDatas = [];

{
	for( var i = 0 ; i < 1000;i++){
		scaleDatas.push( { text: i } );
	}
}


const SampleViewBody = ({that,dataMap}) => {
	return (
			<div id='sample-view-body'>
				<div className='scrollable-contents-area'>
					<div className='scrollable-contents-top-left' />
					<div className='scrollable-contents-body'>
						<Header  that={that} />
						<Sidebar indexes={ Object.keys( dataMap ) } />
						<div className='scrollable-contents'>
							<ContentsVerticalLines that={that} />
							<ContentsHorizontalLines that={that} />
							<ContentsItems that={that} dataMap={dataMap}/>
						</div>
					</div>
					<Button bsStyle="warning" className="button0" onClick={(e) => { that.scaleZoomOut(); }} >-</Button>
					<Button bsStyle="primary" className="button1" onClick={(e) => { that.scaleZoomIn(); }} >+</Button>
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
						x          : data.time * Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].pxPerUs-6,
						y          : i * Define.SCALE_VERTICAL_HEIGHT,
					},
					{
						dragTarget : Define.DRAG_TARGET.RIGHT,
						className : "handle contents-item-right-bar "+( (that.state.draggingTarget === Define.DRAG_TARGET.BODY)? "hidden" : "" ),
						style : {},
						x          : ( data.time + data.width ) * Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].pxPerUs - 1,
						y          : i * Define.SCALE_VERTICAL_HEIGHT,
					},
					{
						dragTarget : Define.DRAG_TARGET.BODY,
						className  : "handle contents-item-body ",
						style      : { width : data.width * Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].pxPerUs },
						x          : data.time * Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].pxPerUs,
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


const Sidebar = ({indexes}) => {
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


const Header = ({that}) => {
	return (
		<div className='scrollable-contents-header'>
			<VerticalLists
				isHeader={true}
				scale={ Define.SCALE_HORIZONTAL[ that.state.scaleIndex ] }
				maxTime={that.state.contentsDataTimeMax}
				keyLength={Object.keys(that.state.contentsDataMap).length}
			/>
		</div>
	)
}


const ContentsHorizontalLines = ({that}) => {
	var li = [];
	{
		var usPerScale = Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].usPerScale;
		var pxPerUs = Define.SCALE_HORIZONTAL[ that.state.scaleIndex ].pxPerUs;
		var pxPerScale = pxPerUs * usPerScale;

		var scaleNum;
		{
			scaleNum = that.state.contentsDataTimeMax/usPerScale;
			scaleNum += 15 - scaleNum % 10;
		}
		var style = {
			width: scaleNum * pxPerScale
		};

		for(var i = 0 ; i < Object.keys(that.state.contentsDataMap).length ; i++){
			li.push( <li key={`item-${i}`} style={style}></li> );
		}
	}
	return (
		<ul className="scale-contents-horizon">
			{li}
		</ul>
	)
}

const ContentsVerticalLines = ({that}) => {
	return (
	 	<VerticalLists
	 		isHeader={false}
			scale={ Define.SCALE_HORIZONTAL[ that.state.scaleIndex ] }
			maxTime={ that.state.contentsDataTimeMax }
			keyLength={ Object.keys(that.state.contentsDataMap).length }
		/>
	);
}


const VerticalLists = ({scale, maxTime, keyLength, isHeader}) => {
	var lis = [];
	{
		var usPerScale = scale.usPerScale;
		var pxPerUs = scale.pxPerUs;
		var pxPerScale = pxPerUs * usPerScale;

		var height = keyLength * Define.SCALE_VERTICAL_HEIGHT;

		var scaleNum;
		{
			scaleNum = maxTime/usPerScale;
			scaleNum += 15 - scaleNum % 10;
		}
		for(var i = 0 ; i < scaleNum ; i++){
			if( isHeader ){
				lis.push( <HeaderScaleLi key={`item-${i}`} pxPerScale={pxPerScale} us={i*usPerScale} isLast={(i > scaleNum - 5 )} /> );
			}else{
				lis.push( <ContentsVerticalLine key={`item-${i}`} pxPerScale={pxPerScale} height={height} /> );
			}
		}
	}
	if( isHeader ){
		return (
			<ul className="scale-header" >
				{lis}
			</ul>
		);
	}else{
		return (
			<ul className="scale-contents-vertical">
				{lis}
			</ul>
		);
	}
}

const HeaderScaleLi = ({pxPerScale,us,isLast}) => {
	var style = {
		width : pxPerScale,
	};
	var labelStyle;
	{
		if( isLast ){
			labelStyle = {
				width: pxPerScale*10,
				left : -pxPerScale*10,
			};
		}else{
			labelStyle = {
				width: pxPerScale*10,
				left : -pxPerScale*5,
			};
		}
	}
	var scaleText="";
	{
		var usStr=""+us;
		var scale;
		var scaleUnitTime = Math.pow(10,usStr.length-1);
		switch( usStr.length ){
			case 1:
			case 2:
			case 3: scaleUnitTime = 1; scale = "us"; break;
			case 4:
			case 5:
			case 6: scaleUnitTime = 1000; scale = "ms"; break;
			case 7:
			case 8:
			case 9:
			default : scaleUnitTime = 1000000 ;scale = "s"; break;
		}
		scaleText = us / scaleUnitTime + scale;
	}
	return <li style={style} ><div className="label" style={labelStyle}>{scaleText}</div></li>
}

const ContentsVerticalLine = ({pxPerScale,height}) => {
	var style = {
		width : pxPerScale,
		height : height,
	};
	return <li style={style} ></li>
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
